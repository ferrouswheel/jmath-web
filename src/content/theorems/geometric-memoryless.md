---
id: geometric-memoryless
title: Discrete memorylessness
kind: Characterising property
order: 12
owner: distributions/geometric
related:
  - distributions/exponential
reference:
  url: https://www.randomservices.org/random/bernoulli/Geometric.html
  label: "Random: Geometric distribution"
historyReference:
  url: https://www.randomservices.org/random/bernoulli/Geometric.html
  label: "Random: Geometric distribution"
---

## Description

After a run of failures, independent trials still have the same chance of success. The geometric distribution expresses this as a memoryless law on whole-number waiting times.

## Conditions

G counts failures before the first success, with 0 < p < 1. Integers m, n ≥ 0.

## Statement

$$
\Pr(G\ge m+n\mid G\ge m) = \Pr(G\ge n) = (1-p)^n.
$$

## History

The geometric law is a waiting-time distribution in the Bernoulli trials model. Its lack of memory is the discrete counterpart of the exponential waiting-time property.

## Worked example

With p = 1/2, after three failures, the chance of at least two further failures remains 1/4.

## Proof sketch

Use P(G ≥ k) = (1 − p)ᵏ and divide the two tails. The ≥ convention matters because this site counts failures from 0. At p = 1, G = 0 and conditioning on G ≥ m is undefined for m > 0.
