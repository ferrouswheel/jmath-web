---
id: rayleigh-square
title: Squared radius and the exponential
kind: Transformation
order: 29
owner: distributions/rayleigh
related:
  - distributions/exponential
  - distributions/weibull
reference:
  url: https://www.randomservices.org/random/special/Rayleigh.html
  label: "Random: Rayleigh distribution"
historyReference:
  label: "Random: Weibull and Rayleigh distributions"
  url: https://www.randomservices.org/random/special/Weibull.html
---

## Description

The squared Rayleigh radius, after scaling, is exponential. The same radius also belongs to the Weibull family with shape two.

## Conditions

R ∼ Rayleigh(σ), σ > 0.

## Statement

$$
\frac{R^2}{2\sigma^2} \sim \operatorname{Exp}(1), \qquad R\sim\operatorname{Weibull}(2,\sigma\sqrt{2}).
$$

## History

The Rayleigh distribution is named for William Strutt, Lord Rayleigh. Its inclusion in the Weibull family links a radial model to a broader class of lifetime distributions.

## Worked example

If σ = 2, R²/8 is exponential with rate 1.

## Proof sketch

Substitute r = σ√(2y) into P(R > r) = exp(−r²/(2σ²)) to get exp(−y). The same survival function matches a Weibull with shape 2 and scale σ√2.
