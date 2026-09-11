---
id: odd-number-sum
title: Sum of consecutive odd numbers
kind: Identity
order: 34
owner: sequences/squares
related: []
reference:
  label: "OEIS A000290: formulas and references"
  url: https://oeis.org/A000290
historyReference:
  label: "OEIS A000290: formulas and references"
  url: https://oeis.org/A000290
---

## Description

Successive odd numbers build successive squares. The identity connects a numerical sum with adding an L-shaped border to a square of dots.

## Conditions

Integer n ≥ 0; an empty sum is 0.

## Statement

$$
\sum_{k=1}^{n}(2k-1) = 1+3+\cdots+(2n-1) = n^2.
$$

## History

This belongs to the geometric approach to figurate numbers: arithmetic patterns can be represented as arrangements of dots. The modern telescoping proof expresses the same border construction as differences of squares.

## Worked example

For n = 5: 1 + 3 + 5 + 7 + 9 = 25.

## Proof sketch

The difference k² − (k − 1)² is 2k − 1. Summing these differences from k = 1 to n cancels every intermediate square, leaving n². Geometrically, each odd number adds one border to the square.
