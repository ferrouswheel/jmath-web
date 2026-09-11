---
id: uniform-affine
title: Affine construction
kind: Transformation
order: 2
owner: distributions/uniform
related: []
reference:
  url: https://www.randomservices.org/random/special/UniformContinuous.html
  label: "Random: Uniform distribution on an interval"
historyReference:
  url: https://www.randomservices.org/random/special/UniformContinuous.html
  label: "Random: Uniform distribution on an interval"
---

## Description

A single uniform draw on the unit interval can generate a uniform draw on any finite interval. Shifting changes the location; scaling changes the width.

## Conditions

U ∼ U(0, 1) and real a < b.

## Statement

$$
a + (b-a)U \sim \operatorname{U}(a,b).
$$

## History

This is a basic location-and-scale construction in continuous probability. Its modern computational role is to turn a standard uniform random-number source into draws in the units required by an application.

## Worked example

2 + 6U is uniform on [2, 8].

## Proof sketch

For a ≤ x ≤ b, the transformed CDF is P(U ≤ (x − a)/(b − a)) = (x − a)/(b − a). Outside the interval it is 0 or 1.
