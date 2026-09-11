---
id: exponential-minimum
title: Minimum of independent waiting times
kind: Closure theorem
order: 5
owner: distributions/exponential
related:
  - distributions/poisson
reference:
  url: https://www.randomservices.org/random/poisson/Exponential.html
  label: "Random: Exponential distribution"
historyReference:
  url: https://www.randomservices.org/random/poisson/Exponential.html
  label: "Random: Exponential distribution"
---

## Description

When independent exponential clocks race, the first alarm is also exponential. Its rate is the total of all the competing rates.

## Conditions

Independent Xᵢ ∼ Exp(λᵢ), each rate λᵢ > 0; a finite nonempty collection.

## Statement

$$
\min(X_1,\ldots,X_n) \sim \operatorname{Exp}\!\left(\sum_{i=1}^{n}\lambda_i\right).
$$

## History

Competing clocks are a standard construction in Poisson-process models. The identity translates several possible arrival mechanisms into one combined waiting-time law.

## Worked example

The first of independent rate-2 and rate-3 arrivals has an Exp(5) waiting time.

## Proof sketch

The minimum exceeds t precisely when every waiting time exceeds t. Multiply their survival functions to get exp(−t Σλᵢ).
