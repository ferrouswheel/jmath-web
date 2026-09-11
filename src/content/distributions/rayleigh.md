---
id: rayleigh
name: Rayleigh
alias: Magnitude of a Gaussian vector
type: Continuous
color: "#509aac"
notation: Rayleigh(σ)
use: Model amplitudes and radial errors when two perpendicular components have independent normal noise.
tags:
  - Magnitudes
  - Positive
formula: f(x) = (x/σ²) exp(−x²/(2σ²)),  x ≥ 0
params:
  - key: sigma
    label: Scale
    symbol: σ
    value: 1
    min: 0.1
    max: 5
    step: 0.1
    integer: false
sourceUrl: https://www.randomservices.org/random/special/Rayleigh.html
---

The magnitude of two independent, zero-mean normal components with the same standard deviation.
