---
layout: post
title: Restarting a hoby kernel
subtitle: Once more, from the top... 
categories: osdev
---

Many years ago, I got interesting in trying out Linux. Having used Windows
since my parents started using Windows computers at work and declared our old
Macintoshes obsolete I realized it would mean quite a change and didn't really
want to go all in right away. Somehow I found out about VMWare Workstation - an
Intel processor emulator made for running virtual computers within Windows and
installed one of the first versions of Ubuntu in it.

I played around with Ubuntu Linux for a while, but then I started thinking
about the computer emulator I was using and wondered whether I could make
a program myself that would boot in it. In other words, could I write a program
that ran by itself on a computer with no operating system?

The answer turned out to be yes. With a lot of help and tutorials from what
later became [osdev.org](http://www.osdev.org) and many more that
I unfortunately can't remember or find anymore, I wrote a small binary
executable in Assembly that could run of the boot sector on a floppy disk.
I was amazed! Could it really be this simple? I immediately set out to write an
entire operating system. Nothing fancy; I just wanted to boot the computer and
get into a desktop environment with a text editor and a compiler so I could
keep adding to the system from within it. Shouldn't be too hard, should it?

Almost ten years later, I think I got the routines for basic BIOS-assisted
screen printing down...

There are several reasons why things are moving so slowly. First and foremost:
It wasn't that easy. Operating systems are advanced stuff, and combined with my
own lack of any formal education or experience in programming or computer
systems this means progress is slow.

Next is a lack of time. Back when I found VMWare Workstation and started this
journey, I was on summer holiday from school and had all the time in the world.
Then school started again. Then came the Christmas holiday and I realized I had
forgotten everything. So I threw everything out and started again from scratch.
This time I got a bit further. Then school started again.

And that's how it's been since then. School started, ended and begun again.
Then I did a year in the army. Then university (engineering physics). Then
I met a girl, got engaged, bought a house, worked for a year with project
management, went back to university... Still, every now and then I've restarted
development of my operating system dream.

So, how will I ever get out of this reset loop? Well, I've got a plan. Most
important, I think, is to have realistic expectations. That shouldn't be as
much a problem as it used to be. As time has passed I have grown to understand
my limitations better than I did when I was 15. Also, my main goal of
programming now is recreation. A moment of peace by myself when I can
concentrate on a problem I appreciate. If I never get a stable virtual file
system going, that's ok. If I build a working tcp-ip stack and get a web server
running under my own operating system, that's ok too, but it's not my goal.
Still, this doesn't mean I want to keep rewriting the code for setting up the
Interupt Vector Table for the x-th time next time I have a week of university,
which brings me to the next part of the plan.

Documentation. I'm going to restart my development efforts once again, but this
time I plan to be more careful about documentation. My thought is that if
I write down what I do and why, I won't have to do it again in six months but
can just read through my old notes. Who knows; this plan might just be crazy
enough to work.

I've obviously tried this before. It worked somewhat but I made a big mistake.
I called my notes a "tutorial". I did that because I wished it to be
a tutorial, that beginners could learn from my years of mistakes. Some people
didn't like this and a few unnecesarily harsh comments got me of the osdev
scene for a while. Then university started again and I was back in the loop.

This time I won't make that mistake. I still wish to make those notes public,
though, because I still think that I and possibly others may benefit from them.
I'll be clear though, that I am not a profesional programmer and have never
pretended or wanted to be one. I appreciate feedback in the case anyone reads
this and I can be reached through email or twitter (links below). Please try to
stay constructive, though.

Anyway, this is already way more text than anyone would bother to read, so
I guess I'll just cut it off here and we'll see where this series of notes
finally takes us.
