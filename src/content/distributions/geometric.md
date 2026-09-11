---
id: geometric
name: Geometric
alias: Failures before the first success
type: Discrete
color: "#aa9158"
notation: Geom(p)
use: Model retries before a successful request. This convention counts failures, not the total number of trials.
tags:
  - Memoryless
  - Failure counts
formula: P(X = k) = p(1 − p)ᵏ,  k = 0, 1, …
params:
  - key: p
    label: Success probability
    symbol: p
    value: 0.3
    min: 0.05
    max: 1
    step: 0.01
    integer: false
sourceUrl: https://www.randomservices.org/random/bernoulli/Geometric.html
---

Count failures before the first success in independent trials. The count starts at zero.
