---
layout: post
title: Privilege Levels
subtitle: Lots of abbreviations ending in PL
categories: osdev
---

###Processor privilege level in Segmentation

The Intel x86 processor architecture has a number of features implemented to
protect the system from malicious code.  One of those features is the
__Privilege Levels__.

The privilege levels are a remnant of the times when memory segmentation was
popular.  With segmentation, the physical memory is divided into segments that
work as a kind of translation table. In Protected mode, if you call an address
like

	jmp CS:AX
{: .prettyprint .lang-nasm}

the processor looks into the currently loaded __Local__ or __Global Descriptor
Table__ ( __LDT__/ __GDT__) for the entry pointed to by _CS_. This enty (or
__Segment Descriptor__) describes the beginning of a segment which is combined
with the offset in _AX_ to get the physical address;

	physical_address = segment_descriptor_from_index(CS).base + AX;
{: .prettyprint}

The segment descriptor also has a limit, which in our example is the maximum
value _AX_ is allowed to take. If it's higher, you get a __Segmentation Fault__
(or segfault for short). Now you can start to see how this system makes for
a working memory protection scheme. By switching out the LDT, you can change
what part of physical memory is addressed by any Selector:Offset-pair and thus
give each task or process their own address space.

The segmentation scheme is now deprecated in favor of paging which offers more
fine-grained control and a greater level or transparency.

So, what about the privilege levels?
Well, the user program can switch its own segment selector values. However,
each segment has a protection level, given by the __Descriptor Privilege
Level__ ( __DLP__) in the segment descriptor. The processor has a __Current
Privilege Level__ ( __CPL__) which is given by the lowest two bits of _CS_. If
the program tries to switch a selector to a descriptor with a DPL that is lower
than the CPL, the processor throws a __General Protection Fault__.

###Processor privilege levels today

I mentioned that segmentation is deprecated in favor of paging, so why would
I care about it for a modern state-of-the-art operating system such as mine?

Firstly, the x86 architecture requires segmentation to access the entire
address space - most hobby OSes I've studied just keeps two segments (one for
code and one for data - processor requirement) for this, with base 0x0 and
a limit of 4 gb (in other words, they each cover the entire virtual address
space).

Secondly, there are other ways than segmentation where the CPL comes into play.
For example, in paging, if the supervisor bit of a page table entry is set, the
address can only be accessed if the processor is in CPL 0 (sometimes called
__ring 0__).

The privilege levels are also used to determine whether certain instructions
may be run, like _sti_, _lgdt_, _hlt_ and such.

Finally, the privilege levels determine which interrupts may be called with the
_int_ instruction (each interrupt descriptor in the IDT has an assigned DPL).

So there's still a point to keep privilege levels around for your hobby OS,
despite the problems they cause with segmentation and TSS and stuff.

###Changing the privilege level

Changing the CPL is actually two different problems.
- Increasing CPL
- Decreasing CPL

Increasing the CPL is relatively easy. It can be done either through a far jump

	JMP 0x1B:label
	label:
		; The CS selector is now 0x18 | 0x3
		; i.e. it points to segment no 3 (3*0x8) and CPL is set to 0x3
{: .prettyprint .lang-nasm}

or through the `IRET` instruction

###The IRET instruction

Let's change the topic for a minute and think about interrupts.
Say the processor is running in __Kernel Mode__ (Ring 0, CPL=0) and an
interrupt happens.  What the processor does then is:
- Push SS and ESP to stack
- Push EFLAGS to stack
- Push CS and EIP to stack
- Load CS and EIP from the IDT
and from there the interrupt handling routine takes over.

The interrupt handling routine does its thing and then runs the `IRET`
instruction. `IRET` makes the processor do the same thing as when an interrupt
happens, but _backwards_. I.e:
- Pop CS and EIP from stack
- Pop EFLAGS from stack
- Pop SS and ESP from stack
- Do stack stuff
- Far jump to CS:EIP

Notice that extra thing there? The "Do stack stuff"?

At that point, the processor checks the value of CS that is just popped. It
compares the __Requested Privilege Level__ ( __RPL__, last one - promise - I'm
not making these up, you know) in the bottom two bits of this to the CPL and if
it is higher it changes SS and ESP to the recently popped values. This is really
useful for software task switching.

So, you could easily get into a higher privilege level by intercepting
a handled interrupt and changing the value of CS on the stack. If you set the
bottom two bits to 0x3, you will soon be in User Mode.

An other (better in my opinion) option is to create a fake interrupt-pushed
stack and push that onto the stack before running `IRET` .

	// C code
	struct
	{
		uint32_t	esp;
		uint32_t	ss;
		uint32_t	eflags;
		uint32_t	eip;
		uint32_t	cs;
	} fake_stack;

	fake_stack.esp = usermode_stack_top;
	fake_stack.ss = user_data_segment | 0x3;
	fake_stack.eflags = 0;
	fake_stack.eip = &usermode_function;
	fake_stack.cs = user_code_segment | 0x3;
	
	set_all_segments(user_data_segment | 0x3);
	run_iret(&fake_stack);
{: .prettyprint}

	; Assembler code
	run_iret:
		add esp, 0x8
		iret
{: .prettyprint .lang-nasm}


###Going back to ring0

I was going to continue this blog post with talking about how to switch from
a higher CPL to a lower, but it is growing way longer than I thought it would.
Therefore I will cut it off here, and continue in a new post.

###Application
The methods described in this post is used in Git commit
[52a0c84739](https://github.com/thomasloven/os5/tree/52a0c84739e04f3d9dd7410cdf0b378118a946b4).

