---
id: hexagonal-sum
title: Sum of hexagonal numbers
kind: Identity
order: 45
owner: sequences/hexagonal
related:
  - sequences/squares
  - sequences/triangular
reference:
  label: "OEIS A000384: formulas and references"
  url: https://oeis.org/A000384
historyReference:
  label: "OEIS A000384: formulas and references"
  url: https://oeis.org/A000384
---

## Description

The total of the first n hexagonal numbers has a cubic formula. Writing each term as twice a square minus its index reduces the problem to familiar sums.

## Conditions

Integer n ≥ 0.

## Statement

$$
\sum_{k=1}^{n}H_k = \frac{n(n+1)(4n-1)}{6}.
$$

## History

This result joins polygonal-number formulas with finite power sums. It illustrates a reusable method: expand a sequence term as a polynomial, then sum its powers separately.

## Worked example

For n = 4: 1 + 6 + 15 + 28 = 50.

## Proof sketch

Since Hₖ = 2k² − k, the sum is twice the sum of squares minus the sum of integers. Substitute n(n + 1)(2n + 1)/6 and n(n + 1)/2, then simplify.
