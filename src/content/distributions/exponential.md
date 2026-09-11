---
id: exponential
name: Exponential
alias: Waiting-time distribution
type: Continuous
color: "#ca9250"
notation: Exp(λ)
use: Time between independent arrivals at a constant average rate. Its memoryless property means elapsed time does not change the remaining waiting-time distribution.
tags:
  - Memoryless
  - Right-skewed
formula: f(x) = λ exp(−λx),  x ≥ 0;  0 otherwise
params:
  - key: rate
    label: Rate (not scale)
    symbol: λ
    value: 1
    min: 0.1
    max: 10
    step: 0.1
source: "7"
---

Waiting times between independent events occurring at a constant rate.
