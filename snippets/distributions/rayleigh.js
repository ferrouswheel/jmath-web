// Rayleigh: Inverse transform: take the square root of a scaled exponential waiting time.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function rayleigh_pdf(x, sigma) {
  if (!(Number.isFinite(sigma) && sigma >= 0.1 && sigma <= 5)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return x < 0 ? 0 : x / (sigma * sigma) * Math.exp(-x * x / (2 * sigma * sigma));
}

function rayleigh_sample(sigma, rng = Math.random) {
  if (!(Number.isFinite(sigma) && sigma >= 0.1 && sigma <= 5)) throw new RangeError("Parameters outside explorer limits");
  return sigma * Math.sqrt(-2 * Math.log1p(-rng()));
}
