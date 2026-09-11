// Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.
const PI = 3.141592653589793;
const MAX_ANGLE = 10000;

function arctangent(x) {
  if (!Number.isFinite(x)) throw new RangeError('Input must be finite.');
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const reciprocal = x > 1;
  if (reciprocal) x = 1 / x;
  // Two half-angle reductions make the alternating series converge rapidly.
  for (let k = 0; k < 2; k++) x /= 1 + Math.sqrt(1 + x * x);
  let term = x, sum = x;
  for (let k = 1; k <= 24; k++) { term *= -x * x; sum += term / (2 * k + 1); }
  const angle = 4 * sum;
  return sign * (reciprocal ? PI / 2 - angle : angle);
}

function arcsine(x) {
  if (!Number.isFinite(x) || Math.abs(x) > 1) throw new RangeError('Arcsine requires −1 ≤ x ≤ 1.');
  if (Math.abs(x) === 1) return x * PI / 2;
  return arctangent(x / Math.sqrt((1 - x) * (1 + x)));
}
