---
layout: post
title: Return-To-Kernel-Mode
subtitle: Seriously, what's up with TSS?
categories: osdev
---

###Processor privilege levels

In [my last post](/blog/2012/07/Privilege-Levels) I wrote about x86 privilege
levels. Remember the CLP, the DPL, the RPL and the KPL? Ok, I made that last
one up, but there actually is one more -PL thing to take into consideration.
The IOPL, but that won't come into play yet.

Anyway, I showed that switching privilege level was kind of easy, if you do it
from a lower value to a higher. I also said that if you try to load a lower
level than your CPL into _CS_ you get a GPF.

###Going to a lower privilege level

So, the processor designers obviously didn't want us to go to a lower
protection level, so why would we? Well, there are some things that we want the
kernel to do that requires a higher protection level. For example we may want
to change the value of _cr3_ during a task switch in order to load a new
address space for the new process.

Luckily, there is a way to get back to ring 0 (kernel mode) and that's through
interrupts. When an interrupt happens (or is called by a program - more on this
at an other time), the processor loads a new value for CS from the relevant
interrupt descriptor in the IDT and - in this case - allows the change in
privilege level no matter which way it goes. If the privilege level is changed
by loading the new CS, the processor looks into the currently loaded __TSS__...

###Task State Segment

The __Task State Segment__ ( __TSS__) is another remnant from the olden days of
the x86 processor architecture.

I'll gladly admit that I don't understand them at all, but it has to do with
hardware task switching. In short, I believe that you can load a number of TSS
entries into the GDT and load one of them into a special register at once to
perform a task switch. The processor would then save all registers into the old
TSS and load them from the new one, all in one instruction. ... or something
like that...

But, as I mentioned above, if the privilege level is lowered during a processor
interrupt, the processor looks into the currently loaded TSS. From there it
loads a new value for SS and ESP. In other words, the TSS determines the stack
position as we get back into kernel mode.

###Loading a TSS

Loading a TSS is actually rather simple and it's kind of hard to go wrong. So
hard in fact that most tutorials actually do. Here's how it's really done
(source: [Intel
Manuals](http://www.intel.com/content/www/us/en/processors/architectures-software-developer-manuals.html/))

	gdt[TSS_DESCRIPTOR].base = &tss;
	gdt[TSS_DESCRIPTOR].limit = sizeof(tss);
	gdt[TSS_DESCRIPTOR].flags = 0;
	gdt[TSS_DESCRIPTOR].access = GDT_PRESENT | GDT_EXECUTABLE | GDT_ACCESSED;
{: .prettyprint}

What most tutorials get wrong is the limit field. The TSS is actually a memory
segment, and like all memory segments it has a segment descriptor in the GDT
(the TSS descriptor can not be stored in an LDT). Finally, like all segment
descriptors, the TSS descriptor points to a segment that resides between the
address _base_ and _base + limit_. In other words, _limit_ should be the size
of the TSS, not the end of it.

What's the point in that, you might ask. The TSS is of fixed length, isn't it?
Not really; the TSS is sometimes followed by a bitmap which decides which I/O
ports the processor is allowed to access. If such a bitmap exists, the TSS
segment is increased to incorporate it.

###Why you should get this right

The thing is that if you don't have an I/O map, any value for the limit above
0x67 will be accepted by the processor. However, the limit field is only 20
bits long and is often truncated to this length by cutting off the upper 12
bits in the code that sets the descriptor. Most of the time, this works, but
say your TSS begins at address 0xFFFFF and is of minimum length. That means it
ends at 0x100066 and if you truncate this to 20 bits and put it as limit you
get 0x66. Boom! Protection fault! If you're lucky, it happens every time you
boot your kernel. If you're not, you may have a really nasty bug to track down.

###Back to the TSS

When you have your TSS segment descriptor, you need to set up the TSS itself.
Without hardware multitasking, there are only three values of TSS that are
reqired. SS0, ESP0 and IOMAP.

SS0 and ESP0 were described in my previous post and IOMAP is the offset of the
I/O map inside the TSS segment. This needs to be set even if you don't have an
IO map, so I just set it to the length of the TSS structure.

###Application
The methods described in this post is used in Git commit
[52a0c84739](https://github.com/thomasloven/os5/tree/52a0c84739e04f3d9dd7410cdf0b378118a946b4).
