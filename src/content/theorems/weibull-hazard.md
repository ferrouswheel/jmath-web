---
id: weibull-hazard
title: Shape controls the hazard rate
kind: Hazard identity
order: 27
owner: distributions/weibull
related:
  - distributions/exponential
reference:
  url: https://www.randomservices.org/random/special/Weibull.html
  label: "Random: Weibull distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Weibull.html
  label: "Random: Weibull distribution"
---

## Description

The Weibull shape parameter determines whether the instantaneous failure rate decreases, stays constant, or increases with age. One family can therefore describe several kinds of lifetime behaviour.

## Conditions

X ∼ Weibull(k, s), k, s > 0; x > 0. The hazard is h(x) = f(x)/P(X > x).

## Statement

$$
h(x) = \frac{k}{s}\left(\frac{x}{s}\right)^{k-1}.
$$

The hazard decreases for $k<1$, is constant for $k=1$, and increases for $k>1$.

## History

The family is named after Waloddi Weibull, who explored its broad applications. Its flexible hazard rate makes it useful for comparing different patterns of lifetime risk.

## Worked example

For k = 2 and s = 3, h(x) = 2x/9.

## Proof sketch

Divide the density by exp(−(x/s)ᵏ); the exponential factors cancel. The exponent k − 1 determines monotonicity. The formula is stated for x > 0 to avoid endpoint singularities.
