---
id: sum-of-squares
title: Sum of squares
kind: Identity
order: 35
owner: sequences/squares
related:
  - sequences/cubes
reference:
  label: "OEIS A000290: formulas and references"
  url: https://oeis.org/A000290
historyReference:
  label: "OEIS A000290: formulas and references"
  url: https://oeis.org/A000290
---

## Description

A cubic expression replaces a long sum of square numbers. It is useful for exact totals and for computing moments of evenly spaced data.

## Conditions

Integer n ≥ 0.

## Statement

$$
\sum_{k=1}^{n}k^2 = \frac{n(n+1)(2n+1)}{6}.
$$

## History

Sums of powers connect sequence arithmetic with polynomial formulas. Here a cubic polynomial has successive differences equal to squares, illustrating the discrete counterpart of antidifferentiation.

## Worked example

For n = 4: 1 + 4 + 9 + 16 = 30.

## Proof sketch

Let Q(n) = n(n + 1)(2n + 1)/6. Direct expansion gives Q(n) − Q(n − 1) = n², and Q(0) = 0. Summing the differences proves the formula.
