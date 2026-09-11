---
id: negative-binomial-sum
title: Adding failure counts
kind: Closure theorem
order: 14
owner: distributions/negative-binomial
related:
  - distributions/geometric
reference:
  url: https://www.randomservices.org/random/bernoulli/NegativeBinomial.html
  label: "Random: Negative binomial distribution"
historyReference:
  url: https://www.randomservices.org/random/bernoulli/NegativeBinomial.html
  label: "Random: Negative binomial distribution"
---

## Description

Independent failure counts can be combined when the success probability is shared. Their target numbers of successes add.

## Conditions

Independent X ∼ NB(r₁, p), Y ∼ NB(r₂, p); positive integer r₁, r₂ and common 0 < p ≤ 1. Both count failures.

## Statement

$$
X+Y \sim \operatorname{NB}(r_1+r_2,p).
$$

## History

This closure property comes from the waiting-time interpretation of the negative binomial law. Expressing each count as geometric blocks gives a constructive explanation for the algebraic identity.

## Worked example

NB(2, 0.4) plus an independent NB(3, 0.4) gives NB(5, 0.4).

## Proof sketch

Each count is a sum of independent geometric failure counts. Combining the two collections gives r₁ + r₂ such counts with the same success probability.
