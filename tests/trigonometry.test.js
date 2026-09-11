import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import vm from 'node:vm';
import {
  trigFunctions,
  evaluateTrig,
  trigAtPath,
} from '../src/trigonometry.ts';
import {
  PI,
  sine,
  cosine,
  tangent,
  arcsine,
  arccosine,
  arctangent,
} from '../src/trig-math.ts';
import { trigSnippet } from '../src/trig-snippets.ts';
import { trigGraph, unitCircle } from '../src/trig-visuals.ts';
const native = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  arcsin: Math.asin,
  arccos: Math.acos,
  arctan: Math.atan,
};
const close = (a, b, tol = 2e-12) =>
  assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} != ${b}`);
const fixtures = (f) =>
  f.inverse
    ? f.id === 'arctan'
      ? [-1e100, -5, -1, 0, 1, 5, 1e100]
      : [-1, -1 + 1e-15, -0.5, 0, 0.5, 1 - 1e-15, 1]
    : [-10000, -PI, -PI / 4, 0, PI / 6, PI / 4, PI, 10000];
test('arithmetic trig agrees with native references, identities and inverse branches', () => {
  for (const f of trigFunctions)
    for (const x of fixtures(f)) close(f.fn(x), native[f.id](x));
  for (let i = -100; i <= 100; i++) {
    const x = i / 17;
    close(sine(x) ** 2 + cosine(x) ** 2, 1);
    close(sine(-x), -sine(x));
    close(cosine(-x), cosine(x));
    close(tangent(arctangent(x)), x);
    const y = i / 100;
    close(sine(arcsine(y)), y);
    close(cosine(arccosine(y)), y);
    close(arcsine(y) + arccosine(y), PI / 2);
  }
  close(arcsine(sine((5 * PI) / 6)), PI / 6);
  close(arccosine(cosine(-PI / 3)), PI / 3);
});
test('domains, tangent poles, units and routes are explicit', () => {
  for (const f of trigFunctions)
    for (const x of [NaN, Infinity, -Infinity]) assert.throws(() => f.fn(x));
  for (const f of [sine, cosine, tangent]) assert.throws(() => f(10001));
  for (const f of [arcsine, arccosine])
    for (const x of [-1.01, 1.01]) assert.throws(() => f(x));
  for (let k = -5; k <= 5; k++) assert.throws(() => tangent(PI / 2 + k * PI));
  close(evaluateTrig(trigFunctions[0], 30, 'degrees'), 0.5);
  close(evaluateTrig(trigFunctions[3], 0.5, 'degrees'), 30);
  assert.equal(trigAtPath('/trigonometry').item, null);
  assert.equal(trigAtPath('/trigonometry/arcsin/').item.id, 'arcsin');
  assert.equal(trigAtPath('/trigonometry/missing'), null);
  for (const f of trigFunctions)
    for (const t of f.theorems)
      for (const id of t.related)
        assert.ok(trigFunctions.some((g) => g.id === id));
});
test('graph paths split tangent branches and mark asymptotes', () => {
  for (const f of trigFunctions)
    for (const unit of ['degrees', 'radians']) {
      const svg = trigGraph(f, f.initial, unit);
      assert.ok(!/NaN|Infinity/.test(svg));
      assert.match(svg, /data-selected-point/);
    }
  const graph = trigGraph(trigFunctions[2]);
  assert.equal((graph.match(/data-asymptote/g) || []).length, 4);
  const path = graph.match(/data-curve="true" d="([^"]*)"/)[1];
  assert.equal((path.match(/M/g) || []).length, 5);
  assert.ok(!/NaN|Infinity/.test(unitCircle(-PI / 3)));
});
for (const language of ['js', 'python', 'c'])
  test(`${language} arithmetic implementations execute across domains and endpoints`, () => {
    const dir = mkdtempSync(join(tmpdir(), 'jmath-trig-'));
    try {
      for (const f of trigFunctions) {
        const xs = fixtures(f),
          source = trigSnippet(f, language, f.initial, { example: false }),
          name = f.fn.name;
        let output;
        assert.ok(
          !/(?:Math|math)\.(?:sin|cos|tan|asin|acos|atan)\(/.test(source),
        );
        if (language === 'js')
          output = vm.runInNewContext(
            source + `\n[${xs.join(',')}].map(${name});`,
          );
        if (language === 'python')
          output = execFileSync(
            'python3',
            ['-c', source + `\nfor x in [${xs.join(',')}]: print(${name}(x))`],
            { encoding: 'utf8' },
          )
            .trim()
            .split('\n')
            .map(Number);
        if (language === 'c') {
          const file = join(dir, 'trig.c'),
            binary = join(dir, 'trig');
          writeFileSync(
            file,
            source +
              `\nint main(void) { double xs[] = {${xs.join(',')}}; for (unsigned i=0; i<sizeof(xs)/sizeof(xs[0]); i++) printf("%.17g\\n", ${name}(xs[i])); return 0; }`,
          );
          execFileSync('cc', [
            '-std=c99',
            '-Wall',
            '-Wextra',
            '-Werror',
            file,
            '-lm',
            '-o',
            binary,
          ]);
          output = execFileSync(binary, [], { encoding: 'utf8' })
            .trim()
            .split('\n')
            .map(Number);
        }
        xs.forEach((x, i) => close(output[i], native[f.id](x)));
      }
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
