import {
  distributionMetadata,
  validateDistributionRegistry,
} from './distribution-metadata.ts';
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
export const distributions: Distribution[] = [
  {
    ...distributionMetadata('normal'),
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
  },
  {
    ...distributionMetadata('uniform'),
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
  },
  {
    ...distributionMetadata('exponential'),
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
  },
  {
    ...distributionMetadata('binomial'),
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
  },
  {
    ...distributionMetadata('poisson'),
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
  },
];
distributions.push(...moreDistributions);
validateDistributionRegistry(distributions);
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
