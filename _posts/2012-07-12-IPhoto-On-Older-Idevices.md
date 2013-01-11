---
layout: post
title: iPhoto on Older iDevices
subtitle: Front-Facing camera? Pfft!
---

###iPhoto for iOS
In the shadow of the new iPad, Apple finally released a version of iPhoto for
iOS. The problem is it's only for iPhone4, iPad2 and later. I own an iPhone3GS
and a first generation iPad, and when I try to install it on them, they tell me
that it requires a front-facing camera.

The front-facing camera requirement is of course absolute BS. The real
restriction is the RAM of the device. iPhone 4 and iPad2 has 512 MB of RAM,
twice as much as the 3GS and the original iPad. I assume that the camera
restriction is just something that was in the app store already, and that's why
Apple used it.

###Common solution
It didn't take long for someone to find out that the camera restriction could
be circumvented if you buy the app in iTunes on your computer and then install
it using Apples own _iPhone Configuration Utility_. This does work, and iPhoto
runs great and surprisingly smoothly on both the original iPad and the 3GS
(though with occasional crashes due to lack of memory).

The problems turn up when you try to sync with iTunes. A dialog box will pop up
asking you if you want to authorize your device with iTunes (or something to
the effect). Selecting No will remove iPhoto and all your work. Some people got
it to work when selecting Yes, but I never did. Instead syncing just stops.

###My solution (requires jailbreak)
The key to my solution is the error message
>This app requires a front facing camera.

To find out whether the device has a front facing camera or not it looks into
the property list of _Springboard_-the main interface of iOS. This is located
at

	/System/Library/CoreServices/Springboard.app/

and is called either N??AP.plist or K??AP.plist on an iPhone or an iPad
respectively where ?? is a number that seems to vary with your model. In there
it looks for a property called _front-facing-camera_ and if it exists and is
set to true, it decides that your device has a front facing camera.

There are no further checks, and iPhoto doesn't use the camera at all, so all
you need to do in order to install it is add this value to your property list.

I've had no problems synchronizing to iTunes after using this method. iPhoto
does, however, crash at some occasions. The crashes are few and far between,
though.

###A problem

I have found one problem with this method; the iphone 3GS thinks it has a front
facing camera. That means there's a button in the camera app that lets you
switch between the front and back camera. Tapping it will make the camera
screen freeze. The remedy for this is to toggle video mode, and then you can
switch back to the back camera.

###How to do it

- Jailbreak
- Install iFile from Cydia
- in iFile, navigate to _/System/Library/CoreServices/SpringBoard.app/_
- Find your property list (N??AP.plist or K??AP.plist)
- Open it with the Property List Viewer
- Tap Capabilities
- Tap the + in the bottom right corner
- type _front-facing-camera_
- Select Type:Boolean
- Tap Create
- Find your new property and activate it
- tap Done
- Restart springboard or your device

You should now be able to install iPhoto through the app store or iTunes.

###Bonus
While you're in there, adding the property _screen-mirroring_ and enabling it
will let you use official 20-pin-to-vga adaptors...

