---
id: normal-sums
title: Sums of independent normal variables
kind: Closure theorem
order: 1
owner: distributions/normal
related: []
reference:
  url: https://www.randomservices.org/random/special/Normal.html
  label: "Random: Normal distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Normal.html
  label: "Random: Normal distribution"
---

## Description

Independent normal contributions can be combined exactly by adding their means and variances. This is useful for modelling a total measurement error or the sum of Gaussian signals.

## Conditions

Independent X ∼ N(μ₁, σ₁²) and Y ∼ N(μ₂, σ₂²), with positive standard deviations.

## Statement

$$
X + Y \sim \mathcal{N}\!\left(\mu_1 + \mu_2,\; \sigma_1^2 + \sigma_2^2\right).
$$

## History

The name Gaussian honours Carl Friedrich Gauss, an early user of the normal distribution. Closure under addition helps explain the enduring role of this family in models of combined random effects.

## Worked example

N(1, 4) plus an independent N(2, 9) gives N(3, 13); the second parameter is variance.

## Proof sketch

Multiply the moment-generating functions exp(μt + σ²t²/2). Their exponents add, giving the moment-generating function of the stated normal distribution.
