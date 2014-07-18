---
layout: post-no-feature
category : tip 
tags : [matlab, matrix]
tagline :
---

I have came across this problem very often, but always ended up solving it in a different way each time. Here is what looks to me to be the most concise way of doing it.

## Indexing the diagonal

    >> A = magic(4)
    A =
    16     2     3    13
     5    11    10     8
     9     7     6    12
     4    14    15     1
    
    >> A(1:length(A)+1:numel(A))
    ans =
    16    11     6     1

    >> A(1:length(A)+1:numel(A)) = 1
    A =
     1     2     3    13
     5     1    10     8
     9     7     1    12
     4    14    15     1

## Selecting off-diagonal entries

    >> A = magic(4)
    A =
    16     2     3    13
     5    11    10     8
     9     7     6    12
     4    14    15     1
    
    >> A(setdiff(1:numel(A), 1:length(A)+1:numel(A))) = 0
    A =
    16     0     0     0
     0    11     0     0
     0     0     6     0
     0     0     0     1
    >>
