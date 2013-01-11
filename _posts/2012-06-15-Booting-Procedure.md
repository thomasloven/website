---
layout: post
title: Booting Procedure
subtitle: Starting up the x86
categories: osdev
---

[Previous part](/blog/2012/06/Setting-Up/)

To boot up the operating system kernel, I use
[GRUB](http://www.gnu.org/software/grub/). It takes care of things like getting
into protected mode, checking the memory and activating processor flags. It can
also load any file you ask it to into memory - which is good, because we won't
see a disk driver here anytime soon - before starting the loaded kernel.

I want to write a kernel that resides in a high part of memory (0xC0000000 and
above) because I think it looks tidy. In order to load a high part kernel
without paging, I use the trick described at
[osdev.org](http://wiki.osdev.org/Higher_Half_bare_bones). This requires
a special Linker file for the kernel.

*kernel/include/Link.ld*

	ENTRY(start)
	 
	SECTIONS {
		. = 0xC0100000;
		.text : AT(ADDR(.text) - 0xC0000000)
		{
			code = .; _code = .; __code = .;
			*(.text)
			*(.eh_frame)
			. = ALIGN(4096);
		}
		.data : AT(ADDR(.data) - 0xC0000000)
		{
			data = .; _data = .; __data = .;
			*(.data)
			*(.rodata)
			. = ALIGN(4096);
		}
		.bss : AT(ADDR(.bss) - 0xC0000000)
		{
			bss = .; _bss = .; __bss = .;
			*(.bss)
			. = ALIGN(4096);
		}
	 
		_end = .;
	}
{: .prettyprint .linenums}

GRUB drops us off at the kernel entry point - *start* as defined in the
linkfile - without paging and with an unknown GDT. So setting that up will be
the first order of business.  This is done in the assembly bootstrap.

*kernel/boot.s*

	; Kernel start point
	[global start]
	start:
		cli
	 
	; Load page directory and enable paging
		mov ecx, BootPageDirectory - KERNEL_OFFSET
		mov cr3, ecx
		mov ecx, cr0
		or ecx, 0x80000000
		mov cr0, ecx
		lea ecx, [.higherHalf]
		jmp ecx
	 
	.higherHalf:
		; Load GDT
		mov ecx, gdt_ptr
		lgdt [ecx]
	 
		SetSegments 0x10, cx
		jmp 0x8:.gdtLoaded
	 
	.gdtLoaded:
{: .prettyprint .lang-nasm .linenums:61}

Here's another new thing for me. Macros. Can't believe I could do without them
before. *SetSegments* is a macro that in this case loads 0x10 into ecx and then
loads cx into each segment selector register. It is defined in an included file
which also contains some constants.

*kernel/include/asm_macros.inc*

	; GRUB multiboot headers
	MBOOT_PAGE_ALIGNED_FLAG	equ	1<<0
	MBOOT_MEMORY_INFO_FLAG	equ	1<<1
	MBOOT_HEADER_MAGIC	equ	0x1BADB002
	 
	MBOOT_HEADER_FLAGS	equ	MBOOT_PAGE_ALIGNED_FLAG | MBOOT_MEMORY_INFO_FLAG
	MBOOT_HEADER_CHECKSUM	equ	-(MBOOT_HEADER_FLAGS + MBOOT_HEADER_MAGIC)
	 
	 
	KERNEL_OFFSET	equ	0xC0000000
	BOOT_STACK_SIZE	equ	0x1FFF
	 
	; SetSegments 0x10 ax loads all segment selectors with 0x10 using eax
	%macro SetSegments 2
		mov e%2, %1
		mov ds, %2
		mov es, %2
		mov fs, %2
		mov gs, %2
		mov ss, %2
	%endmacro
{: .prettyprint .lang-nasm .linenums:2}

There are also references to some data structures, i.e. *BootPageDirectory* and
*gdt_ptr*. Those are hardcoded in the bootstrap file.

*kernel/boot.s*

	 
	%include "include/asm_macros.inc"
	 
	[bits 32]
	 
	section .bss
	 
	align 0x8
	 
	; Stack for booting
	[global BootStack]
	BootStackTop:
		resb BOOT_STACK_SIZE
	BootStack:
	 
	section .data
	 
	align 0x1000
	 
	; Page directory for booting up.
	; First four megabytes are identity mapped as well as
	; mapped to 0xC0000000
	[global BootPageDirectory]
	BootPageDirectory:
		dd (BootPageTable - KERNEL_OFFSET) + 0x3
		times ((KERNEL_OFFSET >> 22) - 1) dd 0x0
		dd (BootPageTable - KERNEL_OFFSET) + 0x3
		times (1022 - (KERNEL_OFFSET >> 22)) dd 0x0
		dd (BootPageDirectory - KERNEL_OFFSET) + 0x3
	 
	BootPageTable:
		%assign i 0
		%rep 1024
			dd (i << 12) | 0x3
			%assign i i+1
		%endrep
	 
	; Hard-coded GDT.
	; GDT pointer is wrapped into the first entry
	[global gdt]
	gdt_ptr:
	gdt:
		dw 0x002F
		dd gdt
		dw 0x0000
		dd 0x0000FFFF, 0x00CF9A00
		dd 0x0000FFFF, 0x00CF9200
		dd 0x0000FFFF, 0x00CFFA00
		dd 0x0000FFFF, 0x00CFF200
	 
	section .text
	 
	align 4
	 
	; GRUB Multiboot data
	MultiBootHeader:
		dd MBOOT_HEADER_MAGIC
		dd MBOOT_HEADER_FLAGS
		dd MBOOT_HEADER_CHECKSUM
{: .prettyprint .lang-nasm .linenums:2}

Well. This is first of all some area saved for a stack. Then there's the page
directory which has the same page table at virtual memory 0x00000000 and
0xC0000000. The rest of the page directory is cleared. The page table maps the
first four megabytes of physical memory.  The hard-coded GDT has five entries.
The first one is always empty, so this space is used to store the gdt pointer.
Then there's kernel code, kernel data, user code and user data. Each segment
has base 0 and size 4 gb, so they all contain all of the virtual memory space.
Finally, there's the multiboot header for GRUB. This has to be at the very
start of the .data section, so it is also loaded first by the makefile.

The last thing we need before we can go into a higher level language is
a stack, but let's take this opportunity to also remove the identity mapping
from the page directory.

*kernel/boot.s*

	.gdtLoaded:
		; Clear the identity mapping from the page directory
		mov edx, BootPageDirectory
		xor ecx, ecx
		mov [edx], ecx
		invlpg[0]
	 
		; Load a stack for booting
		mov esp, BootStack
		mov ebp, BootStack
	 
		; eax contains the magic number from GRUB 0x2BADB002
		push eax
	 
		; ebx contains the address of the Multiboot information structure
		add ebx, KERNEL_OFFSET
		push ebx
	 
		; Call the c function for setting up
	[extern kinit]
	call kinit
	jmp $
{: .prettyprint .lang-nasm .linenums:83}

The final thing we do before jumping into the c kernel stub is push the values
of eax and ebx which contains the multiboot magic number and information
structure location respectively.

The only thing that's left now in order to get this to run is the c stub.

*kernel/kinit.c*

	 
	void kinit()
	{
	 
	}
{: .prettyprint .linenums:2}

Compiling and running this through bochs, we are presented with a black and
white screen completely void of error messages.  Perfect!

The code up to this point can be found in my github repository.
Commit [66dd86fc12](https://github.com/thomasloven/os5/tree/66dd86fc128e2714e4c93c73d8a0bf8542e10573)
