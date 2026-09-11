// Laplace: Invert the two branches of the Laplace CDF using a uniform draw.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function laplace_pdf(x, mu, scale) {
  if (!(Number.isFinite(mu) && mu >= -10 && mu <= 10 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return Math.exp(-Math.abs(x - mu) / scale) / (2 * scale);
}

function laplace_sample(mu, scale, rng = Math.random) {
  if (!(Number.isFinite(mu) && mu >= -10 && mu <= 10 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  let u;
  do { u = rng(); } while (u === 0); // Keep log arguments positive.
  return u < 0.5 ? mu + scale * Math.log(2 * u) : mu - scale * Math.log(2 * (1 - u));
}
