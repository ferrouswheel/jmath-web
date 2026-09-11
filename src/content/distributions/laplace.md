---
id: laplace
name: Laplace
alias: Double exponential distribution
type: Continuous
color: "#9b6f9c"
notation: Laplace(μ, s)
use: Model errors with occasional large deviations and study absolute-error loss.
tags:
  - Symmetric
  - Sharp peak
formula: f(x) = exp(−|x − μ| / s) / (2s)
params:
  - key: mu
    label: Location
    symbol: μ
    value: 0
    min: -10
    max: 10
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
sourceUrl: https://www.randomservices.org/random/special/Laplace.html
---

A sharp central peak with symmetric exponential tails, heavier than those of a normal distribution.
