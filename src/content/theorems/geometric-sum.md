---
id: geometric-sum
title: Waiting for several successes
kind: Representation theorem
order: 13
owner: distributions/geometric
related:
  - distributions/negative-binomial
  - distributions/bernoulli
reference:
  url: https://www.randomservices.org/random/bernoulli/Geometric.html
  label: "Random: Geometric distribution"
historyReference:
  url: https://www.randomservices.org/random/bernoulli/Geometric.html
  label: "Random: Geometric distribution"
---

## Description

Waiting for several successes can be split into independent waits for one success at a time. Adding their failure counts produces the negative binomial distribution.

## Conditions

Independent G₁, …, Gᵣ ∼ Geom(p), counting failures; integer r ≥ 1, 0 < p ≤ 1.

## Statement

$$
\sum_{i=1}^{r} G_i \sim \operatorname{NB}(r,p).
$$

## History

Geometric and negative binomial laws describe two stopping rules for Bernoulli trials. This representation explains their relationship without treating them as unrelated formulas.

## Worked example

The sum of three independent Geom(1/2) variables counts failures before the third success.

## Proof sketch

Partition independent Bernoulli trials into blocks ending in a success. Each block contributes a geometric failure count, and the combined count stops at the rth success.
