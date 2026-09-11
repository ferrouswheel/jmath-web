---
id: binary-geometric-sum
title: Finite geometric sum
kind: Identity
order: 46
owner: sequences/powers-of-two
related: []
reference:
  label: "OEIS A000079: formulas and references"
  url: https://oeis.org/A000079
historyReference:
  label: "Euclid, Elements IX.35: geometric progressions"
  url: https://mathcs.clarku.edu/~djoyce/elements/bookIX/propIX35.html
---

## Description

Adding powers of two through a chosen level gives one less than the next power. In a complete binary tree, this counts all nodes through that depth.

## Conditions

Integer n ≥ 0.

## Statement

$$
\sum_{k=0}^{n}2^k = 2^{n+1}-1.
$$

## History

Geometric progressions already appear in Euclid’s Elements, Book IX, Proposition 35. The powers-of-two identity is the ratio-two case of the finite geometric-sum rule.

## Worked example

For n = 4: 1 + 2 + 4 + 8 + 16 = 31.

## Proof sketch

Call the sum S. Subtract S from 2S: all intermediate powers cancel and S = 2ⁿ⁺¹ − 1 remains. In the powers-of-two explorer’s tree diagram, this counts all nodes through depth n, whereas 2ⁿ counts just the leaves.
