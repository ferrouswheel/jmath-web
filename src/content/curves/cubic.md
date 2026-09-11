---
id: cubic
name: Cubic
description: A third-degree polynomial with room for bends and turning points. Explore its value, tangent, and inflection point.
order: 2
color: '#b66d47'
input: 1
coefficients: [0.25, 0, -1, 0]
related: [linear, quadratic, bezier]
reference:
  label: 'NIST DLMF: cubic equations'
  url: https://dlmf.nist.gov/1.11#iii
---

## Formula

$$
f(x)=ax^3+bx^2+cx+d.
$$

Its first and second derivatives are

$$
f'(x)=3ax^2+2bx+c, \qquad f''(x)=6ax+2b.
$$

## Bends and turning points

When $a\ne0$, the inflection point is at $x=-b/(3a)$, where the concavity changes. A stationary point satisfies $f'(x)=0$. There can be two distinct stationary points, one repeated stationary point, or none. A stationary point need not be a local maximum or minimum: $f(x)=x^3$ has a horizontal tangent at its inflection point.

Setting $a=0$ reduces the degree to at most two. Every genuine real cubic has at least one real root, although a finite graph window may not show it.

## Evaluation

Horner’s form $f(x)=((ax+b)x+c)x+d$ evaluates the value without computing powers separately. Cubic polynomials also appear as coordinate functions in cubic Bézier curves.
