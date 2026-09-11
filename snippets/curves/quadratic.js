// Return the polynomial value and its derivative at x.
function evaluate_quadratic(x, a, b, c) {
  if (![x, a, b, c].every(Number.isFinite)) throw new RangeError("Use finite inputs.");
  const value = (a * x + b) * x + c;
  const derivative = 2 * a * x + b;
  if (![value, derivative].every(Number.isFinite)) throw new RangeError("Result overflow.");
  return { value, derivative };
}
