---
id: cosine-addition
title: Angle addition
kind: Identity
order: 52
owner: trigonometry/cos
related:
  - trigonometry/sin
reference:
  label: "NIST DLMF: trigonometric identities"
  url: https://dlmf.nist.gov/4.21
historyReference:
  label: "MacTutor: history of trigonometric functions"
  url: https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/
---

## Description

The cosine addition formula gives the horizontal component after successive rotations. Its subtraction term captures how vertical motion affects the new horizontal coordinate.

## Conditions

Any real angles α and β.

## Statement

$$
\cos(\alpha+\beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta.
$$

## History

Chord geometry and astronomical tables preceded the modern sine-and-cosine notation for addition formulas.

## Worked example

cos(π/6 + π/6) = 3/4 − 1/4 = 1/2.

## Proof sketch

Rotate (cos α, sin α) by β. The first row of the rotation matrix is (cos β, −sin β), which gives the horizontal coordinate.
