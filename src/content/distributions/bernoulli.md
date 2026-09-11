---
id: bernoulli
name: Bernoulli
alias: Single binary trial
type: Discrete
color: "#638f78"
notation: Bern(p)
use: Model a single yes/no outcome, such as a coin flip or whether a visitor converts.
tags:
  - Binary outcome
  - Single trial
formula: P(X = x) = pˣ (1 − p)¹⁻ˣ,  x ∈ {0, 1}
params:
  - key: p
    label: Success probability
    symbol: p
    value: 0.5
    min: 0
    max: 1
    step: 0.01
    integer: false
sourceUrl: https://www.randomservices.org/random/bernoulli/Introduction.html
---

One trial, two outcomes. A success is 1 and a failure is 0.
