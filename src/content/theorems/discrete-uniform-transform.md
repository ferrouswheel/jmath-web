---
id: discrete-uniform-transform
title: Uniform integers from a uniform draw
kind: Transformation
order: 16
owner: distributions/discrete-uniform
related:
  - distributions/uniform
reference:
  url: https://www.randomservices.org/random/special/UniformDiscrete.html
  label: "Random: Discrete uniform distributions"
historyReference:
  url: https://www.randomservices.org/random/special/UniformDiscrete.html
  label: "Random: Discrete uniform distributions"
---

## Description

Dividing the unit interval into equal bins produces equally likely integers. This is the mathematical construction behind a simple fair-die sampler.

## Conditions

U ∼ U(0, 1); integer a ≤ b; M = b − a + 1. Use 0 ≤ U < 1 in code.

## Statement

$$
a+\lfloor MU\rfloor \sim \operatorname{DU}(a,b).
$$

## History

The construction joins the continuous uniform model to the classical finite model of equally likely outcomes. In numerical implementations, the half-open input interval makes the endpoint convention explicit.

## Worked example

1 + floor(6U) gives each face of a fair die with probability 1/6.

## Proof sketch

Each output integer corresponds to an interval of length 1/M in [0, 1). Those equal-length intervals have equal probability. Excluding U = 1 prevents the out-of-range value b + 1 in an implementation.
