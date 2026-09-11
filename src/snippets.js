import { moreAlgorithms, moreBodies } from './more-snippets.js';
import { validate, examplePoint } from './distributions.js';

export const languages = { js: 'JavaScript', python: 'Python', c: 'C' };
export const algorithms = {
  ...moreAlgorithms,
  normal: 'Box–Muller transform: turn two independent uniform draws into a normal sample.',
  uniform: 'Affine transform: stretch a uniform draw to the interval [a, b).',
  exponential: 'Inverse transform: apply −log(1 − U) / λ to a uniform draw.',
  binomial: 'Bernoulli trials: make n independent draws and count those below p.',
  poisson: 'Product method: multiply uniform draws until the product falls below exp(−λ).',
};

// All algorithms are written out. Only standard arithmetic, elementary math,
// and a uniform random source are used; no distribution-library calls.
const bodies = {
  ...moreBodies,
  normal: {
    js: [
      'const z = (x - mu) / sigma;\nreturn Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));',
      'const u = 1 - rng(); // (0, 1], so log never receives zero.\nconst v = rng();\nreturn mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);',
    ],
    python: [
      'z = (x - mu) / sigma\nreturn math.exp(-0.5 * z * z) / (sigma * math.sqrt(2 * math.pi))',
      'u = 1 - rng()  # (0, 1], so log never receives zero.\nv = rng()\nreturn mu + sigma * math.sqrt(-2 * math.log(u)) * math.cos(2 * math.pi * v)',
    ],
    c: [
      'double z = (x - mu) / sigma;\nreturn exp(-0.5 * z * z) / (sigma * sqrt(2 * acos(-1.0)));',
      'double u = 1 - rng(); /* (0, 1], avoiding log(0). */\ndouble v = rng();\nreturn mu + sigma * sqrt(-2 * log(u)) * cos(2 * acos(-1.0) * v);',
    ],
  },
  uniform: {
    js: ['return x < a || x > b ? 0 : 1 / (b - a);', 'return a + (b - a) * rng();'],
    python: ['return 0.0 if x < a or x > b else 1 / (b - a)', 'return a + (b - a) * rng()'],
    c: ['return x < a || x > b ? 0 : 1 / (b - a);', 'return a + (b - a) * rng();'],
  },
  exponential: {
    js: ['return x < 0 ? 0 : rate * Math.exp(-rate * x);', 'return -Math.log1p(-rng()) / rate;'],
    python: ['return 0.0 if x < 0 else rate * math.exp(-rate * x)', 'return -math.log1p(-rng()) / rate'],
    c: ['return x < 0 ? 0 : rate * exp(-rate * x);', 'return -log1p(-rng()) / rate;'],
  },
  binomial: {
    js: [
      'if (!Number.isInteger(x) || x < 0 || x > n) return 0;\nif (p === 0) return x === 0 ? 1 : 0;\nif (p === 1) return x === n ? 1 : 0;\n// Compute log(C(n, x)) to avoid large factorials.\nconst k = Math.min(x, n - x);\nlet logChoose = 0;\nfor (let i = 1; i <= k; i++) logChoose += Math.log((n - i + 1) / i);\nreturn Math.exp(logChoose + x * Math.log(p) + (n - x) * Math.log1p(-p));',
      'let successes = 0;\nfor (let i = 0; i < n; i++) {\n  if (rng() < p) successes++;\n}\nreturn successes;',
    ],
    python: [
      'if x < 0 or x > n or x != math.floor(x):\n    return 0.0\nif p == 0:\n    return 1.0 if x == 0 else 0.0\nif p == 1:\n    return 1.0 if x == n else 0.0\n# Compute log(C(n, x)) to avoid large factorials.\nk = min(int(x), n - int(x))\nlog_choose = 0.0\nfor i in range(1, k + 1):\n    log_choose += math.log((n - i + 1) / i)\nreturn math.exp(log_choose + x * math.log(p) + (n - x) * math.log1p(-p))',
      'successes = 0\nfor _ in range(n):\n    if rng() < p:\n        successes += 1\nreturn successes',
    ],
    c: [
      'if (x < 0 || x > n || x != floor(x)) return 0;\nif (p == 0) return x == 0 ? 1 : 0;\nif (p == 1) return x == n ? 1 : 0;\n/* Compute log(C(n, x)) to avoid large factorials. */\nint k = (int)fmin(x, n - x);\ndouble log_choose = 0;\nfor (int i = 1; i <= k; i++) log_choose += log((n - i + 1.0) / i);\nreturn exp(log_choose + x * log(p) + (n - x) * log1p(-p));',
      'int successes = 0;\nfor (int i = 0; i < n; i++) {\n    if (rng() < p) successes++;\n}\nreturn successes;',
    ],
  },
  poisson: {
    js: [
      'if (!Number.isInteger(x) || x < 0) return 0;\nlet logFactorial = 0;\nfor (let i = 2; i <= x; i++) logFactorial += Math.log(i);\nreturn Math.exp(x * Math.log(rate) - rate - logFactorial);',
      'const limit = Math.exp(-rate);\nlet product = 1, k = 0;\ndo {\n  k++;\n  product *= 1 - rng();\n} while (product > limit);\nreturn k - 1;',
    ],
    python: [
      'if x < 0 or x != math.floor(x):\n    return 0.0\nlog_factorial = 0.0\nfor i in range(2, int(x) + 1):\n    log_factorial += math.log(i)\nreturn math.exp(x * math.log(rate) - rate - log_factorial)',
      'limit = math.exp(-rate)\nproduct, k = 1.0, 0\nwhile True:\n    k += 1\n    product *= 1 - rng()\n    if product <= limit:\n        return k - 1',
    ],
    c: [
      'if (x < 0 || x != floor(x)) return 0;\ndouble log_factorial = 0;\nfor (double i = 2; i <= x; i++) log_factorial += log(i);\nreturn exp(x * log(rate) - rate - log_factorial);',
      'double limit = exp(-rate), product = 1;\nint k = 0;\ndo {\n    k++;\n    product *= 1 - rng();\n} while (product > limit);\nreturn k - 1;',
    ],
  },
};
const indent = (s, n) => s.split('\n').map(line => ' '.repeat(n) + line).join('\n');

function condition(d, lang) {
  const and = lang === 'python' ? ' and ' : ' && ';
  const terms = d.params.flatMap(p => {
    const finite = lang === 'js' ? `Number.isFinite(${p.key})` : lang === 'python' ? `math.isfinite(${p.key})` : `isfinite(${p.key})`;
    return [...(lang === 'c' && (p.integer || p.key === 'n') ? [] : [finite]), `${p.key} >= ${p.min}`, `${p.key} <= ${p.max}`];
  });
  if (lang !== 'c') for (const p of d.params.filter(p => p.integer || p.key === 'n')) terms.push(lang === 'js' ? `Number.isInteger(${p.key})` : `isinstance(${p.key}, int)`);
  for (const c of d.constraints || []) terms.push(`${c.left} ${c.op} ${c.right}`);
  if (d.id === 'uniform') terms.push('a < b');
  return terms.join(and);
}

export function snippetSource(d, lang, values, { example = true } = {}) {
  if (!languages[lang] || !bodies[d.id]) throw new Error('Snippet unavailable');
  const error = validate(d, values);
  if (error) throw new Error(error);
  const names = d.params.map(p => p.key).join(', ');
  const args = d.params.map(p => String(values[p.key])).join(', ');
  const fn = d.id + (d.type === 'Discrete' ? '_pmf' : '_pdf');
  const sample = d.id + '_sample';
  const x = examplePoint(d, values);
  const [densityBody, sampleBody] = bodies[d.id][lang];
  const note = `${d.name}: ${algorithms[d.id]}\nParameter limits match the explorer; finite x is required.\nThe RNG must return independent uniform values in [0, 1).\nStandard-library math and uniform RNG only; no distribution libraries.`;
  const valid = condition(d, lang);
  if (lang === 'js') {
    const guard = `if (!(${valid})) throw new RangeError("Parameters outside explorer limits");`;
    return note.split('\n').map(l => '// ' + l).join('\n') + `\n\nfunction ${fn}(x, ${names}) {\n${indent(guard, 2)}\n  if (!Number.isFinite(x)) throw new RangeError("x must be finite");\n${indent(densityBody, 2)}\n}\n\nfunction ${sample}(${names}, rng = Math.random) {\n${indent(guard, 2)}\n${indent(sampleBody, 2)}\n}\n` + (example ? `\n// Current explorer parameters. Samples use the runtime RNG, not the page seed.\nconsole.log(${fn}(${x}, ${args}));\nfor (let i = 0; i < 5; i++) console.log(${sample}(${args}));\n` : '');
  }
  if (lang === 'python') {
    const guard = `if not (${valid}):\n    raise ValueError("Parameters outside explorer limits")`;
    return note.split('\n').map(l => '# ' + l).join('\n') + `\n\nimport math\nimport random\n\ndef ${fn}(x, ${names}):\n${indent(guard, 4)}\n    if not math.isfinite(x):\n        raise ValueError("x must be finite")\n${indent(densityBody, 4)}\n\ndef ${sample}(${names}, rng=random.random):\n${indent(guard, 4)}\n${indent(sampleBody, 4)}\n` + (example ? `\n# Current explorer parameters. This seed is independent of the page seed.\nif __name__ == "__main__":\n    random.seed(42)\n    print(${fn}(${x}, ${args}))\n    for _ in range(5):\n        print(${sample}(${args}))\n` : '');
  }
  const declarations = d.params.map(p => `${p.integer || p.key === 'n' ? 'int' : 'double'} ${p.key}`).join(', ');
  const guard = `if (!(${valid})) return NAN;`;
  return note.split('\n').map(l => '// ' + l).join('\n') + `\n// Invalid arguments return NAN. Compile: cc -std=c99 snippet.c -lm -o snippet\n\n#include <math.h>\n#include <stdlib.h>\n#include <stdio.h>\n\n// Basic uniform source. You may supply a different RNG to the sampler.\ndouble uniform01(void) {\n    return rand() / (RAND_MAX + 1.0);\n}\n\ndouble ${fn}(double x, ${declarations}) {\n${indent(guard, 4)}\n    if (!isfinite(x)) return NAN;\n${indent(densityBody, 4)}\n}\n\ndouble ${sample}(${declarations}, double (*rng)(void)) {\n${indent(guard, 4)}\n    if (rng == NULL) return NAN;\n${indent(sampleBody, 4)}\n}\n` + (example ? `\nint main(void) {\n    // This seed is independent of the page seed; rand() varies by C runtime.\n    srand(42);\n    printf("%.17g\\n", ${fn}(${x}, ${args}));\n    for (int i = 0; i < 5; i++)\n        printf("%.17g\\n", ${sample}(${args}, uniform01));\n    return 0;\n}\n` : '');
}
