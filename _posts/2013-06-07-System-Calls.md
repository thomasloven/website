---
layout: post
title: System calls
subtitle: Bend the stack to your will
categories: osdev
---

System calls is the way user processes communicate to the kernel. Look
at the following program, for example.

	#include <stdio.h>

	int main(int argc, char **argv)
	{
		printf("Hello, world!");

		return 0;
	}

When you call the program, even before it is started, the shell makes a
couple of system calls such as `fork()` and `exec()`. The program itself
then makes several more system calls before the `write()` and `exit()`
system calls represented by the two lines in the code.

System calls can be performed in several ways, but one of the most
common is through a special software interrupt with the `int`
instruction. For example, linux and most unix-like hobby kernels I've
studied use `int 0x80`. That's also what I chose to use in my kernel.

Next is the problem of passing data. The simplest way is using
registers, and that's what most projects seem to use. For this, I chose
a combination of a single register and the processes own stack.

###Sample system call
Let's look at how `read()` would be implemented. I've not actually
implemented it in my kernel yet, but here's how it would work.

####User side
First the definition in the c library:

	int read(int file, char *ptr, int len)
	{
		return _syscall_read(file, ptr, len);
	}

Simply a wrapper for an assembly function:

	[global _syscall_read]
	_syscall_read:
		mov eax, SYSCALL_READ
		int 0x80
		mov [syscall_error], ebx
		ret
{: .lang-nasm}

This function puts an identifier for the system call in the `eax`
register and then execute the system call interrupt.

Of course, this can be simplified with a macro to

	[global _syscall_read]
	DEF_SYSCALL(read, SYSCALL_READ)
{: .lang-nasm}

####Kernel side

In the kernel, the system call is caught by the following function:

	registers_t *syscall_handler(registers_t *r)
	{
		if(syscall_handlers[r->eax])
			r = syscall_handlers[r->eax](r);
		else
			r->ebx = ERR_NOSYSCALL;
	
		return r;
	}

If the system call is registered correctly in the kernel (through the
macro `KREG_SYSCALL(read, SYSCALL_READ)`), this will pass everything
onto the following function:

	KDEF_SYSCALL(read, r)
	{
		process_stack stack = init_pstack();
	
		r->eax = kernel_read((int)stack[0], (char *)stack[1], (int)stack[2]);
	
		return r;
	}

Then the `kernel_read()` function has the same definition as the library version.

	int kernel_read(int file, char *ptr, int len)
	{
		...

The `init_pstack()` macro expands to `(unitptr_t *)(r->useresp + 0x4)`
and this lets us read the arguments passed to the system call from where
they are pushed on call.

This works for c compiled with the _cdecl_ calling convention. For other
languages or calling conventions, the asm functions will have to be
adjusted.

###Git
The methods described in this post has been implemented in git commit
[cea5ec765f](https://github.com/thomasloven/os5/tree/cea5ec765ff683dbcf3
116006c43a195245d9d6e).
