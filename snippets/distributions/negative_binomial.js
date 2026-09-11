// Negative Binomial: Sum r geometric failure counts to get the failures before r successes.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function negative_binomial_pmf(x, r, p) {
  if (!(Number.isFinite(r) && r >= 1 && r <= 30 && Number.isFinite(p) && p >= 0.1 && p <= 1 && Number.isInteger(r))) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (!Number.isInteger(x) || x < 0) return 0;
  if (p === 1) return x === 0 ? 1 : 0;
  let logChoose = 0;
  for (let i = 1; i < r; i++) logChoose += Math.log((x + i) / i);
  return Math.exp(logChoose + r * Math.log(p) + x * Math.log1p(-p));
}

function negative_binomial_sample(r, p, rng = Math.random) {
  if (!(Number.isFinite(r) && r >= 1 && r <= 30 && Number.isFinite(p) && p >= 0.1 && p <= 1 && Number.isInteger(r))) throw new RangeError("Parameters outside explorer limits");
  if (p === 1) return 0;
  let failures = 0;
  for (let i = 0; i < r; i++)
    failures += Math.floor(Math.log1p(-rng()) / Math.log1p(-p));
  return failures;
}
