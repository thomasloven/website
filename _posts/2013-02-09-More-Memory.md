---
layout: post
title: More Memory
subtitle: And processes
categories: osdev
---

The kernel has been multithreaded for quite a while, so now it's time to
make it multiprocessing. Here's how I look at processes and threads in
single-processor systems.

###Thread
A thread or __thread of execution__ is the state of the processor at a
certain point. That is, the thread is made up of

- processor registers
- instruction pointer
- stack pointer

By saving those and replacing with other previously saved values,
threads can be switched in and out of execution. Each thread has its
own, unique stack.

###Process
A process is an isolated collection of threads. That is:

- A process has one or more threads.
- The threads in a process share memory space
- Thre threads in one process can not access the memory of the threads
in another process

There are some exceptions to the third point, but that's another show.

Each process has an associated memory map which can be switched out to
switch the active process. Generally, the current thread will have to be
changed at the same time since its code and data will be in another
memory space.

The kernel code and data resides in the upper part of memory, from
`0xC0000000` and above and is common to all memory maps. That means that
a kernel thread can be switched in without changing the process, and
also that the process can be switched freely while a kernel thread is
running.
