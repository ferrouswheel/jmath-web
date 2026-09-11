---
id: logistic
name: Logistic
alias: Logistic location-scale distribution
type: Continuous
color: "#7487b8"
notation: Logistic(μ, s)
use: Latent error models and growth thresholds; its heavier tails allow more extreme values than a normal distribution.
tags:
  - Symmetric
  - Sigmoid CDF
formula: f(x) = exp(−z) / (s(1 + exp(−z))²),  z = (x − μ)/s
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
sourceUrl: https://www.randomservices.org/random/special/Logistic.html
---

A symmetric bell-shaped density whose cumulative probability follows a sigmoid curve.
