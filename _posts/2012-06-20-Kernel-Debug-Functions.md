---
layout: post
title: Kernel debug functions
subtitle: Can't live without them
categories: osdev
---

I read through the comments on my old OsDev series the other day and got stuck on one of them.

> "[...] I noticed that you handle printing in the kernel, of all places. A kernel isn't supposed to do video output.[...]"

I totally and whole-heartedly agree with this, and I really really wish I could code so well I didn't feel a need for outputting a single debug message before I had finished the booting procedure, physical and virtual memory management, interrupts, faults, thread and process handling, scheduling, system calls, message passing, virtual file system, a device driver framework, file writing library functions and a terminal driver. Alas, I am not that good, and therefore I find it helpful to print a message to the screen every now and then. Wheter the kernel's supposed to do video ouptut depends on the kind of kernel anyway.

But enough with this immature passive aggressiveness. Let's do some kernel handled printing!

Screen printing is usually quite simple. Most personal x86-based computers can do it by simply writing the text to a certain area in memory. I'm not going to waste very much time on it but pretty much just copy the code from an earlier project and move on to more interesting things.

I also added some useful library functions and macros like min(a,b), max(a,b) and swap(a,b) and a few parts of the c standard library.
It can all be found in Git commit [16fdacb89](https://github.com/thomasloven/os5/tree/164fdacb896b3427633433f97bbd12d779a3d1f3).
