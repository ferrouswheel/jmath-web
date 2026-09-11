---
id: exponential-memoryless
title: Memorylessness
kind: Characterising property
order: 4
owner: distributions/exponential
related:
  - distributions/geometric
reference:
  url: https://www.randomservices.org/random/poisson/Exponential.html
  label: "Random: Exponential distribution"
historyReference:
  url: https://www.randomservices.org/random/poisson/Exponential.html
  label: "Random: Exponential distribution"
---

## Description

For an exponential waiting time, surviving an initial period does not change the distribution of the remaining wait. This is a precise statement about conditional probability.

## Conditions

X ∼ Exp(λ), rate λ > 0; s, t ≥ 0.

## Statement

$$
\Pr(X > s+t \mid X > s) = \Pr(X>t) = e^{-\lambda t}.
$$

## History

Memorylessness connects exponential lifetimes with the constant-rate Poisson arrival model. In reliability theory, it describes a component whose elapsed lifetime supplies no information about its remaining lifetime.

## Worked example

At rate 2, waiting another 1 unit has probability exp(−2), even after waiting 3 units.

## Proof sketch

Divide the survival probabilities exp(−λ(s + t)) and exp(−λs). The elapsed-time factor cancels. This concerns the conditional remaining lifetime.
