---
layout: post
title: Thread Stacks
subtitle: 4 a.m. -  know where your stack pointer is?
categories: osdev
---

Since the x86 architecture has relatively few processor registers, a
programmer may need additional space to store temporary values. For most
compilers and languages, this space is the stack. C, for example, (gcc
and clang at least) uses the stack to store local variables, function
arguments and return addresses. In other words, the stack comes in use
every time there is a function call.

The common way a function call is handled by a c compiler is this:
- Push each argument to the stack (in reverse order)
- Execute the `CALL` instruction (which pushes the address of the next
instruction to the stack and jumps to the callee)

The callee does the following:
- Push the base pointer to the stack
- Sets the base pointer to the current stack pointer
- Subtracts the stack pointer to reserve place for local variables.
- Do its thing
- Increase the stack pointer to free the space used by local variables.
- Pop the base pointer from stack.
- Execute the `RET` instruction (which puts the return value in EAX and
jumps to the position at the top of the stack.

While the callee is doing its thing it now has access to all the pushed
arguments at addresses (ebp + 8) and forwards and all local variables
at addresses up to ebp. The return address is reachable at (ebp + 4) if
you'd ever want that.

This convention makes it really easy to have functions which takes an
undefined number of arguments, like `printf` does.

###Stacks in context switching
It also makes for really simple _context switching_.
Since the return address is stored on the stack, if you were to switch
stacks inside a function, when you return, you'll be somewhere else.
This is a common way of making usermode threads. Ponder the following:

	void switch_thread()
	{
		push_all_registers();
		switch_stack_pointer();
		pop_all_registers();
		return;
	}
	 
	void a()
	{
		while(1)
		{
			do_something();
			switch_thread();
		}
	}

	void b()
	{
		while(1)
		{
			do_something_else();
			switch_thread();
		}
	}

Imagine two threads - __A__ and __B__ running, __A__ runs `a()` and __B__
runs `b()`. Each has a stack somewhere in memory, and __A__ is currently
running. The top of the stacks looks like:

	                           +-----------------------+
	                           |switch_stack_pointer RA|
	                           |all registers          |
	+----------ESP----------+  |switch_thread RA       |
	|a RA                   |  |b RA                   |
	|          ...          |  |          ...          |
{: .nopretty}
where `RA` means Return Address and `ESP` is where the stack pointer is
currently pointing.
As execution of __A__ continues, the processor will `do_something()` and
then call `switch_thread()`...

	                           +-----------------------+
	                           |switch_stack_pointer RA|
	+----------ESP----------+  |all registers          |
	|switch_thread RA       |  |switch_thread RA       |
	|a RA                   |  |b RA                   |
	|          ...          |  |          ...          |
{: .nopretty}
`switch_thread()` pushes all registers to the stack and calls
`switch_stack_pointer()`

	+----------ESP----------+  +-----------------------+
	|switch_stack_pointer RA|  |switch_stack_pointer RA|
	|all registers          |  |all registers          |
	|switch_thread RA       |  |switch_thread RA       |
	|a RA                   |  |b RA                   |
	|          ...          |  |          ...          |
{: .nopretty}
`switch_stack_pointer()` performs some scheduling to find out which
thread is to run next, and then switches the stack pointer over to the
top of __B__'s stack.

	+-----------------------+  +----------ESP----------+
	|switch_stack_pointer RA|  |switch_stack_pointer RA|
	|all registers          |  |all registers          |
	|switch_thread RA       |  |switch_thread RA       |
	|a RA                   |  |b RA                   |
	|          ...          |  |          ...          |
{: .nopretty}
The processor keeps on executing code, and `switch_stack_pointer()` soon
returns

	+-----------------------+
	|switch_stack_pointer RA|  +----------ESP----------+
	|all registers          |  |all registers          |
	|switch_thread RA       |  |switch_thread RA       |
	|a RA                   |  |b RA                   |
	|          ...          |  |          ...          |
{: .nopretty}
`switch_thread()` pops all registers and returns...

	+-----------------------+
	|switch_stack_pointer RA|
	|all registers          |
	|switch_thread RA       |  +----------ESP----------+
	|a RA                   |  |b RA                   |
	|          ...          |  |          ...          |
{: .nopretty}
... and we're now in `b()` with all registers of __B__ loaded.

###Stacks in the kernel
When an interrupt or exception happens in user mode, [a new stack is
loaded from the tss](/blog/2012/08/Return-To-Kernel-Mode/) and
(usually) all registers are pushed onto it before the kernel starts the
__Interrupt Service Routine__.

Wait... _all registers are pushed onto it_? I like the sound of that.
That's, like, half the work of changing threads, right? Right!

If you've been following a kernel development tutorial (like [James
Molloys](http://www.jamesmolloy.co.uk/tutorial_html/) or [Brandon
Friesens](http://www.osdever.net/bkerndev/Docs/title.htm)) you probably
have something like this to handle interrupts:

	int_stub:
		pusha
		 
		xor eax, eax
		mov ax, ds
		push eax
		 
		mov eax, 0x10
		mov ds, ax
		mov es, ax
		mov fs, ax
		mov gs, ax
		 
		call int_handler
		 
		pop eax
		mov ds, ax
		mov es, ax
		mov fs, ax
		mov gs, ax
		 
		popa
		 
		add esp, 8
		 
		iret
{: .lang-nasm}

	void int_handler(registers_t r)
	{
		do_stuff();
	}

In fact, if you've been following one of those tutorials, you probably
have the above code twice, for some reason...

Anyway. This would take care of both pushing and poping all registers,
and with only a small modification, it becomes very easy to switch the
stacks too...

	int_stub:
		pusha
		 
		xor eax, eax
		mov ax, ds
		push eax
		 
		mov eax 0x10
		mov ds, ax
		mov es, ax
		mov fs, ax
		mov gs, ax
		 
		push esp ;Pass stack pointer to int_handler
		call int_handler
		mov esp, eax ;int_handler returns a new stack pointer
		 
		pop eax
		mov ds, ax
		mov es, ax
		mov fs, ax
		mov gs, ax
		 
		popa
		 
		add esp, 8
		 
		iret
{: .lang-nasm }

	registers_t *int_handler(registers_t *r)
	{
		do_stuff();
		r = get_next_thread(r);
		return r;
	}

This gives a pointer to the threads registers as input to the ISR and
expect a pointer to some registers in return. They may or may not be the
same.

###Keeping track of the stacks
The saved registers are a large part of what defines each thread, but
there are actually a few things more that are needed.

First of all, the kernel may want some extra information associated
with each thread, such as scheduling information and a list of signal
handlers.

Sometimes a thread in user mode will need help from the kernel which
it cannot offer immediately. The thread may for example issue a read
request to a file that's on a drive which has some spin-up time before
it can be read. The kernel may then switch to another thread while the
disk spins up. Therefore it's a good idea to have a separate kernel
stack space for each thread.

With some thought, those three things can be easily combined into a
single data structure. So let's think about it for a while.

While the thread is running we want some information stored somewhere in
kernel space about it.

	+-----------------------+
	|thread information     |
	+-----------------------+
{: .nopretty}

Then, when an interrupt or syscall happens, a new stack is loaded
and some stuff is pushed onto it. If we want this near our thread
information it will have to go right before it, since the stack grows
backwards.

	+-----------------------+
	|thread registers       |
	|thread information     |
	+-----------------------+
{: .nopretty}

Finally, we want the kernel mode stack. Well... the stack pointer is
right at the start of the registers now, so why not just continue the
stack from there?

	+-----------------------+
	|   ...                 |
	|kernel mode stack      |
	|thread registers       |
	|thread information     |
	+-----------------------+
{: .nopretty}

###Setting this up
To set this up, the thread information structure has to be set up
something like:

	struct thread_info_struct
	{
		uint8_t stack_space[KERNEL_STACK_SIZE];
		registers_t r;
		struct thread_data_struct thread_data;
	} my_thread_info;

When the thread is running in user mode, the TSS should be set up in
such a way that the stack pointer loaded at an interrupt points to the
end of the registers, i.e. the beginning of the thread data.

	TSS.esp0 = &my_thread_info.thread_data;

And that's really all there is to it. Unbelievable, really, how many
years it took for me to figure this out.

In the process, I've found inspiration in [Rhombus by Nick
Johnson](https://github.com/nickbjohnson4224/rhombus/) and 
[linux](http://www.linux.org).

###Some considerations
In order to do the actual switching of threads, I implemented a special
syscall which can be called only from kernel mode.

Let's say a user mode program calls `yield()`. This performs a syscall
in the form of an interrupt instruction `INT 0x80` and thus we jump into
the kernel.

The kernel performs some housekeeping and selects a new thread to run.
It then performs the special switching interrupt `INT 0x82`.

Since we're already in kernel mode, no new stack is loaded but the
registers are pushed onto the old one. The top of the kernel stack will
then contain a `registers_t` structure and a pointer to it is saved in
a `kernel_stack` variable in the `thread_data` portion of the thread
information structure.

Next, the thread information structure of the new thread is read and
the `kernel_stack` pointer from it is returned to the `int_stub` as
above. The `IRET` instruction brings us back to wherever we were before
(probably in kernel mode, but could as well be user mode). If the new
thread was swapped out while in kernel mode, it will carry on from
wherever it was and eventually return to user mode.

This way of handling kernel stacks also makes for really clean nesting
of interrupts.

###Usage
This method has been implemented in git commit
[756852fc66](https://github.com/thomasloven/os5/tree/756852fc66b80b1e605
8d74b8dc334ad841ec5ea)

###A warning
I recently learned - the hard way - that the [clang
compiler](http://clang.llvm.org) does not use this calling convention
for functions which do not in turn call other functions. I.e

	int double_integer(int a)
	{
		return 2*a;
	}

	int main(int argc, char **argv)
	{
		double_integer(5);
	}

If this code is compiled with clang `double_integer` will (in some
cases) not push `ebp` to stack.

This severely hinders many debuggers and should be considered a bug in
my oppinion.
