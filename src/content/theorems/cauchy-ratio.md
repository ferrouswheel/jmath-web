---
id: cauchy-ratio
title: Ratio of independent standard normals
kind: Representation theorem
order: 24
owner: distributions/cauchy
related:
  - distributions/normal
reference:
  url: https://www.randomservices.org/random/special/Cauchy.html
  label: "Random: Cauchy distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Cauchy.html
  label: "Random: Cauchy distribution"
---

## Description

Dividing one independent standard normal variable by another produces a Cauchy variable. A denominator close to zero explains how very large ratios can occur.

## Conditions

Independent Z₁, Z₂ ∼ N(0, 1). The event Z₂ = 0 has probability zero.

## Statement

$$
\frac{Z_1}{Z_2} \sim \operatorname{Cauchy}(0,1).
$$

## History

This representation connects Gaussian geometry with a heavy-tailed distribution. It is a standard change-of-variables example showing that well-behaved inputs need not produce a ratio with finite moments.

## Worked example

Thus x₀ + s(Z₁/Z₂) gives Cauchy(x₀, s) for s > 0.

## Proof sketch

Set Z₁ = ry and Z₂ = y. Integrating the joint density with Jacobian |y| gives ∫ |y| exp(−(1 + r²)y²/2)/(2π) dy = 1/(π(1 + r²)).
