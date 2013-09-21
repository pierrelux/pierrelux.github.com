---
layout: post
category : thesis
tags : [reinforcement learning, options]
title : A Fresh Perspective on HRL with Mixture of Options
---
{% include JB/setup %}

Recent work by {% cite Daniel2012 %} as well as
similar independent research by {% cite Thomas2012 %} has started to make me think that
we might benefit from revisiting the classical HRL model. Under the perpective taken
by these authors, hiearchical polices are obtained by *mixing* lower level policies
in a similar way to *product of experts* {% cite Hinton2002 %} or ensemble methods in supervised learning.
Using the terminology and notation of {% cite Sutton1999 %}, the Hi-REPS algorithm of {% cite Daniel2012 %} takes the summation
over all of the available options as follow:

$$
\pi(a|x) = \sum_{o \in \mathcal{O}} \pi(o|x) \pi(a|x,o)
$$

In this model, the initiation component $$\mathcal{I}$$ is ignored, making options
available under every state. Furthermore, the termination function $$\beta$$ is defined
in such a way that options can only last one step. These assumptions, together with a well-defined parametrization,
seem to be sufficient to make the discovery problem tractable. Hi-REPS combines the Relative Entropy Policy Search (REPS) method of {% cite Peter2010 %}
with an expectation-maximization formulation for finding an optimal hierarchy. The resulting algorithm
is shown to be usable for the simulated robot domain of Tetherball and
outperforms the flat REPS baseline algorithm.

{% cite Thomas2012 %} proposes a similar model but
also establishes some interesting parallels to a biological model for the frog
by {% cite MussaIvaldi2000 %} which explains the emergence of higher level
motor skills as the linear combination of other lower level primitives. Here again, a parametrization is assumed
for the motor skills and the behavior policy modulates their relative contribution given the current state $$x$$.
The gradient of the policy over the skills depends recursively on the
policies for the skills and is difficult to derive. Policy gradient coagent
networks (PGCN) {% cite Thomas2011 %}, a policy gradient method capable
of converging without an explicit form of the gradient, solves this problem. In
comparison, Hi-REPS tackles this issue by using EM.

A more general model ?
----------------------
The formulation of skills as single-step policies departs from the original call-
and-return construction of the options framework. What are the consequences of
what appears to be otherwise only an algorithmic simplification ? The question
perhaps pertains directly to the appropriateness of the traditional paradigms in
HRL. Is the call-and-return model really necessary after all ? Would mixtures
of single-step experts allow for a greater exibility in representing hierarchies of
skills ?

References
----------
{% bibliography --cited %}
