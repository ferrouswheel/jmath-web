---
id: sine-addition
title: Angle addition
kind: Identity
order: 51
owner: trigonometry/sin
related:
  - trigonometry/cos
reference:
  label: "NIST DLMF: trigonometric identities"
  url: https://dlmf.nist.gov/4.21
historyReference:
  label: "MacTutor: history of trigonometric functions"
  url: https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/
---

## Description

The sine of a combined angle can be calculated from the sines and cosines of its parts. The identity expresses the vertical component of two successive rotations.

## Conditions

Any real angles α and β.

## Statement

$$
\sin(\alpha+\beta) = \sin\alpha\cos\beta + \cos\alpha\sin\beta.
$$

## History

Angle-combination methods grew from the calculation of chords and astronomical trigonometric tables.

## Worked example

sin(π/6 + π/6) = √3/2.

## Proof sketch

Rotate the vector (cos α, sin α) by β. The rotation matrix has second row (sin β, cos β), giving the new vertical coordinate.
