---
id: arctangent-inverse
title: Inverse identities and branch restriction
kind: Identity
order: 60
owner: trigonometry/arctan
related:
  - trigonometry/tan
reference:
  label: "NIST DLMF: inverse trigonometric functions"
  url: https://dlmf.nist.gov/4.23
historyReference:
  label: "MacTutor: history of trigonometric functions"
  url: https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/
---

## Description

Arctangent converts a slope into a unique angle between its two vertical limits. A line’s other directions differ by whole half-turns.

## Conditions

Any real x. For the second identity, −π/2 < θ < π/2.

## Statement

$$
\tan(\arctan x)=x, \qquad \arctan(\tan\theta)=\theta \quad\left(-\frac\pi2<\theta<\frac\pi2\right).
$$

## History

Tangent tables linked directions with ratios before the modern notation for inverse trigonometric functions.

## Worked example

arctan(tan(3π/4)) = −π/4.

## Proof sketch

Tangent is continuous and strictly increasing from −∞ to ∞ between its poles at −π/2 and π/2. Restricting to that interval defines its inverse.
