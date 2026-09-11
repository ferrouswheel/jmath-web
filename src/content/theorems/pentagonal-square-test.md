---
id: pentagonal-square-test
title: Recognising pentagonal numbers
kind: Characterisation
order: 43
owner: sequences/pentagonal
related:
  - sequences/squares
reference:
  label: "OEIS A000326: formulas and references"
  url: https://oeis.org/A000326
historyReference:
  label: "OEIS A000326: formulas and references"
  url: https://oeis.org/A000326
---

## Description

Recognising a pentagonal number requires both a perfect square and a remainder condition. The remainder condition ensures that solving the quadratic gives an integer index.

## Conditions

Integer m > 0. The zero term P₀ = 0 is handled separately.

## Statement

$$
m\text{ is pentagonal} \iff \begin{cases}24m+1=r^2,\\r\in\mathbb{Z}_{>0},\quad r\equiv 5\pmod{6}.\end{cases}
$$

## History

This is the algebraic recognition problem for a polygonal sequence. Completing the square reveals why a discriminant test alone is insufficient: an index must also satisfy an integrality condition.

## Worked example

For m = 22: 24 × 22 + 1 = 529 = 23²; (23 + 1)/6 = 4.

## Proof sketch

The formula gives 24Pₙ + 1 = (6n − 1)². Conversely, the stated condition makes n = (r + 1)/6 a positive integer; substitution gives Pₙ = m. A square alone is not enough: m = 2 gives 49, but (7 + 1)/6 is not an integer.
