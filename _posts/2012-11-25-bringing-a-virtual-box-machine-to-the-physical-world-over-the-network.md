---
layout: post
category : tip 
tags : [virtualbox, netcat]
tagline :
---
{% include JB/setup %}

## On the target machine

Prior to the following, you would first need to create and boot from a USB stick any sort of linux distro giving you access to `netcat` and `dd`.

    $ nc -l 9901 | dd of=/dev/sda

where /dev/sda corresponds to the drive on which you wish to install the system. If you are unsure, check with:

    $ fdisk -l

## On the VirtualBox host

    $ VBoxManage internalcommands converttoraw ubuntu1204.vdi ubuntu1204.raw
    $ dd if=ubuntu1204.raw | nc 192.168.3.135 9901

Here `192.168.3.135` is the IP of the target system running the `nc` command.
