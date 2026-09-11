// Bernoulli: Threshold a uniform draw at p to produce a zero or one.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function bernoulli_pmf(x, p) {
  if (!(Number.isFinite(p) && p >= 0 && p <= 1)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return x === 0 ? 1 - p : x === 1 ? p : 0;
}

function bernoulli_sample(p, rng = Math.random) {
  if (!(Number.isFinite(p) && p >= 0 && p <= 1)) throw new RangeError("Parameters outside explorer limits");
  return rng() < p ? 1 : 0;
}
