---
id: weibull-exponential
title: Power transform to an exponential
kind: Transformation
order: 26
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

A power transformation turns a Weibull lifetime into a standard exponential variable. This supplies a direct way to understand and generate Weibull samples.

## Conditions

X ∼ Weibull(k, s), shape k > 0 and scale s > 0.

## Statement

$$
\left(\frac{X}{s}\right)^k \sim \operatorname{Exp}(1).
$$

## History

Waloddi Weibull extensively studied and promoted the distribution’s applications, although he was not its first user. The exponential transformation exposes the family’s underlying structure.

## Worked example

For Weibull(2, 3), (X/3)² has a rate-1 exponential distribution.

## Proof sketch

For y ≥ 0, P((X/s)ᵏ > y) = P(X > sy¹⁄ᵏ) = exp(−y). At k = 1, X itself is exponential with rate 1/s.
