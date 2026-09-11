// Discrete Uniform: Scale and floor a uniform draw to choose an integer between a and b, inclusive.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function discrete_uniform_pmf(x, a, b) {
  if (!(Number.isFinite(a) && a >= -20 && a <= 19 && Number.isFinite(b) && b >= -19 && b <= 20 && Number.isInteger(a) && Number.isInteger(b) && a <= b)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return Number.isInteger(x) && x >= a && x <= b ? 1 / (b - a + 1) : 0;
}

function discrete_uniform_sample(a, b, rng = Math.random) {
  if (!(Number.isFinite(a) && a >= -20 && a <= 19 && Number.isFinite(b) && b >= -19 && b <= 20 && Number.isInteger(a) && Number.isInteger(b) && a <= b)) throw new RangeError("Parameters outside explorer limits");
  return a + Math.floor((b - a + 1) * rng());
}
