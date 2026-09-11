---
id: bernoulli-variance
title: Variance bound
kind: Moment identity
order: 11
owner: distributions/bernoulli
related: []
reference:
  url: https://www.randomservices.org/random/bernoulli/Introduction.html
  label: "Random: Bernoulli trials"
historyReference:
  label: "Random: Bernoulli trials"
  url: https://www.randomservices.org/random/bernoulli/Introduction.html
---

## Description

A yes-or-no outcome has its greatest variance when both outcomes are equally likely. The bound gives a universal scale for the variability of a single indicator.

## Conditions

X ∼ Bern(p), 0 ≤ p ≤ 1.

## Statement

$$
\operatorname{Var}(X) = p(1-p) \le \frac14, \qquad \text{with equality iff } p=\frac12.
$$

## History

Within the Bernoulli trial model, named after Jacob Bernoulli, the identity follows from the fact that squaring zero or one leaves it unchanged.

## Worked example

At p = 0.2 the variance is 0.16; at p = 0.5 it is 0.25.

## Proof sketch

Since X² = X, Var(X) = E[X] − E[X]² = p − p². Completing the square gives 1/4 − (p − 1/2)².
