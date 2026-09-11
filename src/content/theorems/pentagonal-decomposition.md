---
id: pentagonal-decomposition
title: Pentagonal decomposition
kind: Identity
order: 42
owner: sequences/pentagonal
related:
  - sequences/triangular
reference:
  label: "OEIS A000326: formulas and references"
  url: https://oeis.org/A000326
historyReference:
  label: "OEIS A000326: formulas and references"
  url: https://oeis.org/A000326
---

## Description

A pentagonal number can be split into a line and three triangular counts. This explains the structure of the vertex-based pentagonal sequence used by the explorer.

## Conditions

Integer n ≥ 1.

## Statement

$$
P_n = n+3T_{n-1}.
$$

## History

Polygonal-number arithmetic describes numbers through geometric arrangements. The decomposition translates that viewpoint into a formula relating pentagonal and triangular counts.

## Worked example

For n = 4: 22 = 4 + 3 × 6.

## Proof sketch

Substitute Tₙ₋₁ = n(n − 1)/2. Then n + 3n(n − 1)/2 = n(3n − 1)/2. This decomposes the vertex-based polygonal count into a line of n dots and three triangular counts.
