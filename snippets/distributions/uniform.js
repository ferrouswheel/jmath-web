// Uniform: Affine transform: stretch a uniform draw to the interval [a, b).
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function uniform_pdf(x, a, b) {
  if (!(Number.isFinite(a) && a >= -10 && a <= 9 && Number.isFinite(b) && b >= -9 && b <= 10 && a < b)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return x < a || x > b ? 0 : 1 / (b - a);
}

function uniform_sample(a, b, rng = Math.random) {
  if (!(Number.isFinite(a) && a >= -10 && a <= 9 && Number.isFinite(b) && b >= -9 && b <= 10 && a < b)) throw new RangeError("Parameters outside explorer limits");
  return a + (b - a) * rng();
}
