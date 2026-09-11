---
id: fibonacci-square-sum
title: Sum of squared Fibonacci numbers
kind: Identity
order: 39
owner: sequences/fibonacci
related:
  - sequences/squares
reference:
  label: "OEIS A000045: formulas and references"
  url: https://oeis.org/A000045
historyReference:
  label: "OEIS A000045: formulas and references"
  url: https://oeis.org/A000045
---

## Description

The areas of successive Fibonacci squares add up to a rectangle with consecutive Fibonacci side lengths. Algebraically, neighbouring products make the sum telescope.

## Conditions

Integer n ≥ 0; F₀ = 0 and F₁ = 1.

## Statement

$$
\sum_{k=1}^{n}F_k^2 = F_nF_{n+1}.
$$

## History

This identity belongs to the study of products and sums within recurrence sequences. The Fibonacci recurrence turns a difference of neighbouring products into a square, linking an algebraic proof with a tiling interpretation.

## Worked example

For n = 5: 1 + 1 + 4 + 9 + 25 = 40 = 5 × 8.

## Proof sketch

For k ≥ 1, FₖFₖ₊₁ − Fₖ₋₁Fₖ = Fₖ(Fₖ₊₁ − Fₖ₋₁) = Fₖ². Summing cancels intermediate products. The Fibonacci explorer’s square tiling gives the same identity as a rectangle area.
