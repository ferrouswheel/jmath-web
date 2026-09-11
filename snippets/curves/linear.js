// Return the polynomial value and its derivative at x.
function evaluate_linear(x, a, b) {
  if (![x, a, b].every(Number.isFinite)) throw new RangeError("Use finite inputs.");
  const value = a * x + b;
  const derivative = a;
  if (![value, derivative].every(Number.isFinite)) throw new RangeError("Result overflow.");
  return { value, derivative };
}
