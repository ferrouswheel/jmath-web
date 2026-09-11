---
id: linear
name: Linear
description: A straight line with a constant slope. Explore how its rate of change and vertical intercept shape the graph.
order: 0
color: '#458c82'
input: 1
coefficients: [1, 0]
related: [quadratic, cubic]
reference:
  label: 'NIST DLMF: polynomials'
  url: https://dlmf.nist.gov/1.11
---

## Formula

$$
f(x)=ax+b, \qquad f'(x)=a.
$$

The coefficient $a$ is the slope: increasing $x$ by one changes $y$ by $a$. The intercept $b$ is the value at $x=0$. A negative slope falls from left to right; a zero slope gives the constant function $f(x)=b$.

## Reading the curve

The highlighted point is $(x,f(x))$. Its tangent has the same slope as the entire line. When $a\ne0$, the line crosses the horizontal axis at $x=-b/a$.

The explorer uses “linear” in the common straight-line sense; in linear algebra, a linear map must also have $b=0$.

## Evaluation

Multiply $x$ by $a$, then add $b$. The implementation returns both the value and its derivative, so the graph and tangent use the same parameters.
