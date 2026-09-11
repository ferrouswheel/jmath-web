import { examplePoint, validate } from './distributions.ts';
import { snippetFile } from './snippet-files/distributions.ts';
import type { Distribution, Parameters } from './types.ts';
export const languages = { js: 'JavaScript', python: 'Python', c: 'C' };
export const algorithms: Record<string, string> = {
  bernoulli: 'Threshold a uniform draw at p to produce a zero or one.',
  geometric:
    'Invert the geometric CDF to count failures before the first success (starting at zero).',
  negative_binomial:
    'Sum r geometric failure counts to get the failures before r successes.',
  discrete_uniform:
    'Scale and floor a uniform draw to choose an integer between a and b, inclusive.',
  lognormal:
    'Exponentiate a normal value generated with the Box–Muller transform.',
  laplace: 'Invert the two branches of the Laplace CDF using a uniform draw.',
  logistic:
    'Apply the logit transform log(U) − log(1 − U), then shift and scale.',
  cauchy:
    'Apply the tangent quantile transform. The population mean and variance are undefined.',
  weibull: 'Inverse transform: scale a power of an exponential waiting time.',
  rayleigh:
    'Inverse transform: take the square root of a scaled exponential waiting time.',
  pareto:
    'Inverse transform: raise 1 − U to a negative power and multiply by the minimum.',
  triangular: 'Invert the appropriate quadratic branch of the triangular CDF.',
  normal:
    'Box–Muller transform: turn two independent uniform draws into a normal sample.',
  uniform: 'Affine transform: stretch a uniform draw to the interval [a, b).',
  exponential: 'Inverse transform: apply −log(1 − U) / λ to a uniform draw.',
  binomial:
    'Bernoulli trials: make n independent draws and count those below p.',
  poisson:
    'Product method: multiply uniform draws until the product falls below exp(−λ).',
};
export function snippetSource(
  d: Distribution,
  lang: string,
  values: Parameters,
  { example = true } = {},
) {
  const error = validate(d, values);
  if (error) throw new RangeError(error);
  const source = snippetFile(d.id, lang);
  const args = d.params.map((p) => String(values[p.key])).join(', ');
  const fn = d.id + (d.type === 'Discrete' ? '_pmf' : '_pdf'),
    sample = d.id + '_sample',
    x = examplePoint(d, values);
  if (lang === 'js')
    return (
      source +
      (example
        ? `\n// Current explorer parameters. Samples use the runtime RNG, not the page seed.\nconsole.log(${fn}(${x}, ${args}));\nfor (let i = 0; i < 5; i++) console.log(${sample}(${args}));\n`
        : '')
    );
  if (lang === 'python')
    return (
      source +
      (example
        ? `\n# Current explorer parameters. This seed is independent of the page seed.\nif __name__ == "__main__":\n    random.seed(42)\n    print(${fn}(${x}, ${args}))\n    for _ in range(5):\n        print(${sample}(${args}))\n`
        : '')
    );
  return (
    source +
    (example
      ? `\nint main(void) {\n    // This seed is independent of the page seed; rand() varies by C runtime.\n    srand(42);\n    printf("%.17g\\n", ${fn}(${x}, ${args}));\n    for (int i = 0; i < 5; i++)\n        printf("%.17g\\n", ${sample}(${args}, uniform01));\n    return 0;\n}\n`
      : '')
  );
}
