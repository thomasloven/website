---
layout: post
title: Setting up
subtitle: Preparing the environment for OsDev
categories: osdev
---

So it's time to start.

I have previously set up a cross compiler environment on my Mac mini, and am now developing on it connected via ssh.

First point today was making a directory structure and creating a [git repository](http://github.com/thomasloven/os5). The directory structure starts off as follows

	os5/
	|-- build/
	|-- include/
	`-- kernel/
	    `-- include/

A difference from previous times is that the _include_ directory is outside the kernel directory. That's because last time I realized I had a lot of include files that were used both in the kernel and many other parts. I'll probably move it into some library directory later. Know what? Let's move it into a library directory right now...

	os5/
	|-- build/
	|-- kernel/
	|   `-- include/
	`-- library/
	    `-- include/

The build/ directory contains some scripts needed for building and testing the os as well as a floppy image preinstalled with the GRUB bootloader.

Next, basic Makefiles were added to os5/ and kernel/. The standard procedure of the main makefile is to run the makefile in kernel/, copy the kernel image into the floppy and then run bochs-term.

	
	BUILDDIR := $(PWD)

	PATH := /usr/local/cross/bin:$(PATH)
	DIRS := kernel
	TARGET := i386-elf

	AS := nasm
	CC := i386-elf-gcc
	LD := i386-elf-ld
	
	ASFLAGS := -f elf
	CCFLAGS := -nostdlib -nostdinc -fno-builtin -fno-exceptions -m32
	CCFLAGS += -fomit-frame-pointer -fno-asynchronous-unwind-tables 
	CCFLAGS += -fno-unwind-tables -I$(BUILDDIR)/library/include
	LDFLAGS := -T $(BUILDDIR)/library/include/Link.ld
	
	export BUILDDIR AS CC LD ASFLAGS CCFLAGS LDFLAGS
	
	.SILENT:
	
	.PHONY: $(DIRS) floppy emul
	.default: all floppy emul
	
	l: all floppy emul
	
	all: $(DIRS)
		
	$(DIRS): force
		@echo "  MAKE    " $@
		@cd $@; $(MAKE) $(MFLAGS)
	
	clean:
		@for DIR in $(DIRS); do echo "  CLEAN   " $$DIR; cd $(BUILDDIR)/$$DIR; make clean; done;
	
	floppy: force
		@echo "  UPDATING IMAGE"
		@build/update_image.sh

	emul: force
		@echo "  STARTING EMULATOR"
		@build/emul.sh

	force:
		true
{: .prettyprint}

The makefile in the kernel/ directory is pretty much straight forward.


	TARGET := kernel
	SUBDIR := kernel
	
	SOURCES := kinit.o boot.o
	SOURCES += $(patsubst %.s,%.o,$(shell find . -name "*.s" | grep -v boot.s))
	SOURCES += $(patsubst %.c,%.0,$(shell find . -name "*.c" | grep -v kinit.c))
	
	CCFLAGS += -Iinclude
	LDFLAGS := -T $(BUILDDIR)/$(SUBDIR)/include/Link.ld
	
	.SUFFICES: .o .s .c
	
	all: $(TARGET)
	
	$(TARGET): $(SOURCES)
		@echo "   ln     " $(TARGET)
		@$(LD) $(LDFLAGS) -o $(TARGET) $(SOURCES)
	
	.c.o:
		@echo "   gcc    " $<
		@$(CC) $(CFLAGS) -c $< -o $@
	
	.s.o:
		@echo "   nasm   " $<
		@$(AS) $(ASFLAGS) $< -o $@
	
	clean:
		-@rm $(SOURCES) 2>/dev/null
		-@rm $(TARGET) 2>/dev/null
{: .prettyprint}
