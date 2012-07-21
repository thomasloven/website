---
layout: post
title: Vim Macros
subtitle: and interrupt handling
categories: osdev
---

###The problem
Today I was writing some code for handling interrupts.
At one point I needed the following piece of code

	extern void isr0(void), isr1(void), isr2(void), isr3(void), isr4(void), isr5(void), isr6(void), isr7(void), isr8(void), isr9(void), isr10(void), isr11(void), isr12(void), isr13(void), isr14(void), isr15(void), isr16(void), isr17(void), isr18(void), isr19(void), isr20(void), isr21(void), isr22(void), isr23(void), isr24(void), isr25(void), isr26(void), isr27(void), isr28(void), isr29(void), isr30(void), isr31(void), isr32(void), isr33(void), isr34(void), isr35(void), isr36(void), isr37(void), isr38(void), isr39(void), isr40(void), isr41(void), isr42(void), isr43(void), isr44(void), isr45(void), isr46(void), isr47(void);
{: .prettyprint}

###The solution
Vim macros.

I've been using this site and my rewrite of my operating system as an excuse to learn vim. And today it payed off. To write the above piece of code I used the key presses

	iisr0(void),<esc>0qayyp3l<ctrl>a0q46@a47k48J$r;Iextern void <esc>

Couldn't be easier!

OK, so maybe it could... Let's break it down.

Let's start with

	iisr0(void),<esc>

_i_ puts vim in Insert mode. There we write _isr0(void),_ and finally leave Insert mode with the escape key.

Next is _0_ to bring the pointer to the beginning of the line. Then comes the macro.

	qayyp3l<ctrl>a0q

_qa_ starts recording a macro into register a.

_yyp_ yanks the current line and pastes it below.

_3l_ skips over the i, s and r.

Ctrl+a increases the number under the pointer by one.

Finally _0_ goes back to the beginning of the line and _q_ stops the macro recording.

The next part:

	46@a47k48J

runs the macro 46 times, steps up 47 times and joins the current line with the next 48 times. We now have

	isr0(void), isr1(void), isr2(void), isr3(void), isr4(void), isr5(void), isr6(void), isr7(void), isr8(void), isr9(void), isr10(void), isr11(void), isr12(void), isr13(void), isr14(void), isr15(void), isr16(void), isr17(void), isr18(void), isr19(void), isr20(void), isr21(void), isr22(void), isr23(void), isr24(void), isr25(void), isr26(void), isr27(void), isr28(void), isr29(void), isr30(void), isr31(void), isr32(void), isr33(void), isr34(void), isr35(void), isr36(void), isr37(void), isr38(void), isr39(void), isr40(void), isr41(void), isr42(void), isr43(void), isr44(void), isr45(void), isr46(void),
{: .prettyprint}

and all we need to do now is replace the last comma with a semicolon using _$r;_ and insert _extern void_ at the beginning of the line using _I_.

###Another example of macros

Starting with

	INTNOERR 0
{: .prettyprint}

I used 

	qayypcwINTNOERR<esc>$<ctrl>a0q
	qsyypcwINTERR<esc>$<ctrl>a0q
	dd6@a@s@a5@s33@a

and ended up with

	INTNOERR 0
	INTNOERR 1
	INTNOERR 2
	INTNOERR 3
	INTNOERR 4
	INTNOERR 5
	INTNOERR 6
	INTNOERR 7
	INTERR 8
	INTNOERR 9
	INTERR 10
	INTERR 11
	INTERR 12
	INTERR 13
	INTERR 14
	INTNOERR 15
	...
	INTNOERR 45
	INTNOERR 46
{: .prettyprint}

I love vim!

###Application
So where did I use this? I've been writing some code for handling interrupts in the os. You can find it in Git commit [26dd8e4c75](https://github.com/thomasloven/os5/tree/26dd8e4c7507b66e4f94bf2c4e980265c6f0a20b).
