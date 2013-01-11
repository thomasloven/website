---
layout: post
title: Recursive Page Directory
subtitle: Basic memory management 2/3
categories: osdev
---

###Memory management part 2
As discussed in [Memory Page Stack](/blog/2012/06/Memory-Page-Stack) one can
divide memory management into three parts.

This post regards the second part, the Virtual Memory Manager (VMM).

###Paging
In the x86 architecture, one normally uses a two-step paging algorithm.

In the [previous post](/blog/2012/06/Memory-Page-Stack) we imagined a computer
with really really small memory pages. Now imagine that this computer has an
even equally small virtual memory space - 16 pages in total. Those 16 pages are
divided into four groups and this is our key to addressing them.

![VMM1](/media/img/vmm1.png)

Above, we see the address space of our imagined computer illustrated as 16 blue
squares.  Let's say the processor wishes to access the sixth page and that
paging is enabled. The sixth page belongs to the second group of pages and is
the second page in that group.

Now the Memory Management Unit (MMU) of the processor kicks in and takes a look
in a certain processor register. This register contains the (physical) address
of the Page Directory (step I). Since we want the second group, it reads the
second entry from the page directory and this gives the physical address of
a page table (step II). We want the second page in that group, so the MMU reads
the second entry in the page table and this gives the physical address of the
memory page we want (step III).

What makes paging so great is that the whole process is completely transparent
to the processor. The user will never know when a memory read or write
operation crosses a page boundary, and by changing the entries in the page
directory and tables you can get a contiguous memory area anywhere in the
virtual address space without having to worry about fragmentation of the
physical memory.

###Recursive page directory
Paging lets you easily decide what parts of memory the processor has access to
and it can be dynamically changed by changing the contents of the page
directory and page tables. Of course, that requires you to keep track of where
those are, but a neat little trick makes that really easy.

The trick consists of setting the last entry in the page directory to point to
the page directory itself.

Let's say we did this, and that the processor wishes to access the 14th page in
virtual memory - that is the second page in the fourth group. The MMU starts by
looking up the fourth group in the page directory. It finds the address of the
page directory and assumes this is the page table for the group. It caries on,
looking up the second entry in this 'page table' and gets the address of the
page it wants. This happens to be the address of the page table for the second
group.  ![VMM2](/media/img/vmm2.png)

In other words, you can access any page table through a fixed address in
memory. But wait, it gets even better.

Let's look at what happens if we try to access the very last page in the
virtual memory. The MMU will look up the last entry in the page directory and
get the address of the page directory. It will then look up the last entry in
the page directory and get the address of the page directory (that's not a typo
- I meant to write the same thing twice). This lets you access the page
directory too through a fixed memory address.  ![VMM3](/media/img/vmm3.png)

###Some considerations
An important question to put at this point is whether a recursive page
directory is really a good idea. 

In our imaginary computer with its really small address space, we notice that
the page table and directories now reserve a quarter of the entire available
virtual memory - which is of course incredibly wasteful. On a computer with
a 32 bit address bus the reserved area would be 1/1024 th of the available
address space, though, which is more reasonable. Then again, if your computer
has 4 gigabytes of physical RAM, this would mean there is four megabytes of it
that can't be used. Then again again, if you have easy access to your page
tables - such as through a recursive page directory - you can just page in
those 4 megabytes as needed. 

There are other simple ways of accessing the page directory and tables. For
example, if you just keep track of the page directory and one page table it's
a simple job to page in another table anywhere and read it.

The recursive page directory divides the OsDev community. I think it's a nice
tool, others don't.

###The addresses
Finally, if a recursive page directory is used on an x86, the following can be
used to access the page directories and tables:

	uint32_t *page_dir = 0xFFFFF000;
	uint32_t *page_tables = 0xFFC00000;
	 
	//addr = virtual address
	//phys = physical address (page alligned)
	//flags = access flags
	 
	page_dir[addr >> 22] = &page_tables[addr >> 12] | flags;
	page_tables[addr >> 12] = phys | flags;
{:.prettyprint}

###Git
A recursive page directory has been implemented in Git commit
[caed8cb8a0](https://github.com/thomasloven/os5/tree/caed8cb8a0e39a1e7d7d2594b86f25b887afab81).
Also implemented in the same commit is a physical memory manager with a free
page stack described in [this post](/blog/2012/06/Memory-Page-Stack)
