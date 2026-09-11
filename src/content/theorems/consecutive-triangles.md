---
id: consecutive-triangles
title: Two triangular numbers form a square
kind: Identity
order: 41
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

Two consecutive triangular arrangements fit together to form a square. Their shared diagonal explains why one triangle has one extra row.

## Conditions

Integer n ≥ 1.

## Statement

$$
T_n+T_{n-1} = n^2.
$$

## History

This is a figurate-number identity connecting triangular and square arrays. The dot arrangement and the polynomial formulas give two ways to express the same decomposition.

## Worked example

For n = 5: 15 + 10 = 25.

## Proof sketch

Add n(n + 1)/2 and n(n − 1)/2 to obtain n². Equivalently, divide an n × n dot square along its diagonal: one part has rows 1 through n, and the other has rows 1 through n − 1.
