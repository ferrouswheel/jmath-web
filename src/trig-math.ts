// Educational double-precision approximations; angles are in radians.
// Range reduction is intentionally bounded to avoid large-angle precision loss.
export const PI = 3.141592653589793;
export const MAX_ANGLE = 10000;
export function sine(x: number) {
  if (!Number.isFinite(x) || Math.abs(x) > MAX_ANGLE)
    throw new RangeError('Angle must be finite and within ±10000 radians.');
  x %= 2 * PI;
  if (x > PI) x -= 2 * PI;
  if (x < -PI) x += 2 * PI;
  if (x > PI / 2) x = PI - x;
  if (x < -PI / 2) x = -PI - x;
  let term = x,
    sum = x;
  for (let k = 1; k <= 16; k++) {
    term *= (-x * x) / (2 * k * (2 * k + 1));
    sum += term;
  }
  return sum;
}
export function cosine(x: number) {
  if (!Number.isFinite(x) || Math.abs(x) > MAX_ANGLE)
    throw new RangeError('Angle must be finite and within ±10000 radians.');
  x %= 2 * PI;
  if (x > PI) x -= 2 * PI;
  if (x < -PI) x += 2 * PI;
  let sign = 1;
  if (x > PI / 2) {
    x = PI - x;
    sign = -1;
  }
  if (x < -PI / 2) {
    x = -PI - x;
    sign = -1;
  }
  let term = 1,
    sum = 1;
  for (let k = 1; k <= 16; k++) {
    term *= (-x * x) / ((2 * k - 1) * (2 * k));
    sum += term;
  }
  return sign * sum;
}
export function tangent(x: number) {
  const c = cosine(x);
  if (Math.abs(c) < 1e-12)
    throw new RangeError(
      'Tangent is undefined at π/2 + kπ; this input is at or numerically too close to a pole.',
    );
  return sine(x) / c;
}
export function arctangent(x: number) {
  if (!Number.isFinite(x)) throw new RangeError('Input must be finite.');
  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);
  const reciprocal = x > 1;
  if (reciprocal) x = 1 / x;
  // Two half-angle reductions make the alternating series converge rapidly.
  for (let k = 0; k < 2; k++) x /= 1 + Math.sqrt(1 + x * x);
  let term = x,
    sum = x;
  for (let k = 1; k <= 24; k++) {
    term *= -x * x;
    sum += term / (2 * k + 1);
  }
  const angle = 4 * sum;
  return sign * (reciprocal ? PI / 2 - angle : angle);
}
export function arcsine(x: number) {
  if (!Number.isFinite(x) || Math.abs(x) > 1)
    throw new RangeError('Arcsine requires −1 ≤ x ≤ 1.');
  if (Math.abs(x) === 1) return (x * PI) / 2;
  return arctangent(x / Math.sqrt((1 - x) * (1 + x)));
}
export function arccosine(x: number) {
  if (!Number.isFinite(x) || Math.abs(x) > 1)
    throw new RangeError('Arccosine requires −1 ≤ x ≤ 1.');
  // This form avoids subtracting two nearly equal angles near x = 1.
  if (x === -1) return PI;
  return 2 * arctangent(Math.sqrt((1 - x) / (1 + x)));
}
