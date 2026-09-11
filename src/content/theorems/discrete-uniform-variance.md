---
id: discrete-uniform-variance
title: Variance of consecutive uniform integers
kind: Moment identity
order: 17
owner: distributions/discrete-uniform
related: []
reference:
  url: https://www.randomservices.org/random/special/UniformDiscrete.html
  label: "Random: Discrete uniform distributions"
historyReference:
  url: https://www.randomservices.org/random/special/UniformDiscrete.html
  label: "Random: Discrete uniform distributions"
---

## Description

The spread of consecutive equally likely integers depends only on how many values there are. Shifting the range changes the mean but leaves the variance unchanged.

## Conditions

X ∼ DU(a, b), integer a ≤ b; M = b − a + 1.

## Statement

$$
\mathbb{E}[X] = \frac{a+b}{2}, \qquad \operatorname{Var}(X) = \frac{M^2-1}{12}.
$$

## History

This moment formula combines finite probability with the classical sums of integers and squares. The uniform model makes those algebraic sums into averages.

## Worked example

For a fair six-sided die, the mean is 3.5 and the variance is 35/12.

## Proof sketch

Shift to J = X − a, uniform on 0 through M − 1. The formulas for Σj and Σj² give E[J] = (M − 1)/2 and E[J²] = (M − 1)(2M − 1)/6. Subtract the squared mean; shifting does not change variance.
