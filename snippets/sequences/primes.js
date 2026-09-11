// Exact integers using built-in BigInt; no external libraries.
// Indexing: n starts at 1.
function nth_primes(n) {
  if (!Number.isInteger(n) || n < 1 || n > 1000)
    throw new RangeError("n must be an integer from 1 to 1000");
  let found = 0;
  for (let candidate = 2; ; candidate++) {
    let prime = true;
    for (let d = 2; d * d <= candidate; d++) {
      if (candidate % d === 0) { prime = false; break; }
    }
    if (prime && ++found === n) return BigInt(candidate);
  }
}
