import { distributionMetadata } from './distribution-metadata.ts';
import type { Distribution, Parameters, RandomSource } from './types.ts';
const normal = (rng: RandomSource) =>
  Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
// Reject the zero endpoint for inverse transforms whose quantile diverges there.
const openUniform = (rng: RandomSource) => {
  let u;
  do {
    u = rng();
  } while (u === 0);
  return u;
};
const geometric = (p: number, rng: RandomSource) =>
  p === 1 ? 0 : Math.floor(Math.log1p(-rng()) / Math.log1p(-p));
const logisticCdf = (z: number) =>
  z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z));
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
// Lanczos approximation for positive gamma arguments used by Weibull moments.
export function gamma(z: number) {
  const coefficients = [
    676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012,
    9.9843695780195716e-6, 1.5056327351493116e-7,
  ];
  z -= 1;
  let x = 0.99999999999980993;
  coefficients.forEach((c, i) => {
    x += c / (z + i + 1);
  });
  const t = z + 7.5;
  return Math.sqrt(2 * Math.PI) * t ** (z + 0.5) * Math.exp(-t) * x;
}
const negMass = (x: number, { r, p }: Parameters) => {
  if (!Number.isInteger(x) || x < 0) return 0;
  if (p === 1) return x === 0 ? 1 : 0;
  // r is a bounded positive integer: compute only r - 1 log factors.
  let combination = 0;
  for (let i = 1; i < r; i++) combination += Math.log((x + i) / i);
  return Math.exp(combination + r * Math.log(p) + x * Math.log1p(-p));
};
const negCdf = (x: number, { r, p }: Parameters) => {
  if (x < 0) return 0;
  if (p === 1) return 1;
  // P(failures <= k) = P(Bin(k+r,p) >= r). Sum the short complement.
  const n = Math.floor(x) + r;
  let term = Math.exp(n * Math.log1p(-p)),
    sum = term;
  for (let j = 1; j < r; j++) {
    term *= (((n - j + 1) / j) * p) / (1 - p);
    sum += term;
  }
  return Math.max(0, Math.min(1, 1 - sum));
};
export const moreDistributions: Distribution[] = [
  {
    ...distributionMetadata('bernoulli'),
    density: (x, { p }) => (x === 0 ? 1 - p : x === 1 ? p : 0),
    cdf: (x, { p }) => (x < 0 ? 0 : x < 1 ? 1 - p : 1),
    range: () => [-0.5, 1.5],
    stats: ({ p }) => ({
      Mean: p,
      Variance: p * (1 - p),
      'Std. deviation': Math.sqrt(p * (1 - p)),
      Mode: p === 0.5 ? '0, 1' : p < 0.5 ? 0 : 1,
      Support: '{0, 1}',
      Skewness:
        p === 0 || p === 1 ? 'Undefined' : (1 - 2 * p) / Math.sqrt(p * (1 - p)),
    }),
    sample: ({ p }, rng) => (rng() < p ? 1 : 0),
  },
  {
    ...distributionMetadata('geometric'),
    density: (x, { p }) =>
      !Number.isInteger(x) || x < 0
        ? 0
        : p === 1
          ? x === 0
            ? 1
            : 0
          : p * Math.exp(x * Math.log1p(-p)),
    cdf: (x, { p }) =>
      x < 0
        ? 0
        : p === 1
          ? 1
          : -Math.expm1((Math.floor(x) + 1) * Math.log1p(-p)),
    range: ({ p }) => [
      -0.5,
      p === 1
        ? 1.5
        : Math.max(2, Math.ceil(Math.log(0.001) / Math.log1p(-p))) + 0.5,
    ],
    stats: ({ p }) => ({
      Mean: (1 - p) / p,
      Variance: (1 - p) / p ** 2,
      'Std. deviation': Math.sqrt(1 - p) / p,
      Mode: 0,
      Support: '{0, 1, 2, …}',
      Skewness: p === 1 ? 'Undefined' : (2 - p) / Math.sqrt(1 - p),
    }),
    sample: ({ p }, rng) => geometric(p, rng),
  },
  {
    ...distributionMetadata('negative_binomial'),
    density: negMass,
    cdf: negCdf,
    range: ({ r, p }) => [
      -0.5,
      Math.max(
        2,
        Math.ceil((r * (1 - p)) / p + (6 * Math.sqrt(r * (1 - p))) / p),
      ) + 0.5,
    ],
    stats: ({ r, p }) => ({
      Mean: (r * (1 - p)) / p,
      Variance: (r * (1 - p)) / p ** 2,
      'Std. deviation': Math.sqrt(r * (1 - p)) / p,
      Mode:
        r > 1 && p < 1 && Number.isInteger(((r - 1) * (1 - p)) / p)
          ? `${((r - 1) * (1 - p)) / p - 1}, ${((r - 1) * (1 - p)) / p}`
          : r > 1
            ? Math.floor(((r - 1) * (1 - p)) / p)
            : 0,
      Support: '{0, 1, 2, …}',
      Skewness: p === 1 ? 'Undefined' : (2 - p) / Math.sqrt(r * (1 - p)),
    }),
    sample: ({ r, p }, rng) => {
      let s = 0;
      for (let i = 0; i < r; i++) s += geometric(p, rng);
      return s;
    },
  },
  {
    ...distributionMetadata('discrete_uniform'),
    density: (x, { a, b }) =>
      Number.isInteger(x) && x >= a && x <= b ? 1 / (b - a + 1) : 0,
    cdf: (x, { a, b }) =>
      Math.max(0, Math.min(1, (Math.floor(x) - a + 1) / (b - a + 1))),
    range: ({ a, b }) => [a - 0.5, b + 0.5],
    stats: ({ a, b }) => ({
      Mean: (a + b) / 2,
      Variance: ((b - a + 1) ** 2 - 1) / 12,
      'Std. deviation': Math.sqrt(((b - a + 1) ** 2 - 1) / 12),
      Median: (a + b) / 2,
      Support: `{${a}, …, ${b}}`,
      Mode: 'Every support value',
    }),
    sample: ({ a, b }, rng) => a + Math.floor((b - a + 1) * rng()),
  },
  {
    ...distributionMetadata('lognormal'),
    density: (x, { mu, sigma }) =>
      x <= 0
        ? 0
        : Math.exp(-0.5 * ((Math.log(x) - mu) / sigma) ** 2) /
          (x * sigma * Math.sqrt(2 * Math.PI)),
    cdf: (x, { mu, sigma }) =>
      x <= 0 ? 0 : normalCdf((Math.log(x) - mu) / sigma),
    range: ({ mu, sigma }) => [0, Math.exp(mu + 3 * sigma)],
    plotKnots: ({ mu, sigma }) =>
      Array.from({ length: 161 }, (_, i) =>
        Math.exp(mu + sigma * (-8 + (11 * i) / 160)),
      ),
    stats: ({ mu, sigma }) => ({
      Mean: Math.exp(mu + (sigma * sigma) / 2),
      Variance: Math.expm1(sigma * sigma) * Math.exp(2 * mu + sigma * sigma),
      'Std. deviation': Math.sqrt(
        Math.expm1(sigma * sigma) * Math.exp(2 * mu + sigma * sigma),
      ),
      Median: Math.exp(mu),
      Support: '(0, ∞)',
      Mode: Math.exp(mu - sigma * sigma),
    }),
    sample: ({ mu, sigma }, rng) => Math.exp(mu + sigma * normal(rng)),
  },
  {
    ...distributionMetadata('laplace'),
    density: (x, { mu, scale }) =>
      Math.exp(-Math.abs(x - mu) / scale) / (2 * scale),
    cdf: (x, { mu, scale }) =>
      x < mu
        ? 0.5 * Math.exp((x - mu) / scale)
        : 1 - 0.5 * Math.exp(-(x - mu) / scale),
    range: ({ mu, scale }) => [mu - 7 * scale, mu + 7 * scale],
    stats: ({ mu, scale }) => ({
      Mean: mu,
      Variance: 2 * scale ** 2,
      'Std. deviation': Math.SQRT2 * scale,
      Median: mu,
      Support: '(−∞, ∞)',
      Skewness: 0,
    }),
    sample: ({ mu, scale }, rng) => {
      const u = openUniform(rng);
      return u < 0.5
        ? mu + scale * Math.log(2 * u)
        : mu - scale * Math.log(2 * (1 - u));
    },
  },
  {
    ...distributionMetadata('logistic'),
    density: (x, { mu, scale }) => {
      const t = Math.exp(-Math.abs((x - mu) / scale));
      return t / (scale * (1 + t) ** 2);
    },
    cdf: (x, { mu, scale }) => logisticCdf((x - mu) / scale),
    range: ({ mu, scale }) => [mu - 8 * scale, mu + 8 * scale],
    stats: ({ mu, scale }) => ({
      Mean: mu,
      Variance: (Math.PI ** 2 * scale ** 2) / 3,
      'Std. deviation': (Math.PI * scale) / Math.sqrt(3),
      Median: mu,
      Support: '(−∞, ∞)',
      Skewness: 0,
    }),
    sample: ({ mu, scale }, rng) => {
      const u = openUniform(rng);
      return mu + scale * (Math.log(u) - Math.log1p(-u));
    },
  },
  {
    ...distributionMetadata('cauchy'),
    density: (x, { center, scale }) =>
      1 / (Math.PI * scale * (1 + ((x - center) / scale) ** 2)),
    cdf: (x, { center, scale }) =>
      0.5 + Math.atan((x - center) / scale) / Math.PI,
    range: ({ center, scale }) => [center - 12 * scale, center + 12 * scale],
    stats: ({ center }) => ({
      Mean: 'Undefined',
      Variance: 'Undefined',
      'Std. deviation': 'Undefined',
      Median: center,
      Support: '(−∞, ∞)',
      Mode: center,
    }),
    exampleX: ({ center }) => center,
    sample: ({ center, scale }, rng) =>
      center + scale * Math.tan(Math.PI * (openUniform(rng) - 0.5)),
  },
  {
    ...distributionMetadata('weibull'),
    density: (x, { shape, scale }) =>
      x < 0
        ? 0
        : x === 0
          ? shape < 1
            ? Infinity
            : shape === 1
              ? 1 / scale
              : 0
          : (shape / scale) *
            (x / scale) ** (shape - 1) *
            Math.exp(-((x / scale) ** shape)),
    cdf: (x, { shape, scale }) =>
      x <= 0 ? 0 : -Math.expm1(-((x / scale) ** shape)),
    range: ({ shape, scale }) => [
      shape < 1 ? scale * (-Math.log(0.995)) ** (1 / shape) : 0,
      scale * (-Math.log(0.001)) ** (1 / shape),
    ],
    plotKnots: ({ shape, scale }) =>
      shape < 1
        ? Array.from(
            { length: 161 },
            (_, i) =>
              scale *
              (-Math.log1p(-(0.005 + (0.994 * i) / 160))) ** (1 / shape),
          )
        : [],
    stats: ({ shape, scale }) => {
      const a = gamma(1 + 1 / shape),
        v = scale ** 2 * (gamma(1 + 2 / shape) - a * a);
      return {
        Mean: scale * a,
        Variance: v,
        'Std. deviation': Math.sqrt(v),
        Median: scale * Math.LN2 ** (1 / shape),
        Support: '[0, ∞)',
        Mode: shape > 1 ? scale * ((shape - 1) / shape) ** (1 / shape) : 0,
      };
    },
    sample: ({ shape, scale }, rng) =>
      scale * (-Math.log1p(-rng())) ** (1 / shape),
  },
  {
    ...distributionMetadata('rayleigh'),
    density: (x, { sigma }) =>
      x < 0 ? 0 : (x / sigma ** 2) * Math.exp((-x * x) / (2 * sigma * sigma)),
    cdf: (x, { sigma }) =>
      x <= 0 ? 0 : -Math.expm1((-x * x) / (2 * sigma * sigma)),
    range: ({ sigma }) => [0, 4 * sigma],
    stats: ({ sigma }) => ({
      Mean: sigma * Math.sqrt(Math.PI / 2),
      Variance: ((4 - Math.PI) * sigma * sigma) / 2,
      'Std. deviation': sigma * Math.sqrt((4 - Math.PI) / 2),
      Median: sigma * Math.sqrt(2 * Math.LN2),
      Support: '[0, ∞)',
      Mode: sigma,
    }),
    sample: ({ sigma }, rng) => sigma * Math.sqrt(-2 * Math.log1p(-rng())),
  },
  {
    ...distributionMetadata('pareto'),
    density: (x, { minimum, alpha }) =>
      x < minimum ? 0 : (alpha / minimum) * (minimum / x) ** (alpha + 1),
    cdf: (x, { minimum, alpha }) =>
      x < minimum ? 0 : -Math.expm1(alpha * Math.log(minimum / x)),
    range: ({ minimum, alpha }) => [minimum, minimum * 100 ** (1 / alpha)],
    plotKnots: ({ minimum, alpha }) =>
      Array.from(
        { length: 161 },
        (_, i) => minimum * 100 ** (i / (160 * alpha)),
      ),
    stats: ({ minimum, alpha }) => ({
      Mean: alpha > 1 ? (alpha * minimum) / (alpha - 1) : '∞',
      Variance:
        alpha > 2
          ? (minimum ** 2 * alpha) / ((alpha - 1) ** 2 * (alpha - 2))
          : alpha > 1
            ? '∞'
            : 'Undefined',
      'Std. deviation':
        alpha > 2
          ? minimum * Math.sqrt(alpha / ((alpha - 1) ** 2 * (alpha - 2)))
          : alpha > 1
            ? '∞'
            : 'Undefined',
      Median: minimum * 2 ** (1 / alpha),
      Support: `[${minimum}, ∞)`,
      Mode: minimum,
    }),
    exampleX: ({ minimum, alpha }) => minimum * 2 ** (1 / alpha),
    sample: ({ minimum, alpha }, rng) => minimum / (1 - rng()) ** (1 / alpha),
  },
  {
    ...distributionMetadata('triangular'),
    density: (x, { a, b, c }) =>
      x < a || x > b
        ? 0
        : x <= c
          ? (2 * (x - a)) / ((b - a) * (c - a))
          : (2 * (b - x)) / ((b - a) * (b - c)),
    cdf: (x, { a, b, c }) =>
      x <= a
        ? 0
        : x >= b
          ? 1
          : x <= c
            ? (x - a) ** 2 / ((b - a) * (c - a))
            : 1 - (b - x) ** 2 / ((b - a) * (b - c)),
    range: ({ a, b }) => [a, b],
    plotKnots: ({ c }) => [c],
    stats: ({ a, b, c }) => ({
      Mean: (a + b + c) / 3,
      Variance: ((a - b) ** 2 + (a - c) ** 2 + (b - c) ** 2) / 36,
      'Std. deviation': Math.sqrt(
        ((a - b) ** 2 + (a - c) ** 2 + (b - c) ** 2) / 36,
      ),
      Median:
        c >= (a + b) / 2
          ? a + Math.sqrt(((b - a) * (c - a)) / 2)
          : b - Math.sqrt(((b - a) * (b - c)) / 2),
      Support: `[${a}, ${b}]`,
      Mode: c,
    }),
    sample: ({ a, b, c }, rng) => {
      const u = rng();
      return u < (c - a) / (b - a)
        ? a + Math.sqrt(u * (b - a) * (c - a))
        : b - Math.sqrt((1 - u) * (b - a) * (b - c));
    },
  },
];
