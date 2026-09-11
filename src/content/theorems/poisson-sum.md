---
id: poisson-sum
title: Superposition of independent counts
kind: Closure theorem
order: 8
owner: distributions/poisson
related:
  - distributions/binomial
reference:
  url: https://www.randomservices.org/random/poisson/Poisson.html
  label: "Random: Poisson distribution"
historyReference:
  url: https://www.randomservices.org/random/poisson/Poisson.html
  label: "Random: Poisson distribution"
---

## Description

Independent Poisson counts remain Poisson when combined. The expected counts add, making it possible to merge independent sources of events.

## Conditions

Independent X ∼ Poisson(λ₁) and Y ∼ Poisson(λ₂), λ₁, λ₂ > 0.

## Statement

$$
X+Y \sim \operatorname{Poisson}(\lambda_1+\lambda_2).
$$

## History

Superposition is the count-level counterpart of combining independent Poisson arrival processes. The binomial theorem supplies the algebra behind this closure property.

## Worked example

Independent counts with means 2 and 3 have a total with Poisson(5) distribution.

## Proof sketch

Convolve the PMFs. Factoring out exp(−λ₁ − λ₂)/k! leaves Σ C(k, j)λ₁ʲλ₂ᵏ⁻ʲ = (λ₁ + λ₂)ᵏ by the binomial theorem.
