---
layout: post
title: Even More Memory
subtitle: And processes again
categories: osdev
---

I did say memory was an important part of what the operating system
does. Here's another post on it.

###Forking a process
By using a system call a process may __fork__ i.e. create a copy of
itself.

After the fork, the two processes (called __parent__ and __child__)
are totally separate and, unless specifically requested, should have
separate memory spaces.

There are two ways to assure this. One is to copy the entire memory
space when forking a process. Normally, right after forking, though,
the child process executes a new program and replaces its entire memory
space, which means the copying was just a waste of time.

The other way is to make the memory translation map of both the parent
and child process point to the same memory, but set to Read Only. Then
one page at a time can be copied only when either process tries to write
to it.

This method is known as __Copy on Write__.

###Keeping track on memory
Consider the following sequence of events

- Process A forks into process B
- Process B forks into process C
- Process C writes to address `0x1000`
- Process B writes to address `0x1000`
- Process A writes to address `0x1000`

What will happen to the memory?

In the first step, the memory translation map of process A is copied for
process B and all pages are marked as Read only (and marked for CoW).

In the next step, the memory translation map of process B is copied for
process C and all pages are marked as Read only and CoW.

Next, when process C tries to write, a page fault appears since the
memory is marked as read only. However, since the memory is also marked
for CoW, the page fault handler makes a copy of the requested page to
replace the one in process Cs memory translation map. But what about
process A and B? One method is to make copies for them too (or one copy
for B and let A have the original). Another, simpler, method is to do
nothing and keep them marked as Read only and CoW.

In the fourth step, when B tries to write, a page fault happens again
and another copy is made.

Finally, as A tries to write, a page fault happens again. This time,
the operating system should realize that there are no other processes
sharing the same page anymore, and just mark the page as Read/Write.

As you see, there's quite a bit of things to keep track of between forks
and page faults here.

Now, I never took any courses in data structures, and I'm sure there's a
known method for this, but here's how I do it.

###Process memory map

Each process structure in the kernel has an assigned memory map structure.
The memory map contains some information about the memory areas of the
currently running process (like where is the data, where is the code and
so on) and a pointer to a list of __memory areas__.

###Process memory areas

Each memory area describes a part of the process' memory. The size of
the part can go from `0` to the entire memory space. The memory area
structure thus has one field for the starting address of the area and
one for the end address. It also has a field describing the area type
and a flags field.

Each memory area belong in two doubly linked lists. One is the list of
memory areas belonging to a process. The other list is all copies of the
area.

Finally, each area has a pointer to its owning process.

Let's follow a memory area during the life of a process.

###Setup

Let's say we study an area which contains the stack of a shell program.
The area starts at `0xBFFFE000` and ends at `0xC0000000`. In other words, it is two memory pages long (assuming 4kb pages). It is currently set to Read/Write and is not shared with any other process.

###Forking

The user types

	> gcc hello_world.c

into the terminal and the shell program executes the `fork` system call.

This makes the kernel do a lot of things, one of which is create a new
memory map for the new process. It then clones all memory areas into the
new map.

The write flag of our area is unset and the CoW flag is set. The area is
then copied into the new map and the copies list is updated so that our
area and its copy can keep track of each other.

###Pushing to stack
Let's say the scheduler returns us to the child process when the fork is
complete.

The child process does some processing on the user entered command and
during this tries to write a value to the stack. Like in the example
above, this results in a page fault.

Now, we could make a copy of the entire area (which in this case would
not be a terrible waste since it's only two pages long) or we could
conserve a bit of memory by splitting out the page we want into a new
area and copy only that one.

Of course, the same split will have to be made with all copies of the
area.

When the split is finished, a copy is made of the requested page, it is
marked as read/write and controll is returned to the user process.

A while later, the parent process is scheduled in and it may also wish
to write to the stack. This time the area is already split in two, and
the required area has no copies, so it is just set as read/write and
we're done.

Actually, the parent process will probably perform a `waitpid` syscall
and sleep untill the child has finished, so let's go back to the child.

###Exiting
When the child process finishes, it frees all memory areas. When a page
marked CoW is requested, the first check performed by the kernel is
wether there actually are any other processes sharing the same area.
Otherwise, it just marks it as read/write and is done. Therefore, all
the child process needs to do is remove its own memory areas from the
list of copies and the parent will take care of the rest.

###Zero size areas
I said before that an area could have a zero size, i.e. the same start
and end address.

This is only useful in combination with a certain flag that allows the
area to grow automatically.

It could for example be used by a stack area which might originally
start at `0xC0000000` and end at `0xC0000000`. If an `uint32_t` is
pushed, the process will try to write to address `0xBFFFFFFC` which
results in a page fault.

The page fault handler will realize that theres a memory area right
above the address (say less than one page away) and that this area has
the autogrow flag enabled. It will then just expand the area and be
done.

The pros of this method is that we will never have to guess how large
the stack size should be. It will grow as neede (to an extent) or stay
at zero size if it's not needed.

###Git
The methods described in this post has been implemented in git commit
[cea5ec765f](https://github.com/thomasloven/os5/tree/cea5ec765ff683dbcf3
116006c43a195245d9d6e).
