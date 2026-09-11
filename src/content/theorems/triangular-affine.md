---
id: triangular-affine
title: Affine transformations preserve triangular shape
kind: Closure theorem
order: 33
owner: distributions/triangular
related: []
reference:
  url: https://www.randomservices.org/random/special/Triangle.html
  label: "Random: Triangle distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Triangle.html
  label: "Random: Triangle distribution"
---

## Description

Changing units and shifting the origin preserves a triangular distribution. For a positive scale factor, the endpoints and mode transform in the same order.

## Conditions

X ∼ Tri(a, c, b), a < b, a ≤ c ≤ b. Real d and multiplier h > 0.

## Statement

$$
d+hX \sim \operatorname{Tri}(d+ha,\;d+hc,\;d+hb).
$$

## History

This is the location-and-scale principle applied to a piecewise-linear density. It lets one triangular model represent the same uncertainty in different units.

## Worked example

If X ∼ Tri(0, 1, 2), then 2 + 3X ∼ Tri(2, 5, 8).

## Proof sketch

An increasing affine map sends the support endpoints and mode to the stated values. The transformed density is f((y − d)/h)/h, so its two linear pieces remain triangular, including an endpoint mode.
