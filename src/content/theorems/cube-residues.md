---
id: cube-residues
title: Cubes modulo 9
kind: Congruence
order: 37
owner: sequences/cubes
related: []
reference:
  label: "OEIS A000578: formulas and references"
  url: https://oeis.org/A000578
historyReference:
  label: "OEIS A000578: formulas and references"
  url: https://oeis.org/A000578
---

## Description

An integer cube can leave only three possible remainders modulo nine. This gives a quick way to reject some numbers as cubes, though passing the test is not enough.

## Conditions

Any integer m. Congruence modulo 9 means the difference is divisible by 9.

## Statement

$$
m^3 \equiv 0,\;1,\;\text{or }-1 \pmod{9}.
$$

## History

The result belongs to congruence arithmetic, where a finite set of remainders stands in for infinitely many integers. It illustrates how residue restrictions help study equations involving powers.

## Worked example

8³ = 512 = 9 × 57 − 1, so 8³ ≡ −1 (mod 9).

## Proof sketch

Write m as 3k, 3k + 1, or 3k − 1. Their cubes are respectively congruent to 0, 1, and −1 modulo 9. This is a necessary test for a cube, not a sufficient one: 10 ≡ 1 modulo 9 but is not a cube.
