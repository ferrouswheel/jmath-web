---
id: hexagonal-triangular
title: Every hexagonal number is triangular
kind: Identity
order: 44
owner: sequences/hexagonal
related:
  - sequences/triangular
reference:
  label: "OEIS A000384: formulas and references"
  url: https://oeis.org/A000384
historyReference:
  label: "OEIS A000384: formulas and references"
  url: https://oeis.org/A000384
---

## Description

Every positive hexagonal number occurs among the triangular numbers at an odd index. This embeds one polygonal sequence inside another.

## Conditions

Integer n ≥ 1; H₀ = T₀ = 0 separately.

## Statement

$$
H_n = T_{2n-1}.
$$

## History

Relations between polygonal sequences express how different geometric counting rules overlap. Substituting an odd triangular index gives the hexagonal formula directly.

## Worked example

For n = 4: H₄ = 28 = T₇.

## Proof sketch

T₂ₙ₋₁ = (2n − 1)(2n)/2 = n(2n − 1) = Hₙ. Thus the positive hexagonal numbers are precisely the triangular numbers at odd indices. Not every triangular number is hexagonal; T₂ = 3 is an example.
