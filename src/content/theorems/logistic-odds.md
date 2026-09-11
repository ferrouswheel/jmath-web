---
id: logistic-odds
title: CDF odds grow exponentially
kind: CDF identity
order: 23
owner: distributions/logistic
related: []
reference:
  url: https://www.randomservices.org/random/special/Logistic.html
  label: "Random: Logistic distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Logistic.html
  label: "Random: Logistic distribution"
---

## Description

For a logistic CDF, moving a fixed distance multiplies the cumulative odds by a fixed factor. Equivalently, the log-odds are a straight line in the input.

## Conditions

X ∼ Logistic(μ, s), s > 0; F is its CDF and x is finite.

## Statement

$$
\frac{F(x)}{1-F(x)} = e^{(x-\mu)/s}.
$$

## History

The odds formulation gives the logistic curve its connection to linear modelling on a transformed probability scale. The identity concerns cumulative odds, so it follows directly from the distribution’s CDF.

## Worked example

At x = μ + s ln(3), the cumulative odds are 3 and F(x) = 3/4.

## Proof sketch

Substitute F(x) = 1/(1 + exp(−(x − μ)/s)) and simplify. These are odds of the event X ≤ x, rather than a probability itself.
