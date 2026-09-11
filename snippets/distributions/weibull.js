// Weibull: Inverse transform: scale a power of an exponential waiting time.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function weibull_pdf(x, shape, scale) {
  if (!(Number.isFinite(shape) && shape >= 0.5 && shape <= 5 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (x < 0) return 0;
  if (x === 0) return shape < 1 ? Infinity : shape === 1 ? 1 / scale : 0;
  return (shape / scale) * (x / scale) ** (shape - 1) * Math.exp(-((x / scale) ** shape));
}

function weibull_sample(shape, scale, rng = Math.random) {
  if (!(Number.isFinite(shape) && shape >= 0.5 && shape <= 5 && Number.isFinite(scale) && scale >= 0.1 && scale <= 5)) throw new RangeError("Parameters outside explorer limits");
  return scale * (-Math.log1p(-rng())) ** (1 / shape);
}
