---
id: lognormal
name: Lognormal
alias: Exponentiated normal distribution
type: Continuous
color: "#b78352"
notation: LN(μ, σ²)
use: Multiplicative growth and positive quantities that span orders of magnitude. μ and σ describe log(X).
tags:
  - Positive
  - Multiplicative
formula: f(x) = exp(−(ln x − μ)² / (2σ²)) / (xσ√(2π)),  x > 0
params:
  - key: mu
    label: Mean of log(X)
    symbol: μ
    value: 0
    min: -2
    max: 2
    step: 0.1
    integer: false
  - key: sigma
    label: Std. dev. of log(X)
    symbol: σ
    value: 0.5
    min: 0.1
    max: 2
    step: 0.1
    integer: false
sourceUrl: https://www.randomservices.org/random/special/LogNormal.html
---

A positive, right-skewed variable whose logarithm follows a normal distribution.
