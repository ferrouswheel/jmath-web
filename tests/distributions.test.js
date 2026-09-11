import test from 'node:test';
import assert from 'node:assert/strict';
import { distributions, defaults, validate, seededRandom } from '../src/distributions.js';
const near = (actual, expected, tol = 1e-6) => assert.ok(Math.abs(actual - expected) < tol, `${actual} ≠ ${expected}`);
const get = id => distributions.find(d => d.id === id);
test('known density and CDF reference values', () => {
  near(get('normal').density(0, { mu: 0, sigma: 1 }), 1 / Math.sqrt(2 * Math.PI));
  near(get('normal').cdf(1.96, { mu: 0, sigma: 1 }), 0.9750021);
  near(get('uniform').cdf(3, { a: 2, b: 6 }), 0.25);
  near(get('exponential').cdf(2, { rate: 0.5 }), 1 - Math.exp(-1));
  near(get('binomial').density(5, { n: 10, p: 0.5 }), 0.24609375);
  near(get('binomial').cdf(5, { n: 10, p: 0.5 }), 0.623046875);
  near(get('poisson').density(0, { rate: 5 }), Math.exp(-5));
  near(get('poisson').cdf(2, { rate: 1 }), 2.5 / Math.E);
});
test('densities normalize and CDFs are monotone', () => {
  for (const d of distributions) {
    const p = defaults(d), [lo, hi] = d.range(p);
    if (d.type === 'Discrete') { let total = 0; for (let k = -100; k < 1000; k++) total += d.density(k, p); near(total, 1); }
    else { const count = 20000, step = (hi - lo) / count; let total = 0; for (let i = 0; i < count; i++) total += d.density(lo + (i + 0.5) * step, p) * step; near(total, d.cdf(hi, p) - d.cdf(lo, p), .003); }
    let previous = 0;
    for (let i = 0; i <= 100; i++) { const v = d.cdf(lo + (hi - lo) * i / 100, p); assert.ok(v >= previous - 1e-12 && v <= 1); previous = v; }
  }
});
test('edge cases and parameter validation', () => {
  const b = get('binomial');
  near(b.density(0, { n: 100, p: 0 }), 1); near(b.density(100, { n: 100, p: 1 }), 1);
  near(b.density(1.5, { n: 10, p: .5 }), 0); near(b.cdf(-1, { n: 10, p: .5 }), 0);
  near(get('normal').cdf(-100, { mu: 0, sigma: 1 }), 0);
  near(get('normal').cdf(100, { mu: 0, sigma: 1 }), 1);
  assert.ok(validate(get('uniform'), { a: 2, b: 1 }));
  assert.ok(validate(get('normal'), { mu: 0, sigma: 0 }));
  assert.ok(validate(b, { n: 1.5, p: .5 }));
  for (const d of distributions) assert.equal(validate(d, defaults(d)), '');
});
test('seeded samples repeat and match theoretical moments', () => {
  for (const d of distributions) {
    const p = defaults(d), a = seededRandom('test'), b = seededRandom('test');
    const samples = Array.from({ length: 30000 }, () => d.sample(p, a));
    assert.deepEqual(samples.slice(0, 100), Array.from({ length: 100 }, () => d.sample(p, b)));
    assert.ok(samples.every(Number.isFinite));
    if (d.type === 'Discrete') assert.ok(samples.every(Number.isInteger));
    const mean = samples.reduce((s, x) => s + x, 0) / samples.length;
    const variance = samples.reduce((s, x) => s + (x - mean) ** 2, 0) / samples.length;
    const expected = d.stats(p);
    if (Number.isFinite(expected.Mean) && Number.isFinite(expected.Variance)) {
      near(mean, expected.Mean, Math.max(1e-9, 0.05 * Math.sqrt(expected.Variance)));
      near(variance, expected.Variance, Math.max(1e-9, 0.05 * expected.Variance));
    }
    // CDF checks also apply when the mean and variance do not exist.
    const [lo, hi] = d.range(p);
    for (let i = 1; i < 4; i++) {
      const x = lo + (hi-lo)*i/4;
      near(samples.filter(v => v <= x).length / samples.length, d.cdf(x,p), .02);
    }
  }
});

test('new distribution reference values and parameter conventions', () => {
  assert.equal(distributions.length, 17);
  assert.equal(new Set(distributions.map(d=>d.id)).size, 17);
  near(get('bernoulli').cdf(.5,{p:.3}), .7);
  near(get('geometric').density(2,{p:.5}), .125);
  near(get('geometric').cdf(2,{p:.5}), .875);
  near(get('negative_binomial').density(3,{r:2,p:.5}), .125);
  near(get('negative_binomial').cdf(3,{r:2,p:.5}), .8125);
  near(get('discrete_uniform').cdf(-2,{a:-3,b:2}), 1/3);
  near(get('lognormal').density(1,{mu:0,sigma:1}), 1/Math.sqrt(2*Math.PI));
  near(get('lognormal').cdf(1,{mu:0,sigma:1}), .5);
  near(get('laplace').density(0,{mu:0,scale:2}), .25);
  near(get('laplace').cdf(2,{mu:0,scale:2}), 1-.5/Math.E);
  near(get('logistic').density(0,{mu:0,scale:2}), .125);
  near(get('logistic').cdf(2*Math.log(3),{mu:0,scale:2}), .75);
  near(get('cauchy').density(0,{center:0,scale:1}), 1/Math.PI);
  near(get('cauchy').cdf(1,{center:0,scale:1}), .75);
  near(get('weibull').density(1,{shape:2,scale:1}), 2/Math.E);
  near(get('weibull').cdf(1,{shape:2,scale:1}), 1-1/Math.E);
  near(get('rayleigh').cdf(2,{sigma:1}), 1-Math.exp(-2));
  near(get('pareto').density(2,{minimum:1,alpha:2}), .25);
  near(get('pareto').cdf(2,{minimum:1,alpha:2}), .75);
  near(get('triangular').density(.5,{a:0,c:.5,b:1}), 2);
  near(get('triangular').cdf(.25,{a:0,c:.5,b:1}), .125);
  assert.equal(get('cauchy').stats({center:0,scale:1}).Mean,'Undefined');
  assert.equal(get('pareto').stats({minimum:1,alpha:1}).Mean,'∞');
  assert.equal(get('weibull').density(0,{shape:.5,scale:1}),Infinity);
  near(get('weibull').stats({shape:1,scale:2}).Mean,2);
  near(get('weibull').stats({shape:1,scale:2}).Variance,4);
  assert.ok(validate(get('negative_binomial'),{r:2.5,p:.5}));
  assert.ok(validate(get('discrete_uniform'),{a:.5,b:2}));
  assert.ok(validate(get('discrete_uniform'),{a:3,b:2}));
  assert.ok(validate(get('triangular'),{a:0,c:2,b:1}));
});

test('CDFs and plotting points remain valid at parameter limits', () => {
  for (const d of distributions) {
    for (const param of d.params) for (const v of [param.min,param.max]) {
      const p={...defaults(d),[param.key]:v};
      if(validate(d,p)) continue;
      const [lo,hi]=d.range(p);
      assert.ok(Number.isFinite(lo)&&Number.isFinite(hi)&&hi>lo,d.id);
      const xs=[lo,...(d.plotKnots?.(p)||[]),...Array.from({length:101},(_,i)=>lo+(hi-lo)*i/100)].sort((a,b)=>a-b);
      let previous=0;
      for(const x of xs) {
        const density=d.density(x,p),cdf=d.cdf(x,p);
        assert.ok(Number.isFinite(density)&&density>=0,`${d.id} density at ${x}`);
        assert.ok(Number.isFinite(cdf)&&cdf>=previous-1e-12&&cdf<=1,`${d.id} CDF at ${x}`);
        previous=cdf;
      }
      const rng=seededRandom('endpoints');
      for(let i=0;i<100;i++) assert.ok(Number.isFinite(d.sample(p,rng)),d.id);
    }
  }
});

test('inverse samplers handle a zero RNG draw without non-finite output', () => {
  for(const id of ['laplace','logistic','cauchy']) {
    let calls=0;
    const d=get(id), p=defaults(d);
    const sample=d.sample(p,()=>calls++===0?0:.5);
    near(sample,p.mu??p.center);
    assert.equal(calls,2);
  }
});
