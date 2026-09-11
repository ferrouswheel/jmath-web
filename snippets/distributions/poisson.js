// Poisson: Product method: multiply uniform draws until the product falls below exp(−λ).
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function poisson_pmf(x, rate) {
  if (!(Number.isFinite(rate) && rate >= 0.1 && rate <= 50)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  if (!Number.isInteger(x) || x < 0) return 0;
  let logFactorial = 0;
  for (let i = 2; i <= x; i++) logFactorial += Math.log(i);
  return Math.exp(x * Math.log(rate) - rate - logFactorial);
}

function poisson_sample(rate, rng = Math.random) {
  if (!(Number.isFinite(rate) && rate >= 0.1 && rate <= 50)) throw new RangeError("Parameters outside explorer limits");
  const limit = Math.exp(-rate);
  let product = 1, k = 0;
  do {
    k++;
    product *= 1 - rng();
  } while (product > limit);
  return k - 1;
}
