export interface ExperimentSettings {
  count: number;
  sides?: number;
  p?: number;
}
export interface Experiment {
  kind: string;
  settings: ExperimentSettings;
  theory: ReturnType<typeof theoreticalExperiment>;
  seed: string;
  rng: () => number;
  frequencies: number[];
  samples: number[];
  total: number;
  sum: number;
  sumSquares: number;
  last: number[] | null;
}
import { distributions, seededRandom } from './distributions.ts';

export const MAX_TRIALS = 100000;
export const experimentDefaults = (kind: string) =>
  kind === 'dice' ? { count: 2, sides: 6 } : { count: 1, p: 0.5 };
export function validateExperiment(kind: string, settings: ExperimentSettings) {
  if (!['dice', 'coins'].includes(kind)) return 'Unknown experiment.';
  const max = kind === 'dice' ? 6 : 100;
  if (
    !Number.isInteger(settings.count) ||
    settings.count < 1 ||
    settings.count > max
  )
    return `Choose between 1 and ${max} ${kind === 'dice' ? 'dice' : 'coins'} per trial.`;
  if (
    kind === 'dice' &&
    (!Number.isInteger(settings.sides!) ||
      settings.sides! < 2 ||
      settings.sides! > 20)
  )
    return 'Each die must have 2–20 sides.';
  if (
    kind === 'coins' &&
    (!Number.isFinite(settings.p!) || settings.p! < 0 || settings.p! > 1)
  )
    return 'Heads probability must be between 0 and 1.';
  return '';
}
export function theoreticalExperiment(
  kind: string,
  settings: ExperimentSettings,
) {
  const error = validateExperiment(kind, settings);
  if (error) throw new RangeError(error);
  const count = settings.count,
    sides = settings.sides!,
    p = settings.p!;
  if (kind === 'coins') {
    const distribution = distributions.find(
      (d) => d.id === (count === 1 ? 'bernoulli' : 'binomial'),
    )!;
    return {
      outcomes: Array.from({ length: count + 1 }, (_, k) => k),
      probabilities: Array.from({ length: count + 1 }, (_, k) =>
        distribution.density(k, { n: count, p }),
      ),
      mean: count * p,
      variance: count * p * (1 - p),
      name: count === 1 ? `Bernoulli(${p})` : `Binomial(${count}, ${p})`,
      relation:
        count === 1
          ? 'Heads = 1 and tails = 0. Each trial is a Bernoulli outcome.'
          : `One trial flips ${count} independent coins. The number of heads follows a Binomial distribution.`,
      href:
        count === 1
          ? `/distributions/bernoulli?p=${p}`
          : `/distributions/binomial?n=${count}&p=${p}`,
      linkText: 'Explore this distribution ↗',
    };
  }
  // Repeated convolution: add the mass of each possible face to each prior sum.
  let mass = [1];
  for (let die = 0; die < count; die++) {
    const next = Array(mass.length + sides).fill(0);
    for (let sum = 0; sum < mass.length; sum++)
      for (let face = 1; face <= sides; face++)
        next[sum + face] += mass[sum] / sides;
    mass = next;
  }
  return {
    outcomes: Array.from(
      { length: count * sides - count + 1 },
      (_, i) => count + i,
    ),
    probabilities: mass.slice(count),
    mean: (count * (sides + 1)) / 2,
    variance: (count * (sides * sides - 1)) / 12,
    name:
      count === 1
        ? `Discrete Uniform(1, ${sides})`
        : `Sum of ${count} independent dice`,
    relation:
      count === 1
        ? `Each integer from 1 to ${sides} is equally likely.`
        : `Each die is Discrete Uniform(1, ${sides}). The total uses ${count}-fold convolution: sums with more combinations have more probability.`,
    href: `/distributions/discrete-uniform?a=1&b=${sides}`,
    linkText:
      count === 1
        ? 'Explore this distribution ↗'
        : 'Explore the distribution of one die ↗',
  };
}
export function createExperiment(
  kind: string,
  settings: ExperimentSettings,
  seed = '',
): Experiment {
  const theory = theoreticalExperiment(kind, settings);
  return {
    kind,
    settings: { ...settings },
    theory,
    seed,
    rng: seed === '' ? Math.random : seededRandom(seed),
    frequencies: theory.outcomes.map(() => 0),
    samples: [],
    total: 0,
    sum: 0,
    sumSquares: 0,
    last: null,
  };
}
export function addTrials(experiment: Experiment, n: number) {
  if (!Number.isInteger(n) || n < 1 || experiment.total + n > MAX_TRIALS)
    throw new RangeError(
      `Use a whole number of trials, up to ${MAX_TRIALS.toLocaleString()} total. Reset to start a new experiment.`,
    );
  const { settings, rng, kind } = experiment;
  for (let i = 0; i < n; i++) {
    const items = Array.from({ length: settings.count }, () =>
      kind === 'dice'
        ? 1 + Math.floor(rng() * settings.sides!)
        : rng() < settings.p!
          ? 1
          : 0,
    );
    const value = items.reduce((sum, item) => sum + item, 0);
    experiment.last = items;
    experiment.samples.push(value);
    experiment.frequencies[value - experiment.theory.outcomes[0]]++;
    experiment.total++;
    experiment.sum += value;
    experiment.sumSquares += value * value;
  }
  return experiment;
}
export function experimentSummary(experiment: Experiment) {
  const { total, sum, sumSquares, frequencies, theory } = experiment;
  if (!total) return { mean: null, variance: null, distance: null };
  const mean = sum / total;
  return {
    mean,
    variance: Math.max(0, sumSquares / total - mean * mean),
    distance:
      frequencies.reduce(
        (s, count: number, i: number) =>
          s + Math.abs(count / total - theory.probabilities[i]),
        0,
      ) / 2,
  };
}
export function experimentCsv(experiment: Experiment) {
  const { kind, settings, frequencies, total, theory } = experiment;
  const columns = [
    'outcome',
    'observed_count',
    'observed_probability',
    'theoretical_probability',
    'expected_count',
    'trials',
    'tool',
    'items_per_trial',
    'sides',
    'heads_probability',
  ];
  return (
    columns.join(',') +
    '\n' +
    theory.outcomes
      .map((value, i: number) =>
        [
          value,
          frequencies[i],
          total ? frequencies[i] / total : 0,
          theory.probabilities[i],
          total * theory.probabilities[i],
          total,
          kind,
          settings.count,
          settings.sides! ?? '',
          settings.p! ?? '',
        ].join(','),
      )
      .join('\n')
  );
}
