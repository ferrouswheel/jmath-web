---
id: triangular
name: Triangular
alias: Minimum, mode, and maximum model
type: Continuous
color: "#7f94b0"
notation: Tri(a, c, b)
use: Simple estimates when only lower, upper, and most likely values are known. The explorer uses an interior mode (a < c < b).
tags:
  - Bounded
  - Three-point estimate
formula: f(x) = 2(x−a)/((b−a)(c−a)) for a ≤ x ≤ c; 2(b−x)/((b−a)(b−c)) for c < x ≤ b
params:
  - key: a
    label: Lower bound
    symbol: a
    value: 0
    min: -10
    max: 9
    step: 0.1
    integer: false
  - key: c
    label: Mode
    symbol: c
    value: 0.5
    min: -9.9
    max: 9.9
    step: 0.1
    integer: false
  - key: b
    label: Upper bound
    symbol: b
    value: 1
    min: -9
    max: 10
    step: 0.1
    integer: false
constraints:
  - left: a
    op: <
    right: c
    message: Mode must exceed the lower bound.
  - left: c
    op: <
    right: b
    message: Mode must be below the upper bound.
sourceUrl: https://www.randomservices.org/random/special/Triangle.html
---

A bounded distribution built from a minimum, a most likely value, and a maximum.
