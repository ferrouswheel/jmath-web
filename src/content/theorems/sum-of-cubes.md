---
id: sum-of-cubes
title: Sum of cubes
kind: Identity
order: 36
owner: sequences/cubes
related:
  - sequences/triangular
  - sequences/squares
reference:
  label: "OEIS A000578: formulas and references"
  url: https://oeis.org/A000578
historyReference:
  label: "OEIS A000578: formulas and references"
  url: https://oeis.org/A000578
---

## Description

Adding the first n cubes gives the square of the nth triangular number. The result unexpectedly ties a sum of volumes to the square of a linear sum.

## Conditions

Integer n ≥ 0; Tₙ = n(n + 1)/2.

## Statement

$$
\sum_{k=1}^{n}k^3 = T_n^2 = \left(\frac{n(n+1)}{2}\right)^2.
$$

## History

This classical power-sum identity links cubic and triangular sequences. A telescoping proof places it in the general method of finding a formula whose successive differences equal the terms being summed.

## Worked example

For n = 4: 1 + 8 + 27 + 64 = 100 = 10².

## Proof sketch

Tₖ² − Tₖ₋₁² = (Tₖ − Tₖ₋₁)(Tₖ + Tₖ₋₁) = k · k² = k³. Sum from k = 1 to n; the left side telescopes to Tₙ².
