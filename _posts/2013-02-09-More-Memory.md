---
layout: post
title: More Memory
subtitle: And processes
categories: osdev
---

The kernel has been multithreaded for quite a while, so now it's time to
make it multiprocessing.  Here's how I look at processes and threads in
single-processor systems.

###Thread
A thread or __thread of execution__ is the state of the processor at a
certain point.  That is, the thread is made up of

- processor registers
- instruction pointer
- stack pointer

By saving those and replacing with other previously saved values,
threads can be switched in and out of execution.  Each thread has its
own, unique stack.

###Process
A process is an isolated collection of threads.  That is:

- A process has one or more threads.
- The threads in a process share memory space
- The threads in one process can not access the memory of the threads
in another process

There are some exceptions to the third point, but that's another show.

Each process has an associated memory translation map which can be
switched out to switch the active process. Generally, the current thread
will have to be changed at the same time since its code and data will be
in another memory space.

The kernel code and data resides in the upper part of memory, from
`0xC0000000` and above and is common to all memory translation maps.
That means that a kernel thread can be switched in without changing the
process, and also that the process can be switched freely while a kernel
thread is running.

###Synchronizing Memory Translation maps

The x86 memory management unit (MMU) governs how the processor accesses
memory. When paging is enabled any call to any address during code
execution is translated from a _virtual address_ to a _physical
address_. I usually call the set of translation rules a _memory
translation map_.

Each process has its own assigned memory translation map. Two processes'
memory translation maps may in unlikely cases map the same physical
memory pages to the same virtual addresses, but the maps are still
considered unique.

The mapping of the kernel memory space is equal in all maps. This means
that as long as the processor is executing code in the kernel space,
the active memory translation map may be changed without worrying about
corrupting data, since there's no difference between them. It does cause
a problem though. If something changes in the kernel space, the same
change must happen in all memory translation maps.

The way memory is translated makes the problem a little bit smaller.
Since the x86 family uses two-tier paging and, again, kernel space is
the same for all maps, we can use the same page tables for all maps.
That means we only need to consider changes in the page directory which
happens significantly less frequently (a naïve approximation: 1024 times
less often).

Still, when a change is made to the page directory which corresponds to
an address in kernel space, the change needs to be propagated to all
page directories in the system. There are a few ways this can be done:

- Keep track of all memory translation maps and update them all at the
same time when something happens to the kernel space.
- When a new memory translation map is switched in, copy any changes
from the previous one.
- Keep a master memory translation map and update that when a change is
made, then propagate the changes on request.

The first method sounds like a lot of work. Keeping track of the memory
translation maps isn't very hard - they all belong to a process, and we
need to keep track of all processes anyway. Updating them, however could
take a lot of time. As I write this, I have 164 processes currently
running on my computer. That's 164 memory translation maps that should
be updated, some of which may be currently paged out and written to
disk.

The second method sounds feasible. During the switch, we are probably
doing things to both memory translation maps anyway, so why not add this
step? It does add some overhead, but shouldn't be too bad.

The third method also sounds feasible. But how do we know when the
changed part is requested? The answer is page faults. If a page fault
occurs in kernel space and it turns out to be caused by a missing page
directory entry, check the master page directory. If there is an entry
there, add it to the current page directory and you're good to go.

Unfortunately, this means we can only add new page directory entries and
never change or delete them, because that wouldn't cause a page miss the
next time. Also, all the kernel page tables would need to be kept in
memory at all times and never be paged out. The memory hit isn't too bad
on a modern system, but it seems a bit inelegant now that I think about
it.

###What to use?

This brings up one of the points to why I'm keeping this blog. It makes
me think about stuff.

Before I did the reset described in [a previous
post](/blog/2013/02/A-Step-Back/) I used the second method above. When I
wrote the new code, I came up with the third method and thought I should
try it out. Now I'm starting to have second thoughts, though...

I'll give it some more thought and we'll see how it turns out.

###Next step

Again, I'm starting to ramble and the post is getting long and
embarrassingly unstructured so I'll cut it off here.
What I'll save for the next post is how to keep track of the memory
space for the processes.

###Usage
The methods described in this post has been implemented in git commit
[fa9e5929ce](https://github.com/thomasloven/os5/tree/fa9e5929ce6adaf62e6a85df284690b31163a4f9)
