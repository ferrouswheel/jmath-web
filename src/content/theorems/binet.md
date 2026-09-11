---
id: binet
title: Binet’s formula
kind: Theorem
order: 38
owner: sequences/fibonacci
related: []
reference:
  label: NIST DLMF §26.11, equation 7
  url: https://dlmf.nist.gov/26.11.E7
historyReference:
  label: "MacTutor: Jacques Philippe Marie Binet"
  url: https://mathshistory.st-andrews.ac.uk/Biographies/Binet/
---

## Description

The Fibonacci recurrence has an exact closed form involving the golden ratio and its conjugate. Irrational powers combine to give an integer at every nonnegative index.

## Conditions

Integer n ≥ 0; φ = (1 + √5)/2 and ψ = (1 − √5)/2.

## Statement

$$
F_n = \frac{\varphi^n-\psi^n}{\sqrt{5}}.
$$

## History

Jacques Philippe Marie Binet obtained the formula in 1843. The name commemorates his work; the expression also illustrates the broader method of solving a linear recurrence using its characteristic roots.

## Worked example

For n = 3: (φ³ − ψ³)/√5 = 2 = F₃.

## Proof sketch

Both φ and ψ satisfy x² = x + 1, so their powers satisfy the Fibonacci recurrence. The displayed expression has starting values 0 and 1, hence equals Fₙ by induction. The identity is exact, but evaluating it with floating-point arithmetic can introduce rounding errors; the calculator uses integer addition.
