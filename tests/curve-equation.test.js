import test from 'node:test';
import assert from 'node:assert/strict';
import {
  curves,
  initialCurveState,
  polynomial,
  bezier,
} from '../src/curves.ts';
import {
  bezierCoefficients,
  polynomialTex,
  curveEquation,
  renderCurveEquation,
} from '../src/curve-equation.ts';

test('equations simplify signs, zero terms, unit coefficients and constants', () => {
  assert.equal(polynomialTex([2, -3, 1]), '2x^{2} - 3x + 1');
  assert.equal(polynomialTex([0, -1, 0, -2]), '-x^{2} - 2');
  assert.equal(polynomialTex([0, 0, 0]), '0');
  assert.equal(polynomialTex([0, 0, 4]), '4');
  assert.equal(polynomialTex([1, 0]), 'x');
  assert.equal(polynomialTex([1e-8, 0]), '1\\times 10^{-8}x');
});
test('expanded Bezier equations match the plotted curve across degrees and points', () => {
  for (const points of [
    [
      [-4, -2],
      [0, 4],
      [4, -2],
    ],
    [
      [-4, -2],
      [-2, 4],
      [2, 4],
      [4, -2],
    ],
    [
      [0.1, 0.2],
      [0.3, -0.4],
      [1.2, 0.7],
    ],
    [
      [1, 2],
      [1, 2],
      [1, 2],
      [1, 2],
    ],
  ])
    for (const t of [0, 0.1, 0.5, 0.9, 1]) {
      const actual = bezier(points, t).point;
      for (const axis of [0, 1])
        assert.ok(
          Math.abs(
            polynomial(bezierCoefficients(points, axis), t).value -
              actual[axis],
          ) < 1e-12,
        );
    }
});
test('equations render for every curve and depend on shape rather than evaluation position', () => {
  for (const curve of curves) {
    const state = initialCurveState(curve);
    const equation = curveEquation(curve, state);
    assert.equal(curveEquation(curve, { ...state, input: 0.3 }), equation);
    assert.match(renderCurveEquation(curve, state), /katex/);
    if (curve.id === 'bezier') state.points[1][0] += 0.5;
    else state.coefficients[0] += 0.5;
    assert.notEqual(curveEquation(curve, state), equation);
  }
});
