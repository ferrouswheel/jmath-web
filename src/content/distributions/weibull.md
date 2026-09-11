---
id: weibull
name: Weibull
alias: Shape-and-scale lifetime distribution
type: Continuous
color: "#8c9660"
notation: Weibull(k, s)
use: Reliability and time-to-failure models. Shape below 1 gives decreasing hazard, shape 1 constant hazard, and shape above 1 increasing hazard.
tags:
  - Lifetimes
  - Flexible shape
formula: f(x) = (k/s)(x/s)ᵏ⁻¹ exp(−(x/s)ᵏ),  x ≥ 0
params:
  - key: shape
    label: Shape
    symbol: k
    value: 2
    min: 0.5
    max: 5
    step: 0.1
    integer: false
  - key: scale
    label: Scale
    symbol: s
    value: 1
    min: 0.1
    max: 5
    step: 0.1
    integer: false
sourceUrl: https://www.randomservices.org/random/special/Weibull.html
---

A flexible lifetime model with a shape parameter that changes how failure risk evolves.
