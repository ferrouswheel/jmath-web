// Pareto: Inverse transform: raise 1 − U to a negative power and multiply by the minimum.
// Parameter limits match the explorer; finite x is required.
// The RNG must return independent uniform values in [0, 1).
// Standard-library math and uniform RNG only; no distribution libraries.

function pareto_pdf(x, minimum, alpha) {
  if (!(Number.isFinite(minimum) && minimum >= 0.1 && minimum <= 5 && Number.isFinite(alpha) && alpha >= 0.5 && alpha <= 10)) throw new RangeError("Parameters outside explorer limits");
  if (!Number.isFinite(x)) throw new RangeError("x must be finite");
  return x < minimum ? 0 : alpha / minimum * (minimum / x) ** (alpha + 1);
}

function pareto_sample(minimum, alpha, rng = Math.random) {
  if (!(Number.isFinite(minimum) && minimum >= 0.1 && minimum <= 5 && Number.isFinite(alpha) && alpha >= 0.5 && alpha <= 10)) throw new RangeError("Parameters outside explorer limits");
  return minimum / (1 - rng()) ** (1 / alpha);
}
