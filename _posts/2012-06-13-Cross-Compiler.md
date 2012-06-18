---
layout: post
title: Cross compiler
subtitle: Setting up under OSX Lion
categories: osdev
---

For simplicity, I chose to set up a so-called cross compiler for osdeving.
In OSX Lion, this is what I did.

First of all, I installed Xcode from the Mac App store.
Since version 4.3, Xcode doesn't install any command line tools anymore, so this had to be done manually:

- Open Xcode
- Go the Preferences
- Choose Downloads
- Find Command Line Tools and click Install.

Compiling gcc also requires the mpfr package to be installed. This I did with [Homebrew](http://mxcl.github.com/homebrew/).

	brew install mpfr
{: .prettyprint}

I downloaded all the sources I needed from [gnu.org](http://gnu.org).

	curl -O http://ftp.gnu.org/gnu/binutils/binutils-2.22.tar.gz
	curl -O http://ftp.gnu.org/gnu/gcc/gcc-4.6.3/gcc-core-4.6.3.tar.gz
	
	curl -O http://ftp.gnu.org/gnu/gmp/gmp-5.0.2.tar.gz
	curl -O http://ftp.gnu.org/gnu/mpfr/mpfr-3.1.0.tar.gz
	curl -O http://www.multiprecision.org/mpc/download/mpc-0.9.tar.gz
{: .prettyprint .lang-bsh}

Feel free to use later versions, but if you do, I cannot guarantee that the code posted in my logs will work for you (it's very likely to work, but not *guaranteed*).
Gmp, mpfr and mpc are floating point libraries that are used by gcc, so after extracting all archives, they are simply copied into the gcc source

	mv gmp-5.0.2 gcc-core-4.6.3/gmp
	mv mpfr-3.1.0 gcc-core-4.6.3/mpfr
	mv mpc-0.9 gcc-core-4.6.3/mpc
{: .prettyprint}

In order not to mess up the source, binutils and gcc were built out of tree.

	mkdir build-binutils
	cd build-binutils
	
	export PREFIX=/usr/local/cross
	export TARGET=i386-elf
	../binutils-2.22/configure --target=$TARGET --prefix=$PREFIX --disable-nls
	make all
	make install
{: .prettyprint}

And the same for gcc, using the new binutils

	cd ..
	mkdir build-gcc
	cd build-gcc
	export PATH=$PATH:$PREFIX/bin
	..gcc-4.6.3/configure --target=$TARGET --prefix=$PREFIX --disable-nls --enable-languages=c --without-headers
	make all-gcc
	make install-gcc
{: .prettyprint }

It's realy important to run *make all-gcc* and **not** *make all* here. It probably works anyway - if you ever manage to get it to actually compile...

And that's it!
