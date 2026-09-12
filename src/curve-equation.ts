import katex from 'katex';
import type { Curve, CurveState, Point } from './curves.ts';

// Descending powers, so the same coefficients work with Horner evaluation.
export function bezierCoefficients(points: Point[], axis: 0 | 1) {
  const [a, b, c, d] = points.map((p) => p[axis]);
  if (points.length === 3) return [a - 2 * b + c, 2 * (b - a), a];
  return [-a + 3 * b - 3 * c + d, 3 * a - 6 * b + 3 * c, 3 * (b - a), a];
}

function numberTex(value: number) {
  const [mantissa, exponent] = String(value).split('e');
  return exponent ? `${mantissa}\\times 10^{${Number(exponent)}}` : mantissa;
}
export function polynomialTex(coefficients: number[], variable = 'x') {
  let expression = '';
  coefficients.forEach((coefficient, i) => {
    if (coefficient === 0) return;
    const power = coefficients.length - i - 1;
    const magnitude = Math.abs(coefficient);
    const factor = power === 0 || magnitude !== 1 ? numberTex(magnitude) : '';
    const term =
      factor +
      (power === 0 ? '' : power === 1 ? variable : `${variable}^{${power}}`);
    expression +=
      (coefficient < 0 ? (expression ? ' - ' : '-') : expression ? ' + ' : '') +
      term;
  });
  return expression || '0';
}
export function curveEquation(curve: Curve, state: CurveState) {
  if (curve.id !== 'bezier') return `y = ${polynomialTex(state.coefficients)}`;
  // Suppress cancellation noise from expanding decimal control coordinates.
  // Display twelve significant digits, matching the note next to the equation.
  const size = Math.max(...state.points.flat().map(Math.abs));
  const component = (axis: 0 | 1) =>
    polynomialTex(
      bezierCoefficients(state.points, axis).map((value) =>
        Math.abs(value) <= Number.EPSILON * 16 * size
          ? 0
          : Number(value.toPrecision(12)),
      ),
      't',
    );
  return String.raw`\begin{aligned}x(t)&=${component(0)}\\y(t)&=${component(1)}\end{aligned}\qquad 0\le t\le1`;
}
export function renderCurveEquation(curve: Curve, state: CurveState) {
  return katex.renderToString(curveEquation(curve, state), {
    displayMode: true,
    throwOnError: true,
    trust: false,
  });
}
