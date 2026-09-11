---
id: laplace-difference
title: Difference of exponential variables
kind: Representation theorem
order: 20
owner: distributions/laplace
related:
  - distributions/exponential
reference:
  url: https://www.randomservices.org/random/special/Laplace.html
  label: "Random: Laplace distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Laplace.html
  label: "Random: Laplace distribution"
---

## Description

Subtracting two independent exponential waiting times creates a symmetric Laplace variable. The construction explains both its sharp central peak and its two exponential tails.

## Conditions

Independent E₁, E₂ ∼ Exp(1/s), with scale s > 0 and real μ.

## Statement

$$
\mu+E_1-E_2 \sim \operatorname{Laplace}(\mu,s).
$$

## History

The distribution is named after Pierre Simon Laplace and is also called double exponential. Its representation as a difference makes the connection with exponential variables concrete.

## Worked example

Subtracting two independent rate-2 waiting times gives Laplace(0, 1/2).

## Proof sketch

For d ≥ 0, the difference density is ∫₀∞ s⁻² exp(−(y + d)/s) exp(−y/s) dy = exp(−d/s)/(2s). Symmetry supplies d < 0; then shift by μ.
