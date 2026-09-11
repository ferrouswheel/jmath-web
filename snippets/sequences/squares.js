// Exact integers using built-in BigInt; no external libraries.
// Indexing: n starts at 0.
function nth_squares(n) {
  if (!Number.isInteger(n) || n < 0 || n > 1000)
    throw new RangeError("n must be an integer from 0 to 1000");
  const k = BigInt(n);
  return k * k;
}
