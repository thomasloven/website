---
layout: post
title: C headers in Asm
subtitle: Cleaning up the build chain
categories: osdev
---

Something that always annoyed me is how hard it is to synchronize constants between assembly and c code.
In assembler, you define a constant value as

	EXACT_PI equ 3
{: .prettyprint .lang-nasm}

and in c

	#define EXACT_PI 3
{: .prettyprint .lang-c}
As is usually the case with things that annoy me, there is of course a solution to this, as I found out today.
The solution is the c preprocessor.

Normally, when you run a c compiler, it makes multiple passes over your source file. The first one or two times, it runs a pre-processor. The preprocessor checks for things like _#include_ and _#define_ and replaces macros. The next pass actually compiles the code. Then the compiler invokes a linker and so on.

What I found out today is that you can run only the preprocessor and it will replace all the preprocessor code and ignore the rest.
In other words, you can use c preprocessor macros in assembler. Awesome!

So, how is this done?
Well, here's a minimal (non-working) example:

_myAsmFile.asm_

	#include <header.h>
	 
	mov eax, EXACT_PI
{: .prettyprint .lang-nasm}

_include/header.h_

	#pragma once
	 
	#define EXACT_PI 3
	 
	#ifndef __ASSEMBLER__
	// This is not evaluated if header.h is included from an assembly file.
	#endif
{: .prettyprint .lang-c}

This is compiled through:

	cpp -I include -x assembler-with-cpp myAsmFile.asm -o myAsmFile.s
	nasm myAsmFile.s
{: .prettyprint}

The _-x_-flag tells the preprocessor what type of file the following input files are. _assembler-with-cpp_ means _cpp_ will ignore everything but the preprocessor commands.

An alternative to _cpp_ is _gcc -E_. Actually, this is often exactly the same thing...


This is implemented in git commit [742f2348ec](https://github.com/thomasloven/os5/tree/742f2348ecc58eaa8239b06c666bd8c3c539c019).
