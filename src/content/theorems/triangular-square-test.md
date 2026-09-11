---
id: triangular-square-test
title: Recognising triangular numbers
kind: Characterisation
order: 40
owner: sequences/triangular
related:
  - sequences/squares
reference:
  label: "OEIS A000217: formulas and references"
  url: https://oeis.org/A000217
historyReference:
  label: "OEIS A000217: formulas and references"
  url: https://oeis.org/A000217
---

## Description

A square test can decide whether an integer is triangular. Completing the square also recovers the index of the corresponding triangular number.

## Conditions

Integer m ≥ 0.

## Statement

$$
m\text{ is triangular} \iff 8m+1\text{ is an odd perfect square.}
$$

## History

The characterisation translates a figurate-number problem into a quadratic equation. It is an example of using algebra to recognise numbers originally described by geometric arrangements.

## Worked example

For m = 15: 8 × 15 + 1 = 121 = 11², giving n = (11 − 1)/2 = 5.

## Proof sketch

If m = n(n + 1)/2, then 8m + 1 = (2n + 1)². Conversely, if 8m + 1 = r² with r a positive odd integer, n = (r − 1)/2 is a nonnegative integer and substitution gives m = Tₙ.
