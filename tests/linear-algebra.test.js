import test from 'node:test';
import assert from 'node:assert/strict';
import {
  add,
  scale,
  dot,
  norm,
  det,
  apply,
  transpose,
  multiply,
  hadamard,
  inverse,
  rank,
  projection,
  angle,
  eigen,
  mapping,
  jacobian,
} from '../src/linear-algebra.ts';
import {
  algebraPages,
  initialAlgebraState,
  presets,
} from '../src/linear-algebra-content.ts';
import { renderAlgebra } from '../src/linear-algebra-view.ts';
const near = (a, b, tolerance = 1e-9) =>
  assert.ok(Math.abs(a - b) <= tolerance, `${a} != ${b}`);
const nearArray = (a, b) => a.forEach((v, i) => near(v, b[i]));
test('vector projection gives an orthogonal residual and handles zero directions', () => {
  const u = [1, 3],
    v = [3, 1],
    p = projection(u, v);
  near(dot(add(u, scale(-1, p)), v), 0);
  near(det([p[0], v[0], p[1], v[1]]), 0);
  near(angle([1, 0], [0, 1]), 90);
  near(angle([1, 0], [-1, 0]), 180);
  assert.equal(angle([0, 0], v), null);
  assert.equal(projection(u, [0, 0]), null);
  nearArray(projection([0, 0], v), [0, 0]);
});
test('matrix operations respect composition, inversion, and signed area', () => {
  const a = [2, 1, -1, 3],
    b = [0, -1, 1, 0],
    v = [3, -2];
  nearArray(apply(multiply(a, b), v), apply(a, apply(b, v)));
  nearArray(multiply(inverse(a), a), [1, 0, 0, 1]);
  nearArray(transpose(transpose(a)), a);
  near(det(multiply(a, b)), det(a) * det(b));
  assert.notDeepEqual(multiply(a, b), multiply(b, a));
  assert.deepEqual(hadamard(a, [1, 0, 0, 1]), [2, 0, -0, 3]);
  assert.deepEqual(hadamard(a, [1, 1, 1, 1]), a);
  assert.equal(inverse([1, 2, 2, 4]), null);
  assert.equal(rank([1, 2, 2, 4]), 1);
  assert.equal(rank([0, 0, 0, 0]), 0);
  assert.equal(rank([1e-8, 0, 0, 1e-8]), 2);
});
test('eigenvalues distinguish complex, scalar, defective, and distinct cases', () => {
  const rotation = eigen([0, -1, 1, 0]);
  assert.equal(rotation.kind, 'complex');
  near(rotation.imaginary, 1);
  assert.deepEqual(rotation.vectors, []);
  assert.equal(eigen([2, 0, 0, 2]).kind, 'scalar');
  assert.equal(eigen([0, 0, 0, 0]).kind, 'scalar');
  assert.equal(eigen([1, 1, 0, 1]).kind, 'defective');
  assert.equal(eigen([0, 1, 0, 0]).kind, 'defective');
  assert.deepEqual(eigen([2, 1, 1, 2]).values, [3, 1]);
  for (let a = -2; a <= 2; a++)
    for (let b = -2; b <= 2; b++)
      for (let c = -2; c <= 2; c++)
        for (let d = -2; d <= 2; d++) {
          const matrix = [a, b, c, d],
            e = eigen(matrix);
          if (e.kind === 'complex') {
            near(e.values[0] ** 2 + e.imaginary ** 2, det(matrix));
          } else {
            near(e.values[0] + e.values[1], a + d);
            near(e.values[0] * e.values[1], det(matrix));
            e.vectors.forEach((v, i) => {
              near(norm(v), 1);
              nearArray(apply(matrix, v), scale(e.values[i], v));
            });
          }
        }
});
test('analytic Jacobians match finite differences and local errors shrink', () => {
  for (const kind of ['square', 'polar', 'shear'])
    for (const p of [
      [1, 0.5],
      [0, 0],
      [-2, 1],
    ]) {
      const j = jacobian(kind, p),
        h = 1e-5;
      for (let axis = 0; axis < 2; axis++) {
        const offset = axis === 0 ? [h, 0] : [0, h];
        const derivative = scale(
          1 / (2 * h),
          add(
            mapping(kind, add(p, offset)),
            scale(-1, mapping(kind, add(p, scale(-1, offset)))),
          ),
        );
        nearArray(derivative, axis === 0 ? [j[0], j[2]] : [j[1], j[3]]);
      }
      const error = (delta) => {
        const offset = [delta, delta];
        return norm(
          add(
            mapping(kind, add(p, offset)),
            scale(-1, add(mapping(kind, p), apply(j, offset))),
          ),
        );
      };
      assert.ok(error(0.01) < error(0.1) / 50);
    }
});
test('every teaching preset renders finite diagrams and valid KaTeX', () => {
  for (const page of algebraPages)
    for (const example of [{ state: {} }, ...presets[page.id]]) {
      const rendered = renderAlgebra(page.id, {
        ...initialAlgebraState(page.id),
        ...example.state,
      });
      assert.match(rendered.results, /katex/);
      assert.doesNotMatch(
        rendered.visual + rendered.results,
        /NaN|Infinity|katex-error/,
      );
      assert.ok(rendered.summary.length > 0);
    }
});
