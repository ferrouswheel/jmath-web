// Cauchy: Apply the tangent quantile transform. The population mean and variance are undefined.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function cauchy_pdf(x, center, scale) {
  if (!(Number.isFinite(center) && center >= -10 && center <= 10 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  const z = (x - center) / scale;
  return 1 / (Math.PI * scale * (1 + z * z));
}

function cauchy_sample(center, scale, rng = Math.random) {
  if (!(Number.isFinite(center) && center >= -10 && center <= 10 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  let u;
  do { u = rng(); } while (u === 0); // Quantile endpoints are infinite.
  return center + scale * Math.tan(Math.PI * (u - 0.5));
}
