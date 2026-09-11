---
id: pareto-log
title: Logarithm of a Pareto variable
kind: Transformation
order: 30
owner: distributions/pareto
related:
  - distributions/exponential
reference:
  url: https://www.randomservices.org/random/special/Pareto.html
  label: "Random: Pareto distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Pareto.html
  label: "Random: Pareto distribution"
---

## Description

Taking a logarithm converts a Pareto power-law tail into an exponential tail. This gives a simple connection between scale ratios and additive waiting-time models.

## Conditions

X ∼ Pareto(xₘ, α), minimum xₘ > 0 and shape α > 0; Type I convention.

## Statement

$$
\ln\!\left(\frac{X}{x_m}\right) \sim \operatorname{Exp}(\alpha).
$$

## History

The family is named for the economist Vilfredo Pareto. Its power-law decay becomes exponential decay on a logarithmic scale, explaining this transformation.

## Worked example

For Pareto(2, 3), ln(X/2) is exponential with rate 3.

## Proof sketch

For y ≥ 0, P(ln(X/xₘ) > y) = P(X > xₘ exp(y)) = exp(−αy), using the Pareto survival function.
