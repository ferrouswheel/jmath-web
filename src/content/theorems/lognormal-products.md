---
id: lognormal-products
title: Products of independent lognormal variables
kind: Closure theorem
order: 19
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

Independent lognormal factors have a lognormal product. Their logarithmic means and variances add, making repeated multiplicative effects tractable.

## Conditions

Independent X ∼ LN(μ₁, σ₁²) and Y ∼ LN(μ₂, σ₂²), with positive σ₁, σ₂.

## Statement

$$
XY \sim \operatorname{LN}\!\left(\mu_1+\mu_2,\;\sigma_1^2+\sigma_2^2\right).
$$

## History

The identity transfers the normal family’s addition property through logarithms. It sits in the tradition of simplifying products by turning them into sums.

## Worked example

The product of two independent LN(0, 1) variables is LN(0, 2).

## Proof sketch

ln(XY) = ln(X) + ln(Y). These are independent normal variables, so their means and variances add. Exponentiate to obtain the result.
