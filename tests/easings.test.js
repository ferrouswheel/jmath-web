import { easeDerivatives } from '../src/easing-derivatives.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import {
  easings,
  ease,
  initialEasingState,
  easingBounds,
  easingValue,
  easingError,
  easingRates,
} from '../src/easings.ts';
import { easingCode } from '../src/easing-code.ts';
import {
  easingFormula,
  easingGraph,
  easingDerivativeOverlay,
  easingValueBounds,
  easingGraphState,
} from '../src/easing-view.ts';
const near = (a, b, tolerance = 1e-10) =>
  assert.ok(Math.abs(a - b) < tolerance, `${a} != ${b}`);
const get = (id) => easings.find((e) => e.id === id);
test('easing endpoints, reference values, symmetry, and overshoot are correct', () => {
  assert.equal(easings.length, 31);
  for (const e of easings) {
    assert.equal(ease(e, 0), 0);
    assert.equal(ease(e, 1), 1);
    const [min, max] = easingBounds(e);
    for (let i = 0; i <= 400; i++) {
      const t = i / 400,
        value = ease(e, t);
      assert.ok(Number.isFinite(value) && value >= min && value <= max, e.id);
      if (e.direction === 'in-out') near(value, 1 - ease(e, 1 - t));
    }
    assert.throws(() => ease(e, -0.1));
    assert.throws(() => ease(e, NaN));
    assert.match(easingFormula(e), /katex/);
    assert.doesNotMatch(easingGraph(e), /NaN|Infinity/);
  }
  near(ease(get('quadratic-in'), 0.5), 0.25);
  near(ease(get('quadratic-out'), 0.5), 0.75);
  near(ease(get('sine-in-out'), 0.5), 0.5);
  near(ease(get('bounce-out'), 4 / 11), 1);
  assert.ok(ease(get('back-out'), 0.7) > 1);
  assert.ok(ease(get('elastic-in'), 0.9) < 0);
  near(
    easingValue(get('linear'), { t: 0.25, start: 100, end: 0, duration: 2 }),
    75,
  );
  assert.ok(easingError({ ...initialEasingState(), duration: 0 }));
});
test('smooth easing families are monotone, and out reverses in', () => {
  for (const e of easings) {
    let last = 0;
    for (let i = 0; i <= 100; i++) {
      const t = i / 100,
        value = ease(e, t);
      if (!['back', 'elastic', 'bounce'].includes(e.family))
        assert.ok(value >= last - 1e-12);
      last = value;
      if (e.direction === 'out')
        near(value, 1 - ease(get(`${e.family}-in`), 1 - t));
    }
  }
});
test('JavaScript easing examples match plotted values including endpoints', () => {
  for (const e of easings) {
    const state = initialEasingState();
    const context = { console: { log() {} } };
    vm.createContext(context);
    vm.runInContext(easingCode(e, state, 'js'), context);
    for (const t of [0, 0.001, 0.1, 4 / 11, 0.5, 8 / 11, 0.9, 0.999, 1])
      near(vm.runInContext(`ease(${t})`, context), ease(e, t));
  }
});
test('Python easing examples match plotted values including endpoints', () => {
  const times = [0, 0.001, 0.1, 4 / 11, 0.5, 8 / 11, 0.9, 0.999, 1];
  const payload = easings.map((e) => ({
    code: easingCode(e, initialEasingState(), 'python'),
    times,
  }));
  const runner = `import json,sys,io,contextlib\nresults=[]\nfor item in json.load(sys.stdin):\n    scope={}\n    with contextlib.redirect_stdout(io.StringIO()):\n        exec(item['code'],scope)\n    results.append([scope['ease'](t) for t in item['times']])\nprint(json.dumps(results))`;
  const values = JSON.parse(
    execFileSync('python3', ['-c', runner], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
    }),
  );
  easings.forEach((e, i) =>
    times.forEach((t, j) => near(values[i][j], ease(e, t))),
  );
});

test('analytic derivatives agree with independent numerical differences across all families', () => {
  for (const e of easings) {
    for (const t of [0.071, 0.193, 0.317, 0.461, 0.583, 0.719, 0.863, 0.947]) {
      const h = 1e-5;
      const [v, a] = easeDerivatives(e.family, e.direction, t);
      near(v, (ease(e, t + h) - ease(e, t - h)) / (2 * h), 1e-5);
      near(
        a,
        (ease(e, t + h) - 2 * ease(e, t) + ease(e, t - h)) / (h * h),
        1e-4,
      );
    }
  }
});
test('derivatives handle corners, endpoint limits, duration, and reversed transitions', () => {
  const derivative = (id, t) => {
    const e = get(id);
    return easeDerivatives(e.family, e.direction, t);
  };
  assert.deepEqual(derivative('linear', 0), [1, 0]);
  assert.deepEqual(derivative('quadratic-in', 0), [0, 2]);
  assert.deepEqual(derivative('quadratic-in-out', 0.5), [2, null]);
  near(derivative('sine-in-out', 0.5)[1], 0);
  for (const direction of ['in', 'out', 'in-out']) {
    for (const b of [4 / 11, 8 / 11, 10 / 11]) {
      const times =
        direction === 'out'
          ? [b]
          : direction === 'in'
            ? [1 - b]
            : [(1 - b) / 2, (1 + b) / 2];
      for (const t of times)
        assert.deepEqual(derivative(`bounce-${direction}`, t), [null, null]);
    }
    assert.deepEqual(
      derivative(`exponential-${direction}`, direction === 'out' ? 1 : 0),
      [null, null],
    );
    assert.deepEqual(
      derivative(`elastic-${direction}`, direction === 'out' ? 1 : 0),
      [null, null],
    );
  }
  assert.deepEqual(derivative('circular-in', 1), [Infinity, Infinity]);
  assert.deepEqual(derivative('circular-out', 0), [Infinity, -Infinity]);
  assert.deepEqual(derivative('circular-in-out', 0.5), [Infinity, null]);
  const state = { t: 0.5, start: 10, end: 50, duration: 2 };
  assert.deepEqual(easingRates(get('quadratic-in'), state), [20, 20]);
  assert.deepEqual(
    easingRates(get('quadratic-in'), { ...state, duration: 4 }),
    [10, 5],
  );
  assert.deepEqual(
    easingRates(get('quadratic-in'), { ...state, start: 50, end: 10 }),
    [-20, -20],
  );
  assert.deepEqual(
    easingRates(get('circular-in'), { ...state, t: 1, start: 50 }),
    [0, 0],
  );
  assert.deepEqual(
    easingRates(get('exponential-in'), { ...state, t: 0, start: 50 }),
    [0, 0],
  );
  assert.throws(() => derivative('linear', NaN), RangeError);
  assert.throws(() => derivative('linear', 1.1), RangeError);
});
test('JavaScript and Python derivative examples match at arbitrary points and singularities', () => {
  const times = [0, 0.13, 4 / 11, 0.5, 8 / 11, 10 / 11, 0.91, 1];
  const payload = [];
  for (const e of easings) {
    for (const state of [
      { t: 0.3, start: 50, end: 10, duration: 4 },
      { t: 0.3, start: 10, end: 10, duration: 2 },
    ]) {
      const context = { console: { log() {} } };
      vm.createContext(context);
      vm.runInContext(easingCode(e, state, 'js'), context);
      const expected = times.map((t) => easingRates(e, { ...state, t }));
      times.forEach((t, i) => {
        const actual = vm.runInContext(
          `[velocityAt(${t}), accelerationAt(${t})]`,
          context,
        );
        actual.forEach((v, j) =>
          expected[i][j] === null || !Number.isFinite(expected[i][j])
            ? assert.equal(v, expected[i][j])
            : near(v, expected[i][j]),
        );
      });
      payload.push({ code: easingCode(e, state, 'python'), times, expected });
    }
  }
  const runner = `import json,sys,io,contextlib,math
results=[]
for item in json.load(sys.stdin):
    scope={}
    with contextlib.redirect_stdout(io.StringIO()):
        exec(item['code'],scope)
    def clean(v):
        return str(v) if v is not None and not math.isfinite(v) else v
    results.append([[clean(scope['velocity_at'](t)),clean(scope['acceleration_at'](t))] for t in item['times']])
print(json.dumps(results))`;
  const values = JSON.parse(
    execFileSync('python3', ['-c', runner], {
      input: JSON.stringify(payload),
      encoding: 'utf8',
    }),
  );
  payload.forEach((item, i) =>
    item.expected.forEach((rates, j) =>
      rates.forEach((rate, k) => {
        const actual = values[i][j][k];
        if (rate === null) assert.equal(actual, null);
        else if (!Number.isFinite(rate))
          assert.equal(actual, rate > 0 ? 'inf' : '-inf');
        else near(actual, rate);
      }),
    ),
  );
});
test('derivative overlays have finite paths and split at discontinuities', () => {
  for (const e of easings) {
    for (const enabled of [
      { velocity: true, acceleration: false },
      { velocity: false, acceleration: true },
      { velocity: true, acceleration: true },
    ]) {
      const svg = easingDerivativeOverlay(e, enabled);
      assert.doesNotMatch(svg, /NaN|Infinity/);
      assert.equal(
        (svg.match(/data-easing-overlay=/g) || []).length,
        Number(enabled.velocity) + Number(enabled.acceleration),
      );
    }
  }
  const bounce = easingDerivativeOverlay(get('bounce-out'), {
    velocity: true,
    acceleration: false,
  });
  assert.equal((bounce.match(/M[\d.]+,/g) || []).length, 4);
  assert.equal(
    easingDerivativeOverlay(get('linear'), {
      velocity: false,
      acceleration: false,
    }),
    '',
  );
});

test('actual graph bounds include endpoints and overshoot, while normalised mode is independent of the transition', () => {
  for (const e of easings) {
    for (const state of [
      { t: 0.35, start: 10, end: 50, duration: 4 },
      { t: 0.35, start: 50, end: -10, duration: 4 },
      { t: 0.35, start: 10, end: 10, duration: 4 },
    ]) {
      const [min, max] = easingValueBounds(e, state);
      assert.ok(min < max);
      for (let i = 0; i <= 100; i++) {
        const v = easingValue(e, { ...state, t: i / 100 });
        assert.ok(v >= min && v <= max);
      }
      const graph = easingGraph(e, state.t, false, state);
      assert.doesNotMatch(graph, /NaN|Infinity/);
      assert.match(graph, /Elapsed time · seconds/);
      for (const endpoint of [state.start, state.end])
        assert.ok(
          graph.includes(`>${String(endpoint).replace('-', '−')}</text>`),
        );
      const normalized = easingGraph(e, state.t, false, state, 'normalized');
      assert.equal(
        normalized,
        easingGraph(e, state.t, false, initialEasingState(), 'normalized'),
      );
      assert.equal(
        easingDerivativeOverlay(
          e,
          { velocity: true, acceleration: true },
          state,
          'normalized',
        ),
        easingDerivativeOverlay(
          e,
          { velocity: true, acceleration: true },
          initialEasingState(),
          'normalized',
        ),
      );
      assert.deepEqual(easingGraphState(state, 'normalized'), {
        t: state.t,
        start: 0,
        end: 1,
        duration: 1,
      });
    }
  }
});
