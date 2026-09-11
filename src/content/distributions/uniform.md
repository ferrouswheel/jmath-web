---
id: uniform
name: Uniform
alias: Continuous uniform distribution
type: Continuous
color: "#38968b"
notation: U(a, b)
use: Random starting points, simulation inputs, and quantities equally likely across a known interval.
tags:
  - Bounded
  - Constant density
formula: f(x) = 1 / (b − a),  a ≤ x ≤ b;  0 otherwise
params:
  - key: a
    label: Lower bound
    symbol: a
    value: 0
    min: -10
    max: 9
    step: 0.1
  - key: b
    label: Upper bound
    symbol: b
    value: 1
    min: -9
    max: 10
    step: 0.1
source: "2"
---

A constant probability density over a bounded interval. Equal-length subintervals have equal probability.
