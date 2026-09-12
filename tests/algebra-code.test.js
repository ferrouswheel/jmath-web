import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  operationPages,
  operationState,
  operationPresets,
} from '../src/algebra-operations.ts';
import { algebraCode } from '../src/algebra-code.ts';
import { renderAlgebra } from '../src/linear-algebra-view.ts';
import {
  add,
  scale,
  dot,
  norm,
  projection,
  angle,
  det,
  matrixAdd,
  matrixScale,
  multiply,
  transpose,
  inverse,
  apply,
  rank,
  trace,
  hadamard,
  jacobian,
} from '../src/linear-algebra.ts';
const nested = (a) => [a.slice(0, 2), a.slice(2)];
function expected(page, s) {
  const { u, v, a, b, k } = s;
  if (page.engine === 'vectors')
    return {
      add: () => add(u, v),
      subtract: () => add(u, scale(-1, v)),
      scale: () => scale(k, u),
      dot: () => dot(u, v),
      project: () => projection(u, v),
      magnitude: () => norm(u),
      normalize: () => (norm(u) ? scale(1 / norm(u), u) : null),
      angle: () => angle(u, v),
      area: () => det([u[0], v[0], u[1], v[1]]),
    }[page.operation]();
  return {
    add: () => nested(matrixAdd(a, b)),
    subtract: () => nested(matrixAdd(a, matrixScale(-1, b))),
    scale: () => nested(matrixScale(k, a)),
    multiply: () => nested(multiply(a, b)),
    transpose: () => nested(transpose(a)),
    inverse: () => (inverse(a) ? nested(inverse(a)) : null),
    transform: () => apply(a, v),
    rank: () => rank(a),
    trace: () => trace(a),
    determinants: () => det(a),
    hadamard: () => nested(hadamard(a, b)),
    jacobians: () => nested(jacobian(s.map, u)),
  }[page.operation]?.();
}
const cases = operationPages.flatMap((page) =>
  [
    operationState(page),
    ...operationPresets(page).map((p) => ({
      ...operationState(page),
      ...p.state,
    })),
  ].map((state) => ({ page, state })),
);
function compare(actual, want) {
  if (Array.isArray(want)) {
    assert.equal(actual.length, want.length);
    want.forEach((x, i) => compare(actual[i], x));
  } else assert.ok(Math.abs(actual - want) < 1e-8, `${actual} != ${want}`);
}
test('every dedicated operation and preset renders and keeps its operation fixed', () => {
  for (const { page, state } of cases) {
    assert.equal(page.operation, state.operation);
    const output = renderAlgebra(page.engine, state);
    assert.match(output.visual, /data-handle=/, page.path);
    assert.doesNotMatch(
      output.results + output.visual,
      /NaN|Infinity|katex-error/,
    );
  }
});
test('standalone JavaScript examples agree with the calculators', () => {
  for (const { page, state } of cases) {
    const source = algebraCode(page, state, 'js');
    const want = expected(page, state);
    const execute = () =>
      vm.runInNewContext(source + '\nJSON.stringify(result);', {
        console: { log() {} },
      });
    if (want === null) {
      assert.throws(execute);
      continue;
    }
    const output = JSON.parse(execute());
    if (page.engine === 'eigenvalues') {
      output
        .filter((e) => e.vector)
        .forEach((e) =>
          compare(apply(state.a, e.vector), scale(e.value, e.vector)),
        );
    } else compare(output, want);
  }
});
const hasNumpy =
  spawnSync('python3', ['-c', 'import numpy'], { encoding: 'utf8' }).status ===
  0;
test(
  'Python/NumPy examples agree with the calculators',
  { skip: hasNumpy ? false : 'Python with NumPy is unavailable' },
  () => {
    const sources = cases.map(({ page, state }) =>
      algebraCode(page, state, 'python'),
    );
    const runner = `import json, sys, io, contextlib, numpy as np\nresults=[]\nfor source in json.load(sys.stdin):\n    scope={}\n    try:\n        with contextlib.redirect_stdout(io.StringIO()):\n            exec(source, scope)\n        value=scope['result']\n        results.append({'value': np.asarray(value).real.tolist()})\n    except ValueError as e:\n        results.append({'error': str(e)})\nprint(json.dumps(results))`;
    const output = JSON.parse(
      execFileSync('python3', ['-c', runner], {
        input: JSON.stringify(sources),
        encoding: 'utf8',
      }),
    );
    cases.forEach(({ page, state }, i) => {
      const want = expected(page, state);
      if (want === null) {
        assert.ok(output[i].error);
        return;
      }
      assert.ok(!output[i].error, `${page.path}: ${output[i].error}`);
      // Eigen snippets check the eigenvector residual themselves (including complex pairs).
      if (page.engine !== 'eigenvalues') compare(output[i].value, want);
    });
  },
);
test('zero-vector guardrails are present in both languages', () => {
  for (const op of ['projection', 'normalization', 'angle']) {
    const page = operationPages.find((p) => p.path === `/vectors/${op}`),
      state = { ...operationState(page), u: [0, 0], v: [0, 0] };
    assert.throws(() =>
      vm.runInNewContext(algebraCode(page, state, 'js'), {
        console: { log() {} },
      }),
    );
    assert.match(algebraCode(page, state, 'python'), /raise ValueError/);
  }
});
