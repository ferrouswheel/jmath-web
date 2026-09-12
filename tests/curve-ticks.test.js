import test from 'node:test';
import assert from 'node:assert/strict';
import { curveTicks, curveGraph } from '../src/curve-visuals.ts';
import { curves, initialCurveState } from '../src/curves.ts';

test('curve axes use round, evenly spaced values inside the plot bounds', () => {
  assert.deepEqual(
    curveTicks(-5, 5).map((t) => t.value),
    [-4, -2, 0, 2, 4],
  );
  assert.deepEqual(
    curveTicks(-6, 6).map((t) => t.value),
    [-6, -4, -2, 0, 2, 4, 6],
  );
  for (const [min, max] of [
    [-12.345, 81.36472],
    [-813.6472, 97.831],
    [-1, 1.003],
    [-0.013, 0.018],
  ]) {
    const ticks = curveTicks(min, max),
      step = ticks[1].value - ticks[0].value;
    assert.ok(ticks.length >= 3 && ticks.length <= 8);
    assert.ok(ticks.some((t) => t.label === '0'));
    ticks.forEach((tick, i) => {
      assert.ok(tick.value >= min && tick.value <= max);
      assert.equal(Number(tick.label.replace('−', '-')), tick.value);
      if (i)
        assert.ok(Math.abs(tick.value - ticks[i - 1].value - step) < 1e-10);
    });
    assert.ok(ticks.every((t) => t.label.length < 8));
  }
});
test('all curve tick labels remain compact with fractional coefficients', () => {
  for (const curve of curves) {
    const state = initialCurveState(curve);
    if (curve.id !== 'bezier')
      state.coefficients = state.coefficients.map(
        (_, i) => (i % 2 ? -1 : 1) * 1.234567,
      );
    const graph = curveGraph(curve, state);
    const labels = [
      ...graph.matchAll(/class="curve-tick[^>]+>([^<]+)<\/text>/g),
    ].map((m) => m[1]);
    assert.ok(labels.length > 0);
    assert.ok(
      labels.every((label) => /^−?\d+(?:\.\d)?$/.test(label)),
      labels.join(', '),
    );
  }
});
