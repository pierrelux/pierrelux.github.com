---
layout: post-no-feature
category : tip 
tags : [matlab, matrix]
tagline :
---
Sure we have arrayfun, but it applies a function every element of a matrix. What if we want to compute the sum over each row or column for example ?

The trick that I'm presenting here lies in the use of the `num2cell` function.

In the example below, we add a 1x4 vector to every row of a matrix A. 
    >> A = magic(4)
    A =
    
    16     2     3    13
     5    11    10     8
     9     7     6    12
     4    14    15     1
    
    >> y = [1 2 3 4];
    >> B = cellfun(@(x)(x + y), num2cell(A, 2), ‘UniformOutput’, false)
    
    B = 
    
    [1x4 double]
    [1x4 double]
    [1x4 double]
    [1x4 double]

    >> cell2mat(B)
    
    ans =
    
    17     4     6    17
     6    13    13    12
    10     9     9    16
     5    16    18     5

If we wanted to do a similar operation but this time over the columns, we would write `num2cell(A, 1)` : "1" instead of "2". 


