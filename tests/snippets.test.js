import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { distributions, defaults, examplePoint } from '../src/distributions.ts';
import { snippetSource } from '../src/snippets.ts';

const cases = {
  normal: [
    { mu: 0, sigma: 1 },
    { mu: -10, sigma: 0.1 },
    { mu: 10, sigma: 5 },
  ],
  uniform: [
    { a: 0, b: 1 },
    { a: -10, b: 10 },
    { a: 1, b: 1.1 },
  ],
  exponential: [{ rate: 0.1 }, { rate: 1 }, { rate: 10 }],
  binomial: [
    { n: 20, p: 0.5 },
    { n: 100, p: 0 },
    { n: 100, p: 1 },
    { n: 100, p: 0.99 },
  ],
  poisson: [{ rate: 0.1 }, { rate: 5 }, { rate: 50 }],
  bernoulli: [{ p: 0 }, { p: 0.3 }, { p: 1 }],
  geometric: [{ p: 0.05 }, { p: 0.3 }, { p: 1 }],
  negative_binomial: [
    { r: 1, p: 0.1 },
    { r: 5, p: 0.5 },
    { r: 30, p: 1 },
  ],
  discrete_uniform: [
    { a: -20, b: 20 },
    { a: 2, b: 2 },
    { a: -5, b: -1 },
  ],
  lognormal: [
    { mu: 0, sigma: 0.5 },
    { mu: -2, sigma: 0.1 },
  ],
  laplace: [
    { mu: 0, scale: 1 },
    { mu: -10, scale: 0.1 },
  ],
  logistic: [
    { mu: 0, scale: 1 },
    { mu: 10, scale: 5 },
  ],
  cauchy: [
    { center: 0, scale: 1 },
    { center: 5, scale: 0.1 },
  ],
  weibull: [
    { shape: 0.5, scale: 1 },
    { shape: 1, scale: 0.1 },
    { shape: 5, scale: 5 },
  ],
  rayleigh: [{ sigma: 0.1 }, { sigma: 5 }],
  pareto: [
    { minimum: 1, alpha: 5 },
    { minimum: 0.1, alpha: 0.5 },
    { minimum: 5, alpha: 2 },
  ],
  triangular: [
    { a: 0, c: 0.5, b: 1 },
    { a: -10, c: -9.9, b: 10 },
  ],
};
const near = (a, b, tolerance = 1e-10) =>
  assert.ok(a === b || Math.abs(a - b) <= tolerance, `${a} != ${b}`);
function run(source, language) {
  if (language === 'js') {
    const output = [];
    runInNewContext(
      source,
      { console: { log: (v) => output.push(Number(v)) } },
      { timeout: 15000 },
    );
    return output;
  }
  const dir = mkdtempSync(join(tmpdir(), 'jmath-snippets-'));
  try {
    const file = join(dir, language === 'c' ? 'snippet.c' : 'snippet.py');
    writeFileSync(file, source);
    let result;
    if (language === 'c') {
      const binary = join(dir, 'snippet');
      execFileSync(
        'cc',
        ['-std=c99', '-Wall', '-Wextra', '-Werror', file, '-lm', '-o', binary],
        { timeout: 15000 },
      );
      result = execFileSync(binary, [], { timeout: 15000, encoding: 'utf8' });
    } else
      result = execFileSync('python3', [file], {
        timeout: 15000,
        encoding: 'utf8',
      });
    return result
      .trim()
      .split(/\s+/)
      .map((v) =>
        v === 'inf' ? Infinity : v === '-inf' ? -Infinity : Number(v),
      );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
for (const language of ['js', 'python', 'c']) {
  const executable = language === 'python' ? 'python3' : 'cc';
  const available =
    language === 'js' || spawnSync(executable, ['--version']).status === 0;
  test(
    `${language}: runnable examples, densities, support and sampling moments`,
    { skip: available ? false : `${executable} is not installed` },
    () => {
      for (const d of distributions) {
        const output = run(snippetSource(d, language, defaults(d)), language);
        assert.equal(output.length, 6);
        assert.ok(output.every(Number.isFinite));
        near(output[0], d.density(examplePoint(d, defaults(d)), defaults(d)));
        let source = snippetSource(d, language, defaults(d), {
          example: false,
        });
        // Fixed RNG seed for deterministic statistical checks in each runtime.
        source +=
          language === 'js'
            ? '\nlet state = 42;\nfunction rng() { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; }\n'
            : language === 'python'
              ? '\nrandom.seed(42)\n'
              : '\nint main(void) {\n    srand(42);\n';
        const expectations = [];
        for (const p of cases[d.id] || [defaults(d)]) {
          const args = d.params.map((param) => p[param.key]).join(', ');
          const density = d.id + (d.type === 'Discrete' ? '_pmf' : '_pdf');
          const xs = [-1, 0, 0.5, 1, 5, 20, 100];
          for (const x of xs) {
            const call = `${density}(${x}, ${args})`;
            source +=
              language === 'js'
                ? `console.log(${call});\n`
                : language === 'python'
                  ? `print(${call})\n`
                  : `printf("%.17g\\n", ${call});\n`;
            expectations.push(d.density(x, p));
          }
          const threshold =
            d.id === 'cauchy' ? p.center + p.scale : examplePoint(d, p);
          const call = `${d.id}_sample(${args}${language === 'python' ? '' : language === 'js' ? ', rng' : ', uniform01'})`;
          const support = [
            'uniform',
            'triangular',
            'discrete_uniform',
          ].includes(d.id)
            ? `v >= ${p.a} && v <= ${p.b}`
            : d.id === 'binomial'
              ? `v >= 0 && v <= ${p.n} && v == FLOOR(v)`
              : [
                    'poisson',
                    'bernoulli',
                    'geometric',
                    'negative_binomial',
                  ].includes(d.id)
                ? 'v >= 0 && v == FLOOR(v)'
                : ['exponential', 'lognormal', 'weibull', 'rayleigh'].includes(
                      d.id,
                    )
                  ? 'v >= 0'
                  : d.id === 'pareto'
                    ? `v >= ${p.minimum}`
                    : '1';
          if (language === 'js')
            source += `{ let sum = 0, sum2 = 0, valid = 1, below = 0; for (let i = 0; i < 30000; i++) { const v = ${call}; sum += v; sum2 += v*v; if (v <= ${threshold}) below++; if (!(${support.replaceAll('FLOOR', 'Math.floor')})) valid = 0; } console.log(sum/30000); console.log(sum2/30000 - (sum/30000)**2); console.log(valid); console.log(below/30000); }\n`;
          else if (language === 'python')
            source += `sum1, sum2, valid, below = 0.0, 0.0, 1, 0\nfor _ in range(30000):\n    v = ${call}\n    sum1 += v\n    sum2 += v*v\n    if v <= ${threshold}:\n        below += 1\n    if not (${support.replaceAll('&&', 'and').replaceAll('FLOOR', 'math.floor')}):\n        valid = 0\nprint(sum1/30000)\nprint(sum2/30000 - (sum1/30000)**2)\nprint(valid)\nprint(below/30000)\n`;
          else
            source += `{ double sum = 0, sum2 = 0; int valid = 1, below = 0; for (int i = 0; i < 30000; i++) { double v = ${call}; sum += v; sum2 += v*v; if (v <= ${threshold}) below++; if (!(${support.replaceAll('FLOOR', 'floor')})) valid = 0; } printf("%.17g\\n%.17g\\n%d\\n%.17g\\n", sum/30000, sum2/30000 - (sum/30000)*(sum/30000), valid, below/30000.0); }\n`;
          expectations.push({
            mean: d.stats(p).Mean,
            variance: d.stats(p).Variance,
            probability: d.cdf(threshold, p),
          });
        }
        if (language === 'c') source += 'return 0;\n}\n';
        const results = run(source, language);
        let i = 0;
        for (const expected of expectations) {
          if (typeof expected === 'number') near(results[i++], expected);
          else {
            const actualMean = results[i++],
              actualVariance = results[i++];
            if (
              Number.isFinite(expected.mean) &&
              Number.isFinite(expected.variance)
            ) {
              near(
                actualMean,
                expected.mean,
                Math.max(1e-8, 0.06 * Math.sqrt(expected.variance)),
              );
              near(
                actualVariance,
                expected.variance,
                Math.max(1e-8, 0.08 * expected.variance),
              );
            }
            assert.equal(results[i++], 1, `${d.id} sample outside support`);
            near(results[i++], expected.probability, 0.02);
          }
        }
        assert.equal(i, results.length);
      }
    },
  );
}
test('snippet generation rejects invalid parameters and languages', () => {
  assert.throws(() =>
    snippetSource(distributions[0], 'js', { mu: 0, sigma: 0 }),
  );
  assert.throws(() =>
    snippetSource(distributions[0], 'ruby', defaults(distributions[0])),
  );
});
