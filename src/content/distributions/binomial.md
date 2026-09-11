---
id: binomial
name: Binomial
alias: Success-count distribution
type: Discrete
color: "#5f8bca"
notation: Bin(n, p)
use: Heads in a series of coin flips, successful conversions, or defective items in a fixed-size sample of independent items.
tags:
  - Fixed trials
  - Success counts
formula: P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ,  k = 0, …, n
params:
  - key: n
    label: Number of trials
    symbol: n
    value: 20
    min: 1
    max: 100
    step: 1
  - key: p
    label: Success probability
    symbol: p
    value: 0.5
    min: 0
    max: 1
    step: 0.01
source: i
---

Count the successes in a fixed number of independent trials, each with the same chance of success.
