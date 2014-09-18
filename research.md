---
layout: page
title: "Research"
description: ""
---
{% include JB/setup %}

<p>I have recently submitted my master's thesis under the supervision of Professor
<a href="http://www.cs.mcgill.ca/~dprecup/">Doina Precup</a></p>

<p> This coming fall 2013, I will also embark on a PhD with Professor Precup and we will attempt to pursue the current research on the options discovery problem.</p>

<div class="page-header">
  <h3>Master's Thesis</h3>
</div>

<div class="row">
  <div class="span12">
    <p>In my master's thesis, I explored the widely used Bottleneck Concept for options discovery in Reinforcement Learning. This intuition has lead a number of authors to
    propose algorithmic solutions to automatically find useful problem decompositions for speeding up learning. Despite a rich body of work on the topic, proper theoretical
    motivations are still lacking. Furthermore, most of the approaches have fallen to a view of the bottleneck concept which tries to find geometrical features of the
    environment rather than proper structures of the solution space. We explain that the essence of the bottleneck concept can be understood through the properties of the graph Laplacian of the MDP which, if accessible, would not show such a weakness. This thesis is an initial foray towards laying down some theoretical basis for understanding the
    bottleneck concept. An options discovery algorithm applicable in continuous state space was also proposed based on the graph partitioning perspective underlying
    this concept. This is the fist such algorithm which attempts to escape the beaten pathways of the pathologically optimal four-rooms grid-world domain.</p>

    <p>This work allowed me to set up my research agenda for my PhD. I am particularly interested at the moment in the possible information theoretic interpretation of
    options discovery. It would not only bridge with the previous work on graph partitioning approaches but also shed some light towards possibly stronger
    principle underlying temporal abstraction in general.</p>

    <p><cite>Bacon, Pierre-Luc. "On the Bottleneck Concept: Theoretical Underpinnings and Extension in Continuous State Spaces". Master's Thesis. McGill University</cite></p>
  </div>
 </div>

<div class="page-header">
    <h3>Projects</h3>
 </div>

 <div class="row">
 <div class="span12"><p>Here are some of the class projects that I worked on over 2011-2012 for my Master's degree.</p></div>

  <div class="span4">
  <h4><a href="assets/papers/optionsdetect.pdf">Automatic Options Discovery</a></h4>
  Based on the bottleneck concept, I proposed a near-linear incremental
  options discovery algorithm based on a label propagation algorithm for
  community detection in networks.
  </div>

  <div class="span4">
   <h4><a href="assets/papers/hmmskin.pdf">Gesture Recognition</a> <small>for an Artificial Skin</small></h4>
   An HMM-based algorithm for detecting tactile patterns on a novel type
   of artificial skin sensor manufactured by Meka Robotics LLC was designed.
  </div>


  <div class="span4">
   <h4><a href="assets/papers/rrfpose.pdf">Continuous Head Pose Estimation</a></h4>
     <!--<ul class="thumbnails">
        <li class="span2"><a href="#" class="thumbnail"><img src="http://placehold.it/160x120" alt=""></a></li>
        <li class="span2"><a href="#" class="thumbnail"><img src="http://placehold.it/160x120" alt=""></a></li>
     </ul>-->

   Head pose is a rich visual cue that finds great interest
   in the field of human robot interaction (HRI) and for video
   surveillance applications. I proposed a regression solution to
   head pose estimation based on random regression forests
   trained over SURF features.
  </div>
 </div>
