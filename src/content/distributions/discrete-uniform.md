---
id: discrete_uniform
name: Discrete Uniform
alias: Equally likely integers
type: Discrete
color: "#498e96"
notation: DU(a, b)
use: Fair dice, random integer choices, and equally likely outcomes on a finite set.
tags:
  - Bounded
  - Equal mass
formula: P(X = k) = 1 / (b − a + 1),  k = a, …, b
params:
  - key: a
    label: Lower integer
    symbol: a
    value: 1
    min: -20
    max: 19
    step: 1
    integer: true
  - key: b
    label: Upper integer
    symbol: b
    value: 6
    min: -19
    max: 20
    step: 1
    integer: true
constraints:
  - left: a
    op: <=
    right: b
    message: Lower bound must not exceed upper bound.
sourceUrl: https://www.randomservices.org/random/special/UniformDiscrete.html
---

Every integer between the two inclusive bounds has the same probability.
