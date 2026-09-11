// Binomial: Bernoulli trials: make n independent draws and count those below p.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function binomial_pmf(x, n, p) {
  if (!(Number.isFinite(n) && n >= 1 && n <= 100 && Number.isFinite(p) && p >= 0 && p <= 1 && Number.isInteger(n))) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (!Number.isInteger(x) || x < 0 || x > n) return 0;
  if (p === 0) return x === 0 ? 1 : 0;
  if (p === 1) return x === n ? 1 : 0;
  // Compute log(C(n, x)) to avoid large factorials.
  const k = Math.min(x, n - x);
  let logChoose = 0;
  for (let i = 1; i <= k; i++) logChoose += Math.log((n - i + 1) / i);
  return Math.exp(logChoose + x * Math.log(p) + (n - x) * Math.log1p(-p));
}

function binomial_sample(n, p, rng = Math.random) {
  if (!(Number.isFinite(n) && n >= 1 && n <= 100 && Number.isFinite(p) && p >= 0 && p <= 1 && Number.isInteger(n))) throw new RangeError("Parameters outside explorer limits");
  let successes = 0;
  for (let i = 0; i < n; i++) {
    if (rng() < p) successes++;
  }
  return successes;
}
