---
id: logistic-logit
title: Logit of a uniform variable
kind: Transformation
order: 22
owner: distributions/logistic
related:
  - distributions/uniform
reference:
  url: https://www.randomservices.org/random/special/Logistic.html
  label: "Random: Logistic distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Logistic.html
  label: "Random: Logistic distribution"
---

## Description

The logit maps a probability between zero and one to the entire real line. Applying it to a uniform draw constructs a logistic random variable.

## Conditions

U ∼ U(0, 1), real μ, scale s > 0. The logarithm uses 0 < U < 1.

## Statement

$$
\mu+s\ln\!\left(\frac{U}{1-U}\right) \sim \operatorname{Logistic}(\mu,s).
$$

## History

The logistic distribution and the logit are linked through inverse distribution functions. This connection places probability-to-odds transformations and random-variable generation in the same framework.

## Worked example

For the standard logistic, the 0.75 quantile is ln(3).

## Proof sketch

Solve x = μ + s ln(u/(1 − u)) for u to get u = 1/(1 + exp(−(x − μ)/s)). Monotonicity makes this the transformed CDF.
