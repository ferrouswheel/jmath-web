---
id: uniform-maximum
title: Maximum of uniform samples
kind: Order-statistic identity
order: 3
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

The largest of several uniform draws is biased toward the upper endpoint. Its distribution quantifies how quickly repeated sampling approaches that endpoint.

## Conditions

U₁, …, Uₙ are independent U(0, 1) variables; integer n ≥ 1. M is their maximum.

## Statement

$$
\Pr(M \le x) = x^n \quad (0 \le x \le 1), \qquad \mathbb{E}[M] = \frac{n}{n+1}.
$$

## History

This result belongs to order statistics, the study of sorted observations. The maximum illustrates the central method: translate an event about a ranked observation into events about the original sample.

## Worked example

For three draws, P(M ≤ 1/2) = 1/8 and E[M] = 3/4.

## Proof sketch

All n draws must be at most x, giving xⁿ by independence. Differentiate to obtain density nxⁿ⁻¹ and integrate x times this density to get the mean.
