---
layout: post
title: Memory Heap
subtitle: Basic memory management 3/3
categories: osdev
---

###Memory management part 3
I have previously ([Memory Page Stack](/blog/2012/06/Memory-Page-Stack), [Recursive Page Directory](/blog/2012/06/Recursive-Page-Directory)) described how I like to divide the memory management of a kernel into three parts. This post regards the third part, which I like to call the heap.

###Memory Management
In fact, a memory heap is but one way of handling memory. I believe it's the kind that is easiest to implement and understand (with one exception) but it is a bit slow.

The main task of a memory manager is to reserve and hand out areas in memory when asked. For example, a program may run _malloc(size)_ and get a pointer to a memory area of the asked size. It can then do whatever it wants with this memory area and can be sure that it will not be handed out again by _malloc_ before it has been returned by _free_.

Now, let's look at a few ways to do this.

###Linear allocation
The simplest possible memory manager just hands out a new address each time _malloc_ is called and doesn't care when memory is freed.

	uint32_t memory_pointer = HEAP_START;

	void *malloc(uint32_t size);
	{
		memory_pointer = memory_pointer + size;
		return memory_pointer - size;
	}

	void free(void *mem)
	{
		;
	}
{: .prettyprint}

###Heap
The next method - which I prefer - is a memory heap.

The heap consists of a list of free memory areas. In the simplest possible variety, it would look something like this:

	struct area_header
	{
		uint32_t size;
		struct free_area *next;
	};
	 
	void *malloc(uint32_t size)
	{
		struct area_header *area = heap_list_head;
		while(area)
		{
			if(area->size >= size)
			{
				remove_from_heap_list(area);
				return get_memory_area(area);
			}
			area = area->next;
		}
		panic("Out of memory!");
	}
	 
	void free(void *mem)
	{
		struct area_header area = get_area_header(mem);
		insert_into_heap_list(area);
	}
{: .prettyprint}

Here it is assumed that the free memory is already divided into smaller areas that each start with an *area_header* structure as in the figure below. If the memory area is allocated, the caller of _malloc_ gets a pointer to the end of the area header. The area header thus remains untouched by the program until the memory is freed again.

The memory could then look something like below.

Blue areas in the figure are free and red ones are allocated. The header of each free memory area has a pointer to the next free area.

###Improvements
Some improvements can be made to this simple scheme. First, if no free area is big enough, the heap can be increased by adding a new area with the right size to the end. Alternatively, two free areas that are right next to each other

can be joined together to form a bigger one.

Also, it would be a good idea if an area is bigger than necessary to split it.
Finally, it's a lot easier to keep track of everything if the memory areas are doubly linked and if allocated areas are not removed from the list but just marked as used.

###Git
With those improvements the scheme is similar to what I've implemented in Git commit [8db335ce3b](https://github.com/thomasloven/os5/tree/8db335ce3bed30c8e75275c2fc96a2b697106023).

###Further improvements
Some more improvements can be made to the heap in order to increase performance.
The most common ones use different ways to search for free areas of the correct size. For example, the free areas could be stored in an ordered list starting with the smallest, or they could be stored in several lists depending on their size.
