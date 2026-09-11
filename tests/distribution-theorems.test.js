import test from 'node:test';
import assert from 'node:assert/strict';
import { distributions } from '../src/distributions.ts';
import { distributionTheorems } from '../src/distribution-theorems.ts';
import { sequenceTheorems } from '../src/sequence-theorems.ts';
import { sequences, sequenceUrl } from '../src/sequences.ts';
import { distributionUrl } from '../src/routes.ts';
import { renderTheorems } from '../src/theorem-view.ts';
const get = (id) => distributions.find((d) => d.id === id);
const cdf = (id, x, p) => get(id).cdf(x, p);
const mass = (id, x, p) => get(id).density(x, p);
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);
test('every distribution has complete results and valid catalogue links', () => {
  assert.deepEqual(
    Object.keys(distributionTheorems).sort(),
    distributions.map((d) => d.id).sort(),
  );
  for (const [id, results] of Object.entries(distributionTheorems)) {
    assert.equal(results.length, 2);
    assert.equal(new Set(results.map((t) => t.id)).size, results.length);
    for (const t of results) {
      for (const key of [
        'id',
        'title',
        'kind',
        'conditions',
        'statement',
        'example',
        'proof',
      ])
        assert.ok(t[key]?.length > 0);
      assert.equal(new URL(t.reference.url).protocol, 'https:');
      for (const related of t.related) assert.ok(get(related));
    }
    assert.ok(
      renderTheorems(results, distributions, distributionUrl).includes(
        `theorem-${results[0].id}`,
      ),
      id,
    );
  }
  assert.ok(
    renderTheorems(sequenceTheorems.cubes, sequences, sequenceUrl).includes(
      '/sequences/triangular#theorems',
    ),
  );
  assert.ok(
    renderTheorems(
      distributionTheorems.triangular,
      distributions,
      distributionUrl,
    ).includes('/distributions/uniform#theorems'),
  );
});
test('failure-count tail identities use the catalogue indexing convention', () => {
  for (const p of [0.1, 0.5, 0.9, 1])
    for (const r of [1, 2, 5])
      for (const k of [0, 1, 6]) {
        close(
          cdf('negative_binomial', k, { r, p }),
          1 - cdf('binomial', r - 1, { n: r + k, p }),
        );
      }
  for (const p of [0.1, 0.5, 0.9])
    for (const m of [0, 1, 3])
      for (const n of [0, 1, 2]) {
        const tail = (k) => 1 - cdf('geometric', k - 1, { p });
        close(tail(m + n) / tail(m), tail(n));
      }
});
test('continuous transformations and waiting-time identities match catalogue CDFs', () => {
  for (const t of [0, 0.1, 1, 3]) {
    close(
      1 - cdf('exponential', t, { rate: 5 }),
      (1 - cdf('exponential', t, { rate: 2 })) *
        (1 - cdf('exponential', t, { rate: 3 })),
    );
    close(
      cdf('weibull', 3 * Math.sqrt(t), { shape: 2, scale: 3 }),
      cdf('exponential', t, { rate: 1 }),
    );
    close(
      cdf('rayleigh', 2 * Math.sqrt(2 * t), { sigma: 2 }),
      cdf('exponential', t, { rate: 1 }),
    );
    close(
      cdf('rayleigh', t, { sigma: 2 }),
      cdf('weibull', t, { shape: 2, scale: 2 * Math.SQRT2 }),
    );
    close(
      cdf('pareto', 2 * Math.exp(t), { minimum: 2, alpha: 3 }),
      cdf('exponential', t, { rate: 3 }),
    );
    close(
      cdf('laplace', t, { mu: 0, scale: 2 }) -
        cdf('laplace', -t, { mu: 0, scale: 2 }),
      cdf('exponential', t, { rate: 0.5 }),
    );
  }
  for (const u of [0.001, 0.25, 0.5, 0.75, 0.999])
    close(
      cdf('logistic', 1 + 2 * Math.log(u / (1 - u)), { mu: 1, scale: 2 }),
      u,
    );
  for (const c of [0, 1, 2])
    for (const x of [-1, 0, 0.5, 1, 2, 3])
      close(
        cdf('triangular', 2 + 3 * x, { a: 2, c: 2 + 3 * c, b: 8 }),
        cdf('triangular', x, { a: 0, c, b: 2 }),
      );
});
test('count closure and thinning identities match PMFs, including deterministic retention', () => {
  for (let k = 0; k <= 15; k++) {
    let poissonSum = 0,
      negativeSum = 0;
    for (let j = 0; j <= k; j++) {
      poissonSum +=
        mass('poisson', j, { rate: 2 }) * mass('poisson', k - j, { rate: 3 });
      negativeSum +=
        mass('negative_binomial', j, { r: 2, p: 0.4 }) *
        mass('negative_binomial', k - j, { r: 3, p: 0.4 });
    }
    close(poissonSum, mass('poisson', k, { rate: 5 }));
    close(negativeSum, mass('negative_binomial', k, { r: 5, p: 0.4 }));
  }
  const pm = (k, rate) =>
    rate === 0 ? Number(k === 0) : mass('poisson', k, { rate });
  for (const q of [0, 0.25, 1])
    for (let r = 0; r <= 4; r++)
      for (let d = 0; d <= 4; d++)
        close(
          mass('poisson', r + d, { rate: 8 }) *
            mass('binomial', r, { n: r + d, p: q }),
          pm(r, 8 * q) * pm(d, 8 * (1 - q)),
        );
});
