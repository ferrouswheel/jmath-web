---
id: laplace-absolute
title: Absolute deviation is exponential
kind: Transformation
order: 21
owner: distributions/laplace
related:
  - distributions/exponential
reference:
  url: https://www.randomservices.org/random/special/Laplace.html
  label: "Random: Laplace distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Laplace.html
  label: "Random: Laplace distribution"
---

## Description

A Laplace variable’s distance from its centre is exponential. This converts a two-sided deviation question into a one-sided waiting-time calculation.

## Conditions

X ∼ Laplace(μ, s), s > 0.

## Statement

$$
|X-\mu| \sim \operatorname{Exp}(1/s).
$$

## History

The name double exponential describes the two exponential halves of the Laplace density. Folding those halves together gives the absolute-deviation identity.

## Worked example

For Laplace(0, 2), P(|X| > 4) = exp(−2).

## Proof sketch

For t ≥ 0, add the two equal tails beyond μ ± t. Their sum is exp(−t/s), the exponential survival function.
