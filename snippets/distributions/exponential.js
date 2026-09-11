// Exponential: Inverse transform: apply −log(1 − U) / λ to a uniform draw.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function exponential_pdf(x, rate) {
  if (!(Number.isFinite(rate) && rate >= 0.1 && rate <= 10)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return x < 0 ? 0 : rate * Math.exp(-rate * x);
}

function exponential_sample(rate, rng = Math.random) {
  if (!(Number.isFinite(rate) && rate >= 0.1 && rate <= 10)) throw new RangeError("Parameters outside explorer limits");
  return -Math.log1p(-rng()) / rate;
}
