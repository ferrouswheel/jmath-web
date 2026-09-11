// Lognormal: Exponentiate a normal value generated with the Box–Muller transform.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function lognormal_pdf(x, mu, sigma) {
  if (!(Number.isFinite(mu) && mu >= -2 && mu <= 2 && Number.isFinite(sigma) && sigma >= 0.1 && sigma <= 2)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (x <= 0) return 0;
  const z = (Math.log(x) - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (x * sigma * Math.sqrt(2 * Math.PI));
}

function lognormal_sample(mu, sigma, rng = Math.random) {
  if (!(Number.isFinite(mu) && mu >= -2 && mu <= 2 && Number.isFinite(sigma) && sigma >= 0.1 && sigma <= 2)) throw new RangeError("Parameters outside explorer limits");
  const z = Math.sqrt(-2 * Math.log(1 - rng())) * Math.cos(2 * Math.PI * rng());
  return Math.exp(mu + sigma * z);
}
