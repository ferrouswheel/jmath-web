---
id: poisson
name: Poisson
alias: Event-count distribution
type: Discrete
color: "#b578a3"
notation: Pois(λ)
use: Calls arriving per minute, defects per metre, or events observed in a fixed period under a constant-rate model.
tags:
  - Event counts
  - Mean = variance
formula: P(X = k) = exp(−λ) λᵏ / k!,  k = 0, 1, 2, …
params:
  - key: rate
    label: Expected event count
    symbol: λ
    value: 5
    min: 0.1
    max: 50
    step: 0.1
source: j
---

Count independent events in a fixed interval when they happen at a constant average rate.
