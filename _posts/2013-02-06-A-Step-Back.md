---
layout: post
title: A Step Back
subtitle: Exactly why I keep this blog
categories: osdev
---

I've previously described my normal mode of enjoying the hobby of
operating system development, i.e. restarting from the ground every time
I get some time, and then forgetting everything once school starts.

That's exactly why I started writing down what I'm doing in this blog.

The thing is, I didn't really keep to this at the end of summer, and ran
ahead a bit with the programming, thinking I should catch up with the
blogging at a later time. Obviously, I didn't do this...

When I took a look at the state of my code a week or so ago, I
noticed I hadn't even checked in my changes since August. So that's
what I did, and then I branched off the last commit I blogged about
([756852fc66](https://github.com/thomasloven/os5/tree/756852fc66b80b1e60
58d74b8dc334ad841ec5ea)) and made that the new master branch.

For future reference (I'll probably cheat again someday) there were the commands for this:

	git commit -m 'Bad excuse for not checking in before'
	git checkout -b new_master OLD_COMMIT_SHA
	git merge --strategy=ours master
	git checkout master
	git merge new_master

The resulting commit is found at
[f74ec287db](https://github.com/thomasloven/os5/tree/f74ec287db488a7bda5
4ad75f979ca6b5664feef).
If you take a look at my [commit
list](https://github.com/thomasloven/os5/commits/), though, you'll
notice that I cheated again... I told you I would!

Anyway. I'll get right on describing what I've been doing...
