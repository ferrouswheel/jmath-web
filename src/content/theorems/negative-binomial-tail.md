---
id: negative-binomial-tail
title: Connection to binomial counts
kind: Tail identity
order: 15
owner: distributions/negative-binomial
related:
  - distributions/binomial
reference:
  url: https://www.randomservices.org/random/bernoulli/NegativeBinomial.html
  label: "Random: Negative binomial distribution"
historyReference:
  url: https://www.randomservices.org/random/bernoulli/NegativeBinomial.html
  label: "Random: Negative binomial distribution"
---

## Description

A question about how long it takes to reach a target number of successes can be restated as a question about a fixed number of trials. The identity allows either distribution to calculate the same probability.

## Conditions

X ∼ NB(r, p) counts failures before r successes; integer r ≥ 1, k ≥ 0 and 0 < p ≤ 1.

## Statement

$$
\Pr(X\le k) = \Pr\!\left(\operatorname{Bin}(r+k,p)\ge r\right).
$$

## History

Binomial counts and negative binomial waiting times are two views of the same Bernoulli experiment. Switching between a fixed horizon and a stopping time is the conceptual source of this tail identity.

## Worked example

For r = 2, p = 1/2, k = 1: P(X ≤ 1) = P(Bin(3, 1/2) ≥ 2) = 1/2.

## Proof sketch

At most k failures before the rth success means that success occurs by trial r + k. Equivalently, the first r + k trials contain at least r successes.
