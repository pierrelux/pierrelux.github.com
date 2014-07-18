---
layout: post-no-feature
category : thesis
tags : [reinforcement learning, options, motor skills]
title : Temporal and Spatial Components of Motor Skills Learning in Birdsong
---

They say that *if all you have is a hammer, everything looks like a nail*.
I have to admit: my *hammer* for Hierachical Reinforcement Learning is the options framework of {% cite Sutton1999 --style apa-intext %}.

While reading {% cite Ali2013 --style apa-intext %} about motor skills learning of birdsong, I couldn't keep myself from contemplating the
ressemblance to the options model. The results presented in this month edition of Neuron showed the existence of a dual mechanism for motor skills
learning in birdsong. A dissociation seems to exists in the learning process of the *spectral* characteristics of birdsong and that of aquiring its temporal structure.
The authors suggests that the [basal ganglia](http://www.scholarpedia.org/article/Basal_ganglia) would be responsible for learning the *spectral* aspect of
birdsong while a premotor cortex area would handle its temporal component. The independence of these learning mechanisms might also be benificial in human motor
skills learning and might underlie the "slow learning" technique exploited by musicians. Under this paradigm, finger movements are first learned at a slower pace
while gradually refining the correctness of the temporal sequence later.

Optimal Policy Switching
------------------------

It seems to me that such a duality can already be accounted for in the options model. Furthermore,
the optimal policy switching work of {% cite Comanici2010 --style apa-intext %} provides algorithmic grounds
for realizing this type of learning. An option is defined as the tuple $$\langle \mathcal{I}, \pi, \beta \rangle$$
where $$\mathcal{I}$$ is the set of states under which the option can be initiated, $$\pi$$ is a policy for
the option, and $$\beta$$ is a termination function.

I see the *spectral features* of the birdsong as the option policy and the *temporal structure* being encoded through $$\beta$$.
Through a proper parametrization, {% cite Comanici2010 --style apa-intext %} showed how to use policy gradient methods to derive an optimal termination
function for the options. As postulated for the birdsong, this proposed approach also allows for dissociated learning stages:
the options policy (having most likely ill-defined termination functions) are first learned but are later refined through the policy gradient algorithm.

The concept of *interrupting options* had already been suggested in the seminal work of {% cite Sutton1999 --style apa-intext %}.
The intuition was that if it could be established that an option is not worthwhile following anymore, then it would be preferable to interrupt it
and switch to a better strategy, a better *option*. {% cite Comanici2010 --style apa-intext %} was the first to show how this idea could be accomplished. It was then
followed another policy gradient approach in {% cite Levy2012 %} that rather tried to solve the two learning problems jointly.

Under the light of these new neurological evidences, it could only be grist to the mill for the approach of {% cite Comanici2010 --style apa-intext %}.

References
----------

{% bibliography --cited %}

See also
--------

Harvard Gazette: [Deconstructing Motor Skills](http://news.harvard.edu/gazette/story/2013/09/deconstructing-motor-skills/)
