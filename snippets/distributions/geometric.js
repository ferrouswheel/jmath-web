// Geometric: Invert the geometric CDF to count failures before the first success (starting at zero).
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function geometric_pmf(x, p) {
  if (!(Number.isFinite(p) && p >= 0.05 && p <= 1)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (!Number.isInteger(x) || x < 0) return 0;
  if (p === 1) return x === 0 ? 1 : 0;
  return p * Math.exp(x * Math.log1p(-p));
}

function geometric_sample(p, rng = Math.random) {
  if (!(Number.isFinite(p) && p >= 0.05 && p <= 1)) throw new RangeError("Parameters outside explorer limits");
  if (p === 1) return 0;
  return Math.floor(Math.log1p(-rng()) / Math.log1p(-p));
}
