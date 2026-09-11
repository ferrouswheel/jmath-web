---
id: negative_binomial
name: Negative Binomial
alias: Failures before r successes
type: Discrete
color: "#9172ac"
notation: NB(r, p)
use: Model overdispersed counts or retries before r successes. Here r is an integer and X counts failures, starting at zero.
tags:
  - Overdispersion
  - Failure counts
formula: P(X = k) = C(k + r − 1, k) pʳ (1 − p)ᵏ
params:
  - key: r
    label: Target successes
    symbol: r
    value: 5
    min: 1
    max: 30
    step: 1
    integer: true
  - key: p
    label: Success probability
    symbol: p
    value: 0.5
    min: 0.1
    max: 1
    step: 0.01
    integer: false
sourceUrl: https://www.randomservices.org/random/bernoulli/NegativeBinomial.html
---

Count failures before a fixed number of successes, with the same success probability on each trial.
