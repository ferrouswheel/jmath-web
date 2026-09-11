---
id: arcsine-inverse
title: Inverse identities and branch restriction
kind: Identity
order: 56
owner: trigonometry/arcsin
related:
  - trigonometry/sin
reference:
  label: "NIST DLMF: inverse trigonometric functions"
  url: https://dlmf.nist.gov/4.23
historyReference:
  label: "MacTutor: history of trigonometric functions"
  url: https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/
---

## Description

Arcsine undoes sine only after an angle interval has been chosen. Outside that interval, the same sine value is represented by a different principal angle.

## Conditions

−1 ≤ x ≤ 1. For the second identity, −π/2 ≤ θ ≤ π/2.

## Statement

$$
\sin(\arcsin x)=x, \qquad \arcsin(\sin\theta)=\theta \quad\left(-\frac\pi2\le\theta\le\frac\pi2\right).
$$

## History

Recovering angles from tabulated ratios preceded modern inverse-function notation. Principal branches make that recovery single-valued.

## Worked example

arcsin(sin(5π/6)) = π/6, not 5π/6.

## Proof sketch

Sine is continuous and strictly increasing on [−π/2, π/2], mapping it onto [−1, 1]. Its inverse is defined on exactly that restriction.
