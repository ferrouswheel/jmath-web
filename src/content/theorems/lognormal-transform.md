---
id: lognormal-transform
title: Normal logarithms
kind: Transformation
order: 18
owner: distributions/lognormal
related:
  - distributions/normal
reference:
  url: https://www.randomservices.org/random/special/LogNormal.html
  label: "Random: Lognormal distribution"
historyReference:
  url: https://www.randomservices.org/random/special/LogNormal.html
  label: "Random: Lognormal distribution"
---

## Description

Exponentiating a normal variable creates a positive, typically skewed variable. Conversely, logarithms reveal the normal structure hidden inside a lognormal model.

## Conditions

Z ∼ N(μ, σ²), σ > 0; μ and σ describe the logarithm, not the original variable.

## Statement

$$
X=e^Z\sim\operatorname{LN}(\mu,\sigma^2), \qquad \ln X\sim\mathcal{N}(\mu,\sigma^2).
$$

## History

The lognormal family connects additive models on a logarithmic scale with multiplicative models on the original scale. This transformation is the defining link between the normal and lognormal distributions.

## Worked example

For LN(0, 1), the median is 1 while the mean is exp(1/2).

## Proof sketch

For x > 0, P(exp(Z) ≤ x) = P(Z ≤ ln x). Differentiating gives the lognormal density, including the factor 1/x from the change of variables.
