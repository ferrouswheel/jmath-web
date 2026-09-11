---
id: tangent-addition
title: Angle addition
kind: Identity
order: 55
owner: trigonometry/tan
related:
  - trigonometry/sin
  - trigonometry/cos
reference:
  label: "NIST DLMF: trigonometric identities"
  url: https://dlmf.nist.gov/4.21
historyReference:
  label: "MacTutor: history of trigonometric functions"
  url: https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/
---

## Description

Combining two angles combines their slopes by a rational formula. The denominator identifies where the resulting direction becomes vertical.

## Conditions

cos(α), cos(β), and cos(α + β) are all nonzero.

## Statement

$$
\tan(\alpha+\beta) = \frac{\tan\alpha+\tan\beta}{1-\tan\alpha\tan\beta}.
$$

## History

Tangent formulas extend the angle-combination methods associated with trigonometric calculation and tables.

## Worked example

tan(π/6 + π/6) = √3.

## Proof sketch

Divide the sine addition formula by the cosine addition formula, then divide numerator and denominator by cos α cos β. The assumptions ensure every denominator is nonzero.
