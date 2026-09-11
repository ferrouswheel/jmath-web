---
id: cauchy
name: Cauchy
alias: Heavy-tailed location-scale distribution
type: Continuous
color: "#ad796e"
notation: Cauchy(x₀, s)
use: Ratios of independent standard normal variables and resonance profiles. Sample averages need not settle toward a population mean.
tags:
  - Heavy tails
  - Undefined mean
formula: f(x) = 1 / (πs(1 + ((x − x₀)/s)²))
params:
  - key: center
    label: Location
    symbol: x₀
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
sourceUrl: https://www.randomservices.org/random/special/Cauchy.html
---

A symmetric distribution with very heavy tails. Its mean and variance do not exist.
