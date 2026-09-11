// Triangular: Invert the appropriate quadratic branch of the triangular CDF.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function triangular_pdf(x, a, c, b) {
  if (!(Number.isFinite(a) && a >= -10 && a <= 9 && Number.isFinite(c) && c >= -9.9 && c <= 9.9 && Number.isFinite(b) && b >= -9 && b <= 10 && a < c && c < b)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (x < a || x > b) return 0;
  return x <= c ? 2 * (x - a) / ((b - a) * (c - a)) : 2 * (b - x) / ((b - a) * (b - c));
}

function triangular_sample(a, c, b, rng = Math.random) {
  if (!(Number.isFinite(a) && a >= -10 && a <= 9 && Number.isFinite(c) && c >= -9.9 && c <= 9.9 && Number.isFinite(b) && b >= -9 && b <= 10 && a < c && c < b)) throw new RangeError("Parameters outside explorer limits");
  const u = rng();
  return u < (c - a) / (b - a)
    ? a + Math.sqrt(u * (b - a) * (c - a))
    : b - Math.sqrt((1 - u) * (b - a) * (b - c));
}
