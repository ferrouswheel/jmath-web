// Exact integers using built-in BigInt; no external libraries.
// Indexing: n starts at 0.
function nth_fibonacci(n) {
  if (!Number.isInteger(n) || n < 0 || n > 1000)
    throw new RangeError("n must be an integer from 0 to 1000");
  let a = 0n, b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
