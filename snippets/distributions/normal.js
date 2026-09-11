// Normal: Box–Muller transform: turn two independent uniform draws into a normal sample.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function normal_pdf(x, mu, sigma) {
  if (!(Number.isFinite(mu) && mu >= -10 && mu <= 10 && Number.isFinite(sigma) && sigma >= 0.1 && sigma <= 5)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}

function normal_sample(mu, sigma, rng = Math.random) {
  if (!(Number.isFinite(mu) && mu >= -10 && mu <= 10 && Number.isFinite(sigma) && sigma >= 0.1 && sigma <= 5)) throw new RangeError("Parameters outside explorer limits");
  const u = 1 - rng(); // (0, 1], so log never receives zero.
  const v = rng();
  return mu + sigma * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
