---
id: triangular-uniform-sum
title: Sum of two uniforms
kind: Representation theorem
order: 32
owner: distributions/triangular
related:
  - distributions/uniform
reference:
  url: https://www.randomservices.org/random/special/Triangle.html
  label: "Random: Triangle distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Triangle.html
  label: "Random: Triangle distribution"
---

## Description

The sum of two independent unit-uniform draws has a symmetric triangular density. Middle values are more likely because more pairs of draws can produce them.

## Conditions

Independent U, V ∼ U(0, 1). This result is for the symmetric triangular case.

## Statement

$$
U+V \sim \operatorname{Tri}(0,1,2).
$$

Parameters are ordered as minimum, mode, maximum.

## History

This is an elementary convolution example in continuous probability. Measuring the overlap of two intervals explains how a triangular density emerges from two flat densities.

## Worked example

The sum has density 1/2 at x = 1/2 and density 1 at its mode x = 1.

## Proof sketch

The convolution equals the length of [0, 1] ∩ [x − 1, x]. It is x on [0, 1], 2 − x on [1, 2], and 0 elsewhere. General asymmetric triangular distributions are not sums of two identical uniforms.
