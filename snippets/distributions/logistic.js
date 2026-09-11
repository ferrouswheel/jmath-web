// Logistic: Apply the logit transform log(U) − log(1 − U), then shift and scale.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function logistic_pdf(x, mu, scale) {
  if (!(Number.isFinite(mu) && mu >= -10 && mu <= 10 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  const t = Math.exp(-Math.abs((x - mu) / scale));
  return t / (scale * (1 + t) ** 2);
}

function logistic_sample(mu, scale, rng = Math.random) {
  if (!(Number.isFinite(mu) && mu >= -10 && mu <= 10 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  let u;
  do { u = rng(); } while (u === 0);
  return mu + scale * (Math.log(u) - Math.log1p(-u));
}
