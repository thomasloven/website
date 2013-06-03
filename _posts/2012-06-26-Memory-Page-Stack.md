---
layout: post
title: Memory Page Stack
subtitle: Basic memory management 1/3
categories: osdev
---

###Memory management
One of the most important tasks that the operating system has it to distribute
the resources of the computer. One of those are the memory.

I like to divide the memory management of the kernel into three main parts:

- Physical memory management - Keeps track of the pages of actual memory
- Virtual memory management - Keeps track of the virtual address spaces
- Heap management - Fine grained control of memory for kernel use only

This post is about a part of the physical memory manager. This simple version
keeps track of free pages of physical memory. When asked for a page, it hands
it out and forgets about it until it is handed back.

###Memory page stack
Pointers to the unused memory pages are stored on a stack and just popped off
when needed.

The stack does of course take up an amount of memory, but through an
interesting trick, this doesn't matter. You see, the memory where the stack is
stored is made up of memory pages and if enough pages are handed out to clear
an entire page in the stack, that page is next to be handed out.

Allow me to illustrate:
Imagine a computer with really really small memory pages - so small in fact
that each page only has room for four pointers. The figure below shows eight
physical pages of a such computer. The two leftmost pages are used by the
physical memory manager for the free page stack. The stack contains pointers to
the next five pages, who are free. The rightmost page is handed out.
![PMM1](/media/img/pmm1b.png){: .noborder .center}

When the _pmm_ receives a request for a memory page it will pop the topmost
entry from the stack and returns, in this case, the second rightmost page to
the caller.  ![PMM2](/media/img/pmm2b.png){: .noborder .center}

The next time the pmm receives a request for a memory page it will notice that
an entire page of the stack is empty and just being wasted, so it will shrink
its stack by one page-size and return the address of the page that previously
made up the top of the stack.  ![PMM3](/media/img/pmm3b.png){: .noborder .center}

Likewise, if the stack is full of pointers when a used page is handed back,
that page is used to increase the stack space. Through the use of virtual
memory and paging, the stack doesn't have to be contiguous in physical memory,
so any page can make up a part of the stack.

###Filling the stack
When the computer is booted up, the bootloader is asked to give the kernel
a map of the available memory. This is used to initialize the stack. The kernel
simply goes through the memory map returns each unused page it finds to the
pmm.

###Improvements
There's a lot more that can be done by the pmm. One major feature that will be
added at a later state is keeping track of how many users each page has. This
is useful if we wish to introduce shared memory or copy-on-write during forks.
Otherwise we risk that a page is returned and handed out again while someone
still think they have exclusive access to it. Not a good thing.

###Git
This page stack has been implemented in Git commit
[caed8cb8a0](https://github.com/thomasloven/os5/tree/caed8cb8a0e39a1e7d7d2594b86f25b887afab81).
Also implemented in the same commit is a virtual memory manager with recursive
page directories described in [this
post](/blog/2012/06/Recursive-Page-Directory).

__Note__: There's a bug in that commit. In short, when filling the stack, the pmm looks for memory map entries between `assert_higher(mmap_start)` and `mmap_start + mmap_size`. Where the `assert_higher` macro pretty much just adds `0xC0000000` to the adress. Well... I'm sure you see what the problem is.
The bug has been rectified in Git commit [ebaae73](https://github.com/thomasloven/os5/tree/ebaae7383bbadbfc3de62b1b14aa9a450d8e695c).
