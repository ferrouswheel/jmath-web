---
id: bezier
name: Bézier
description: Shape a smooth path with control points. Trace quadratic and cubic curves and see how interpolation constructs each point.
order: 3
color: '#477cb3'
input: 0.5
points: [[-4, -2], [-2, 4], [2, 4], [4, -2]]
quadraticPoints: [[-4, -2], [0, 4], [4, -2]]
related: [linear, quadratic, cubic]
reference:
  label: 'Pomax: A Primer on Bézier Curves'
  url: https://pomax.github.io/bezierinfo/
---

## Quadratic and cubic forms

A quadratic Bézier curve has three control points:

$$
B(t)=(1-t)^2P_0+2(1-t)tP_1+t^2P_2.
$$

A cubic Bézier curve has four:

$$
B(t)=(1-t)^3P_0+3(1-t)^2tP_1+3(1-t)t^2P_2+t^3P_3.
$$

Here $0\le t\le1$ and each $P_i$ is a two-dimensional point. The curve begins at $P_0$ and ends at the last point. Interior control points influence the shape but generally do not lie on the curve. The curve remains inside the control points’ convex hull.

## Construction and tangent

De Casteljau’s algorithm repeatedly interpolates between neighbouring points until one point remains. The lighter construction lines show these intermediate levels for the selected $t$.

For degree $n$, the derivative is another Bézier curve with control points $n(P_{i+1}-P_i)$. In particular,

$$
B'(0)=n(P_1-P_0), \qquad B'(1)=n(P_n-P_{n-1}).
$$

The tangent slope is $B'_y(t)/B'_x(t)$ when the horizontal derivative is nonzero. If the derivative vector is zero, it does not specify a tangent direction. Equal steps in $t$ do not generally travel equal distances along the curve.

## History and uses

Pierre Bézier and Paul de Casteljau developed closely related curve techniques in automotive design. Today these control-point curves are used in vector graphics, font outlines, and motion paths. Unlike a polynomial graph $y=f(x)$, a parametric Bézier path can double back horizontally.
