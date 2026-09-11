// These imports provide the exact reviewed source text to Vite and the Node test loader.
import source0 from '../../snippets/distributions/bernoulli.c?raw';
import source1 from '../../snippets/distributions/bernoulli.js?raw';
import source2 from '../../snippets/distributions/bernoulli.py?raw';
import source3 from '../../snippets/distributions/binomial.c?raw';
import source4 from '../../snippets/distributions/binomial.js?raw';
import source5 from '../../snippets/distributions/binomial.py?raw';
import source6 from '../../snippets/distributions/cauchy.c?raw';
import source7 from '../../snippets/distributions/cauchy.js?raw';
import source8 from '../../snippets/distributions/cauchy.py?raw';
import source9 from '../../snippets/distributions/discrete_uniform.c?raw';
import source10 from '../../snippets/distributions/discrete_uniform.js?raw';
import source11 from '../../snippets/distributions/discrete_uniform.py?raw';
import source12 from '../../snippets/distributions/exponential.c?raw';
import source13 from '../../snippets/distributions/exponential.js?raw';
import source14 from '../../snippets/distributions/exponential.py?raw';
import source15 from '../../snippets/distributions/geometric.c?raw';
import source16 from '../../snippets/distributions/geometric.js?raw';
import source17 from '../../snippets/distributions/geometric.py?raw';
import source18 from '../../snippets/distributions/laplace.c?raw';
import source19 from '../../snippets/distributions/laplace.js?raw';
import source20 from '../../snippets/distributions/laplace.py?raw';
import source21 from '../../snippets/distributions/logistic.c?raw';
import source22 from '../../snippets/distributions/logistic.js?raw';
import source23 from '../../snippets/distributions/logistic.py?raw';
import source24 from '../../snippets/distributions/lognormal.c?raw';
import source25 from '../../snippets/distributions/lognormal.js?raw';
import source26 from '../../snippets/distributions/lognormal.py?raw';
import source27 from '../../snippets/distributions/negative_binomial.c?raw';
import source28 from '../../snippets/distributions/negative_binomial.js?raw';
import source29 from '../../snippets/distributions/negative_binomial.py?raw';
import source30 from '../../snippets/distributions/normal.c?raw';
import source31 from '../../snippets/distributions/normal.js?raw';
import source32 from '../../snippets/distributions/normal.py?raw';
import source33 from '../../snippets/distributions/pareto.c?raw';
import source34 from '../../snippets/distributions/pareto.js?raw';
import source35 from '../../snippets/distributions/pareto.py?raw';
import source36 from '../../snippets/distributions/poisson.c?raw';
import source37 from '../../snippets/distributions/poisson.js?raw';
import source38 from '../../snippets/distributions/poisson.py?raw';
import source39 from '../../snippets/distributions/rayleigh.c?raw';
import source40 from '../../snippets/distributions/rayleigh.js?raw';
import source41 from '../../snippets/distributions/rayleigh.py?raw';
import source42 from '../../snippets/distributions/triangular.c?raw';
import source43 from '../../snippets/distributions/triangular.js?raw';
import source44 from '../../snippets/distributions/triangular.py?raw';
import source45 from '../../snippets/distributions/uniform.c?raw';
import source46 from '../../snippets/distributions/uniform.js?raw';
import source47 from '../../snippets/distributions/uniform.py?raw';
import source48 from '../../snippets/distributions/weibull.c?raw';
import source49 from '../../snippets/distributions/weibull.js?raw';
import source50 from '../../snippets/distributions/weibull.py?raw';
const sources: Record<string, string> = {
  'bernoulli/c': source0,
  'bernoulli/js': source1,
  'bernoulli/python': source2,
  'binomial/c': source3,
  'binomial/js': source4,
  'binomial/python': source5,
  'cauchy/c': source6,
  'cauchy/js': source7,
  'cauchy/python': source8,
  'discrete_uniform/c': source9,
  'discrete_uniform/js': source10,
  'discrete_uniform/python': source11,
  'exponential/c': source12,
  'exponential/js': source13,
  'exponential/python': source14,
  'geometric/c': source15,
  'geometric/js': source16,
  'geometric/python': source17,
  'laplace/c': source18,
  'laplace/js': source19,
  'laplace/python': source20,
  'logistic/c': source21,
  'logistic/js': source22,
  'logistic/python': source23,
  'lognormal/c': source24,
  'lognormal/js': source25,
  'lognormal/python': source26,
  'negative_binomial/c': source27,
  'negative_binomial/js': source28,
  'negative_binomial/python': source29,
  'normal/c': source30,
  'normal/js': source31,
  'normal/python': source32,
  'pareto/c': source33,
  'pareto/js': source34,
  'pareto/python': source35,
  'poisson/c': source36,
  'poisson/js': source37,
  'poisson/python': source38,
  'rayleigh/c': source39,
  'rayleigh/js': source40,
  'rayleigh/python': source41,
  'triangular/c': source42,
  'triangular/js': source43,
  'triangular/python': source44,
  'uniform/c': source45,
  'uniform/js': source46,
  'uniform/python': source47,
  'weibull/c': source48,
  'weibull/js': source49,
  'weibull/python': source50,
};
export function snippetFile(id: string, language: string): string {
  const source = sources[id + '/' + language];
  if (source === undefined) throw new RangeError('Unknown snippet');
  return source;
}
