---
id: arccosine-inverse
title: Inverse identities and branch restriction
kind: Identity
order: 58
owner: trigonometry/arccos
related:
  - trigonometry/cos
reference:
  label: "NIST DLMF: inverse trigonometric functions"
  url: https://dlmf.nist.gov/4.23
historyReference:
  label: "MacTutor: history of trigonometric functions"
  url: https://mathshistory.st-andrews.ac.uk/HistTopics/Trigonometric_functions/
---

## Description

Arccosine selects an angle in the upper half of the unit circle. Restricting cosine to that interval gives each input exactly one inverse angle.

## Conditions

−1 ≤ x ≤ 1. For the second identity, 0 ≤ θ ≤ π.

## Statement

$$
\cos(\arccos x)=x, \qquad \arccos(\cos\theta)=\theta \quad(0\le\theta\le\pi).
$$

## History

Inverse trigonometric notation formalised recovering an angle from a known trigonometric value.

## Worked example

arccos(cos(−π/3)) = π/3.

## Proof sketch

Cosine is continuous and strictly decreasing from 1 to −1 on [0, π]. Inverting that restriction selects a unique angle.
