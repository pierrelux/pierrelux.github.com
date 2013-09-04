---
layout: post
category : math
tags : [fft, time series, autocorrelation]
title : Konidaris' Pinball Domain now Available in Python
---
{% include JB/setup %}

As part of my Master's thesis, I implemented [George Konidaris'](http://www-all.cs.umass.edu/~gdk/pinball/) Pinball domain for reinforcement Learning.
Konidaris had already made available his original implementation in Java. The environment could also be reached through an [RL-Glue](http://glue.rl-community.org/wiki/RL-Glue_Core) socket interface.

Porting it to Python however made the transition to Will Dabney's [Python-Rl](https://github.com/amarack/python-rl) much easier while avoiding the performance bottleneck due socket communication.

And I love working with Python

On Github: [pypinball](https://github.com/pierrelux/pypinball)
