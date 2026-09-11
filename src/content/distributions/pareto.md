---
id: pareto
name: Pareto
alias: Type I power-law distribution
type: Continuous
color: "#bc8666"
notation: Pareto(xₘ, α)
use: Explore heavy-tailed sizes and wealth models. The mean is infinite for α ≤ 1, and variance is not finite for α ≤ 2.
tags:
  - Power law
  - Heavy tails
formula: f(x) = (α/xₘ)(xₘ/x)ᵅ⁺¹,  x ≥ xₘ
params:
  - key: minimum
    label: Minimum
    symbol: xₘ
    value: 1
    min: 0.1
    max: 5
    step: 0.1
    integer: false
  - key: alpha
    label: Shape
    symbol: α
    value: 5
    min: 0.5
    max: 10
    step: 0.1
    integer: false
sourceUrl: https://www.randomservices.org/random/special/Pareto.html
---

A power-law tail above a positive minimum. Smaller shape values make extreme outcomes more likely.
