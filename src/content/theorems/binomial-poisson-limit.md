---
id: binomial-poisson-limit
title: Poisson limit of rare events
kind: Limit theorem
order: 7
owner: distributions/binomial
related:
  - distributions/poisson
reference:
  url: https://www.randomservices.org/random/bernoulli/Binomial.html
  label: "Random: Binomial distribution"
historyReference:
  url: https://www.randomservices.org/random/bernoulli/Binomial.html
  label: "Random: Binomial distribution"
---

## Description

Many opportunities for individually rare events can produce an approximately Poisson count. Keeping the expected count fixed gives a useful bridge between binomial and Poisson models.

## Conditions

Xₙ ∼ Bin(n, pₙ), with n → ∞ and npₙ → λ > 0.

## Statement

$$
\Pr(X_n=k) \longrightarrow \frac{e^{-\lambda}\lambda^k}{k!} \quad \text{for each fixed integer } k\ge 0.
$$

## History

This is the classical rare-event limit connecting Bernoulli trials with Poisson counts. It explains why a model with a fixed number of opportunities can approach one described only by an expected event count.

## Worked example

Bin(100, 0.02) can be approximated by Poisson(2): their zero-event probabilities are 0.98¹⁰⁰ and exp(−2).

## Proof sketch

In C(n, k)pₙᵏ(1 − pₙ)ⁿ⁻ᵏ, the first two factors tend to λᵏ/k!, and the last tends to exp(−λ). The finite-n distributions are not identical.
