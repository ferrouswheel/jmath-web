import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  curves,
  polynomial,
  bezier,
  initialCurveState,
  curveSearch,
  curveFromSearch,
  curveSlope,
  curveNote,
} from '../src/curves.ts';
import { curveSnippet } from '../src/curve-snippets.ts';
import { curveGraph } from '../src/curve-visuals.ts';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-8, `${a} != ${b}`);

test('polynomials evaluate values, derivatives and degenerate degrees', () => {
  assert.deepEqual(polynomial([2, -3], 4), { value: 5, derivative: 2 });
  assert.deepEqual(polynomial([2, -3, 1], 4), { value: 21, derivative: 13 });
  assert.deepEqual(polynomial([2, -3, 1, -4], 2), { value: 2, derivative: 13 });
  assert.deepEqual(polynomial([0, 0, 0, 2], -5), { value: 2, derivative: 0 });
  assert.throws(() => polynomial([], 1), RangeError);
  assert.throws(() => polynomial([NaN], 1), RangeError);
});

test('Bezier agrees with Bernstein form and finite-difference derivatives', () => {
  for (const points of [
    [
      [0, 0],
      [2, 4],
      [4, -1],
    ],
    [
      [-4, -2],
      [-2, 4],
      [2, 4],
      [4, -2],
    ],
  ]) {
    const original = structuredClone(points);
    assert.deepEqual(bezier(points, 0).point, points[0]);
    assert.deepEqual(bezier(points, 1).point, points.at(-1));
    for (const t of [0.1, 0.35, 0.5, 0.9]) {
      const n = points.length - 1;
      const choose = n === 2 ? [1, 2, 1] : [1, 3, 3, 1];
      const result = bezier(points, t);
      for (let axis = 0; axis < 2; axis++) {
        near(
          result.point[axis],
          points.reduce(
            (sum, p, i) =>
              sum + choose[i] * (1 - t) ** (n - i) * t ** i * p[axis],
            0,
          ),
        );
        near(
          result.derivative[axis],
          (bezier(points, t + 1e-6).point[axis] -
            bezier(points, t - 1e-6).point[axis]) /
            2e-6,
        );
        assert.ok(
          result.point[axis] >= Math.min(...points.map((p) => p[axis])) &&
            result.point[axis] <= Math.max(...points.map((p) => p[axis])),
        );
      }
    }
    assert.deepEqual(points, original);
  }
  assert.equal(curveSlope([0, 2]), 'Vertical');
  assert.equal(curveSlope([0, 0]), 'Undefined (zero derivative)');
  assert.throws(
    () =>
      bezier(
        [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
        2,
      ),
    RangeError,
  );
});

test('curve links round-trip, reject invalid values and produce finite plots', () => {
  for (const curve of curves) {
    const state = initialCurveState(curve);
    assert.deepEqual(curveFromSearch(curve, curveSearch(curve, state)), {
      state,
      error: '',
    });
    assert.doesNotMatch(curveGraph(curve, state), /NaN|Infinity/);
    const invalid = curveFromSearch(
      curve,
      curve.id === 'bezier' ? '?degree=9' : '?a=Infinity',
    );
    assert.ok(invalid.error);
    assert.deepEqual(invalid.state, state);
    if (curve.id !== 'bezier') {
      state.coefficients.fill(0);
      assert.match(curveNote(curve, state), /constant/);
      assert.doesNotMatch(curveGraph(curve, state), /NaN|Infinity/);
    } else {
      const quadratic = initialCurveState(curve, 2);
      assert.deepEqual(
        curveFromSearch(curve, curveSearch(curve, quadratic)).state,
        quadratic,
      );
    }
  }
});

test('all curve examples execute consistently in JavaScript, Python and C', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jmath-curves-'));
  try {
    for (const curve of curves)
      for (const degree of curve.id === 'bezier' ? [2, 3] : [3]) {
        const state = initialCurveState(curve, degree);
        state.input = curve.id === 'bezier' ? 0.37 : -1.25;
        const expected =
          curve.id === 'bezier'
            ? bezier(state.points, state.input)
            : polynomial(state.coefficients, state.input);
        for (const language of ['js', 'python', 'c']) {
          const path = join(
            dir,
            `example.${language === 'python' ? 'py' : language}`,
          );
          writeFileSync(path, curveSnippet(curve, language, state));
          let output;
          if (language === 'c') {
            execFileSync('cc', [
              '-std=c99',
              '-Wall',
              '-Wextra',
              '-Werror',
              path,
              '-lm',
              '-o',
              join(dir, 'example'),
            ]);
            output = execFileSync(join(dir, 'example'), { encoding: 'utf8' });
          } else
            output = execFileSync(
              language === 'js' ? process.execPath : 'python3',
              [path],
              { encoding: 'utf8' },
            );
          const actual = JSON.parse(output);
          if (curve.id === 'bezier')
            for (let i = 0; i < 2; i++) {
              near(actual.point[i], expected.point[i]);
              near(actual.derivative[i], expected.derivative[i]);
            }
          else {
            near(actual.value, expected.value);
            near(actual.derivative, expected.derivative);
          }
        }
      }
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
