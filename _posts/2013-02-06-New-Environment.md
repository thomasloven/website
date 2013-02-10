---
layout: post
title: New Environment
subtitle: A bit more and less modern tools
categories: osdev
---

Two summers ago, I didn't always have access to my build computer, so I
came up with a convoluted development setup which could be run over an
ssh connection.

I would edit files locally using some graphical text editor. Then I
would save my files and wait for them to propagate to the build computer
through Dropbox.
Next I would run the build commands through ssh and then test the
results in bochs terminal mode.

Last summer I started using vim to edit the source directly on the build
computer, which meant I didn't have to wait for Dropbox.
Around the same time I started to find some awesome tools which have
been around for ages.

Those are, for example [tmux](http://tmux.sourceforge.net/) which is a
terminal multiplexer which runs circles around gnu screen in terms of
usability and features.

LLVM
----

I also started looking at the [llvm](http://llvm.org) compiler suite.
The main reason I've been using a cross compiler is that I'm building
under OSX. OSX has its own executable format (Mach-O something or other),
but I'd like to use gnu elf, because it's well documented and there's
lots of example code about. The gcc bundled with OSX only compiles for
OSX, obviously, but OSX recently started shipping with llvm and clang
instead.

Clang can apparently be used as a cross compiler whatever way it was
built, though the available documentation is a bit unclear on how
exactly to do this. Come to think of it, the available documentation is
a lot unclear on just about everything. Funny for a compiler which
boasts expressive error messages as a feature...

Anyway with clang version 3.1 you can compile i386-elf object files through

	> clang -ccc-host-triple i386-pc-linux -c source.c -o object.o
{: .prettyprint .lang-sh}

`-ccc-host-triple` isn't mentioned even once in the documentation of
clang nor are the possible choices. `i386-elf` which is somewhat of a
standard does not work...

Since clang version 3.2 `-ccc-host-triple` has apparently been replaced
by `-target`. This change is, of course, not mentioned in the release
notes.

In short, the llvm project - though I appreciate the thought - is an
excellent example of why you should document your code, kids.

This being said. If you know of some secret stash of llvm or clang
documentation, please - PLEASE - let me know!

I still use clang for compiling my kernel, though. Mostly because of the
aforementioned expressive error messages. They really are a nice change
to gcc and in pretty colors too.

If you run OSX clang 3.1 is installed with the
current version of Xcode. Version 3.2 is installed by
[Homebrew](http://mxcl.github.com/homebrew/).

	> homebrew install llvm
{: .prettyprint .lang-sh}

Binutils
--------

The linker supplied with llvm doesn't read linker scripts - and I didn't
even get it to link my kernel objects together at all anyway - so I
still use gnu binutils cross compiled for i386-elf.

However, I don't use the compiling process described in an earlier post.
Instead, again, I use Homebrew.

First of all, to get a working cross target binutils, the brew formula
will have to be changed a bit

	> brew edit binutils

Change the last configure flag (` --enable-targets=x86_64-elf,arm-none-eabi,m32r`)
to `--target=i386-elf`. I also changed the `--program-prefix` to `i386-elf-`. Save the file and run

	> brew install binutils

and you're good to go.

As a bonus, binutils also contains usefull tools like objdump and readelf.

Qemu
----

Up until a few days ago, after compiling my kernel, I mounted an ext2
image using mac-fuse, copied the kernel binary into it, unmounted the
image and tested it using bochs.
Bochs has a really nice text based interface which works well as long as
the OS is only text based anyway, also a great debugger. Unfortunately,
you can't use both at once, but most of the time you don't need an
actual debugger to find the problems anyway.

The whole process can be streamlined through some shell scripting and I
had the overhead reduced to almost nothing, I thought...

Then I decided to take a look at [qemu](http://wiki.qemu.org/Main_Page)
again. I used it once before, but stopped due to the lack of a debugger
and text mode if I recall correctly. I knew back then that it could be
debugged with [gdb](http://www.gnu.org/software/gdb/), but I was on a
windows machine in those days, and... well... don't really want to talk
about it...

Anyway, I started having some problems with mac-fuse, so I thought
I should take a look at qemu again, since it has built in emulation
of a boot loader and can run a lone kernel binary passed to it as an
argument. So I started to look it up and it turned out to actually have
a text mode (curses mode).

So I went out on a whim and tried

	> brew info qemu

By now you should know pretty much what I think of Homebrew, so the
results of that command pretty much sealed the deal.

Now I run my kernel in qemu through

	> qemu-system-i386 -kernel kernel/kernel -curses

Qemu also turned out to have a monitor mode which contains some of the
functions I used most often in the bochs debugger, such as printing the
memory map. Further, this could be accessed using telnet from a
different tmux pane.

	#!/bin/bash
	tmux split-window -h 'qemu-system-i386 -kernel kernel/kernel -curses -monitor telnet:localhost:4444,server'
	tmux select-pane -L
	telnet localhost 4444
{: .prettyprint}

Finally, I also installed an i386-elf targeted version of gdb - using Homebrew, obviously, with the same trick as for binutils. Gdb is found in a different tap of homebrew, so that will have to be installed first

	> brew tap homebrew/dupes
	> brew edit gdb

Add the flag `--target=i386-elf` to the configure flags, save and

	> brew install gdb

This will link to `ì386-elf-gdb` and can be run in yet another tmux window.

	#!/bin/bash
	tmux split-window -h 'qemu-system-i386 -kernel kernel/kernel -curses -monitor telnet:localhost:4444,server -s -S'
	tmux select-pane -L
	tmux slit-window -v 'i386-elf-gdb'
	tmux select-pane -U
	telnet localhost 4444

Upon start, gdb will look for a file called `.gdbinit` which in my case contains

	file kernel/kernel
	target remote localhost:1234

Results
-------

[![OSDEV build environment](/media/img/osdev_build_env.png)](/media/img/osdev_build_env_full.png)

Now that's neat!

The results can also be seen in git commit [0699c20381](https://github.com/thomasloven/os5/tree/0699c203818ec1d018c93b0192fba48ccb6879d8).


