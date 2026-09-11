---
id: normal
name: Normal
alias: Gaussian distribution
type: Continuous
color: "#6960d7"
notation: N(μ, σ²)
use: Measurement errors, test scores, and the combined effect of many small, independent influences.
tags:
  - Symmetric
  - Bell-shaped
formula: f(x) = exp(−(x − μ)² / (2σ²)) / (σ√(2π))
params:
  - key: mu
    label: Mean
    symbol: μ
    value: 0
    min: -10
    max: 10
    step: 0.1
  - key: sigma
    label: Standard deviation
    symbol: σ
    value: 1
    min: 0.1
    max: 5
    step: 0.1
source: "1"
---

A continuous, symmetric distribution parameterized by its mean and standard deviation.
