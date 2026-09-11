import { moreDistributions } from './more-distributions.ts';
import type { Distribution, Parameters } from './types.ts';
const normalCdf = (z: number) => {
  if (z === 0) return 0.5;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const tail =
    (Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)) *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - tail : tail;
};
const logFactorial = (n: number) => {
  let result = 0;
  for (let i = 2; i <= n; i++) result += Math.log(i);
  return result;
};
const sumMass = (
  x: number,
  p: Parameters,
  fn: Distribution['density'],
  max = Infinity,
) => {
  let result = 0;
  for (let k = 0; k <= Math.min(Math.floor(x), max); k++) result += fn(k, p);
  return Math.min(1, result);
};
const binomialMass = (k: number, { n, p }: Parameters) => {
  if (!Number.isInteger(k) || k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(
    logFactorial(n) -
      logFactorial(k) -
      logFactorial(n - k) +
      k * Math.log(p) +
      (n - k) * Math.log1p(-p),
  );
};
const poissonMass = (k: number, { rate }: Parameters) =>
  !Number.isInteger(k) || k < 0
    ? 0
    : Math.exp(k * Math.log(rate) - rate - logFactorial(k));
const param = (
  key: string,
  label: string,
  symbol: string,
  value: number,
  min: number,
  max: number,
  step: number,
) => ({ key, label, symbol, value, min, max, step });
export const distributions: Distribution[] = [
  {
    id: 'normal',
    name: 'Normal',
    alias: 'Gaussian distribution',
    type: 'Continuous',
    color: '#6960d7',
    notation: 'N(μ, σ²)',
    description:
      'A continuous, symmetric distribution parameterized by its mean and standard deviation.',
    use: 'Measurement errors, test scores, and the combined effect of many small, independent influences.',
    tags: ['Symmetric', 'Bell-shaped'],
    formula: 'f(x) = exp(−(x − μ)² / (2σ²)) / (σ√(2π))',
    params: [
      param('mu', 'Mean', 'μ', 0, -10, 10, 0.1),
      param('sigma', 'Standard deviation', 'σ', 1, 0.1, 5, 0.1),
    ],
    density: (x, { mu, sigma }) =>
      Math.exp(-0.5 * ((x - mu) / sigma) ** 2) /
      (sigma * Math.sqrt(2 * Math.PI)),
    cdf: (x, { mu, sigma }) => normalCdf((x - mu) / sigma),
    range: ({ mu, sigma }) => [mu - 4 * sigma, mu + 4 * sigma],
    stats: ({ mu, sigma }) => ({
      Mean: mu,
      Variance: sigma ** 2,
      'Std. deviation': sigma,
      Median: mu,
      Support: '(−∞, ∞)',
      Skewness: 0,
    }),
    sample: ({ mu, sigma }, rng) =>
      mu +
      sigma *
        Math.sqrt(-2 * Math.log(1 - rng())) *
        Math.cos(2 * Math.PI * rng()),
    source: '1',
  },
  {
    id: 'uniform',
    name: 'Uniform',
    alias: 'Continuous uniform distribution',
    type: 'Continuous',
    color: '#38968b',
    notation: 'U(a, b)',
    description:
      'A constant probability density over a bounded interval. Equal-length subintervals have equal probability.',
    use: 'Random starting points, simulation inputs, and quantities equally likely across a known interval.',
    tags: ['Bounded', 'Constant density'],
    formula: 'f(x) = 1 / (b − a),  a ≤ x ≤ b;  0 otherwise',
    params: [
      param('a', 'Lower bound', 'a', 0, -10, 9, 0.1),
      param('b', 'Upper bound', 'b', 1, -9, 10, 0.1),
    ],
    density: (x, { a, b }) => (x < a || x > b ? 0 : 1 / (b - a)),
    cdf: (x, { a, b }) => Math.max(0, Math.min(1, (x - a) / (b - a))),
    range: ({ a, b }) => [a - (b - a) * 0.25, b + (b - a) * 0.25],
    stats: ({ a, b }) => ({
      Mean: (a + b) / 2,
      Variance: (b - a) ** 2 / 12,
      'Std. deviation': (b - a) / Math.sqrt(12),
      Median: (a + b) / 2,
      Support: `[${a}, ${b}]`,
      Skewness: 0,
    }),
    sample: ({ a, b }, rng) => a + (b - a) * rng(),
    source: '2',
  },
  {
    id: 'exponential',
    name: 'Exponential',
    alias: 'Waiting-time distribution',
    type: 'Continuous',
    color: '#ca9250',
    notation: 'Exp(λ)',
    description:
      'Waiting times between independent events occurring at a constant rate.',
    use: 'Time between independent arrivals at a constant average rate. Its memoryless property means elapsed time does not change the remaining waiting-time distribution.',
    tags: ['Memoryless', 'Right-skewed'],
    formula: 'f(x) = λ exp(−λx),  x ≥ 0;  0 otherwise',
    params: [param('rate', 'Rate (not scale)', 'λ', 1, 0.1, 10, 0.1)],
    density: (x, { rate }) => (x < 0 ? 0 : rate * Math.exp(-rate * x)),
    cdf: (x, { rate }) => (x <= 0 ? 0 : -Math.expm1(-rate * x)),
    range: ({ rate }) => [0, 6 / rate],
    stats: ({ rate }) => ({
      Mean: 1 / rate,
      Variance: 1 / rate ** 2,
      'Std. deviation': 1 / rate,
      Median: Math.LN2 / rate,
      Support: '[0, ∞)',
      Skewness: 2,
    }),
    sample: ({ rate }, rng) => -Math.log1p(-rng()) / rate,
    source: '7',
  },
  {
    id: 'binomial',
    name: 'Binomial',
    alias: 'Success-count distribution',
    type: 'Discrete',
    color: '#5f8bca',
    notation: 'Bin(n, p)',
    description:
      'Count the successes in a fixed number of independent trials, each with the same chance of success.',
    use: 'Heads in a series of coin flips, successful conversions, or defective items in a fixed-size sample of independent items.',
    tags: ['Fixed trials', 'Success counts'],
    formula: 'P(X = k) = C(n, k) pᵏ (1 − p)ⁿ⁻ᵏ,  k = 0, …, n',
    params: [
      param('n', 'Number of trials', 'n', 20, 1, 100, 1),
      param('p', 'Success probability', 'p', 0.5, 0, 1, 0.01),
    ],
    density: binomialMass,
    cdf: (x, p) => (x >= p.n ? 1 : sumMass(x, p, binomialMass, p.n)),
    range: ({ n }) => [-1, n + 1],
    stats: ({ n, p }) => ({
      Mean: n * p,
      Variance: n * p * (1 - p),
      'Std. deviation': Math.sqrt(n * p * (1 - p)),
      Mode:
        Number.isInteger((n + 1) * p) && p > 0 && p < 1
          ? `${(n + 1) * p - 1}, ${(n + 1) * p}`
          : Math.min(n, Math.floor((n + 1) * p)),
      Support: `{0, …, ${n}}`,
      Skewness:
        p === 0 || p === 1
          ? 'Undefined'
          : (1 - 2 * p) / Math.sqrt(n * p * (1 - p)),
    }),
    sample: ({ n, p }, rng) => {
      let k = 0;
      for (let i = 0; i < n; i++) if (rng() < p) k++;
      return k;
    },
    source: 'i',
  },
  {
    id: 'poisson',
    name: 'Poisson',
    alias: 'Event-count distribution',
    type: 'Discrete',
    color: '#b578a3',
    notation: 'Pois(λ)',
    description:
      'Count independent events in a fixed interval when they happen at a constant average rate.',
    use: 'Calls arriving per minute, defects per metre, or events observed in a fixed period under a constant-rate model.',
    tags: ['Event counts', 'Mean = variance'],
    formula: 'P(X = k) = exp(−λ) λᵏ / k!,  k = 0, 1, 2, …',
    params: [param('rate', 'Expected event count', 'λ', 5, 0.1, 50, 0.1)],
    density: poissonMass,
    cdf: (x, p) =>
      x > p.rate + 40 * Math.sqrt(p.rate) + 100
        ? 1
        : sumMass(x, p, poissonMass),
    range: ({ rate }) => [-1, Math.ceil(rate + 4 * Math.sqrt(rate) + 3)],
    stats: ({ rate }) => ({
      Mean: rate,
      Variance: rate,
      'Std. deviation': Math.sqrt(rate),
      Mode: Number.isInteger(rate) ? `${rate - 1}, ${rate}` : Math.floor(rate),
      Support: '{0, 1, 2, …}',
      Skewness: 1 / Math.sqrt(rate),
    }),
    sample: ({ rate }, rng) => {
      let k = 0,
        product = 1;
      const limit = Math.exp(-rate);
      do {
        k++;
        product *= 1 - rng();
      } while (product > limit);
      return k - 1;
    },
    source: 'j',
  },
];
distributions.push(...moreDistributions);
export const examplePoint = (d: Distribution, values: Parameters) =>
  d.exampleX
    ? d.exampleX(values)
    : d.type === 'Discrete'
      ? Math.floor(Number(d.stats(values).Mean))
      : Number(d.stats(values).Mean);
export const defaults = (d: Distribution) =>
  Object.fromEntries(d.params.map((p) => [p.key, p.value]));
export function validate(d: Distribution, values: Parameters) {
  for (const p of d.params) {
    const v = values[p.key];
    if (
      !Number.isFinite(v) ||
      v < p.min ||
      v > p.max ||
      ((p.integer || p.key === 'n') && !Number.isInteger(v))
    )
      return `${p.label} must be ${p.integer || p.key === 'n' ? 'an integer ' : ''}between ${p.min} and ${p.max}.`;
  }
  if (d.id === 'uniform' && values.a >= values.b)
    return 'Lower bound must be less than upper bound.';
  for (const c of d.constraints || []) {
    if (
      !(c.op === '<'
        ? values[c.left] < values[c.right]
        : values[c.left] <= values[c.right])
    )
      return c.message;
  }
  return '';
}
export function seededRandom(seed: string | number) {
  let state = 2166136261;
  for (const c of String(seed))
    state = Math.imul(state ^ c.charCodeAt(0), 16777619);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
