---
id: rayleigh-radius
title: Radius of a Gaussian vector
kind: Representation theorem
order: 28
owner: distributions/rayleigh
related:
  - distributions/normal
reference:
  url: https://www.randomservices.org/random/special/Rayleigh.html
  label: "Random: Rayleigh distribution"
historyReference:
  url: https://www.randomservices.org/random/special/Rayleigh.html
  label: "Random: Rayleigh distribution"
---

## Description

Two independent centred normal coordinates produce a Rayleigh distance from the origin. The distribution describes magnitude while the Gaussian pair describes components.

## Conditions

Independent X, Y ∼ N(0, σ²), with σ > 0.

## Statement

$$
\sqrt{X^2+Y^2} \sim \operatorname{Rayleigh}(\sigma).
$$

## History

The Rayleigh law connects planar Gaussian models with radial measurements. Polar coordinates explain why a radial density includes an extra factor for the increasing circumference at larger radii.

## Worked example

Two independent standard normal components produce a Rayleigh(1) radius.

## Proof sketch

Change their joint density to polar coordinates. Integrating the angle from 0 to 2π and including the Jacobian r gives r exp(−r²/(2σ²))/σ² for r ≥ 0.
