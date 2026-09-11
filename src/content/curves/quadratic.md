---
id: quadratic
name: Quadratic
description: A parabola controlled by three coefficients. Move its vertex, change its opening, and explore its changing slope.
order: 1
color: '#8062bd'
input: 1
coefficients: [1, 0, -1]
related: [linear, cubic, bezier]
reference:
  label: 'NIST DLMF: quadratic equations'
  url: https://dlmf.nist.gov/1.11#ii
---

## Formula

$$
f(x)=ax^2+bx+c, \qquad f'(x)=2ax+b.
$$

For $a>0$ the parabola opens upward; for $a<0$ it opens downward. Increasing $|a|$ makes it narrower in the same coordinate system. Setting $a=0$ reduces the function to a line or constant.

## Vertex and roots

If $a\ne0$, the vertex occurs at

$$
x_v=-\frac{b}{2a}, \qquad y_v=f(x_v).
$$

The discriminant $\Delta=b^2-4ac$ determines the real roots: two when $\Delta>0$, one repeated root when $\Delta=0$, and none when $\Delta<0$.

$$
x=\frac{-b\pm\sqrt{\Delta}}{2a}.
$$

## Evaluation

Horner’s form $f(x)=(ax+b)x+c$ evaluates the polynomial using two multiplications. A quadratic polynomial describes $y$ as a function of $x$; a quadratic Bézier curve instead describes both coordinates using a parameter $t$.
