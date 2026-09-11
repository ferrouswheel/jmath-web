// Return the polynomial value and its derivative at x.
function evaluate_cubic(x, a, b, c, d) {
  if (![x, a, b, c, d].every(Number.isFinite)) throw new RangeError("Use finite inputs.");
  const value = ((a * x + b) * x + c) * x + d;
  const derivative = (3 * a * x + 2 * b) * x + c;
  if (![value, derivative].every(Number.isFinite)) throw new RangeError("Result overflow.");
  return { value, derivative };
}
