// Educational approximation; radians in/out. Direct angles limited to |x| <= 10000.
const PI = 3.141592653589793;
const MAX_ANGLE = 10000;

function cosine(x) {
  if (!Number.isFinite(x) || Math.abs(x) > MAX_ANGLE) throw new RangeError('Angle must be finite and within ±10000 radians.');
  x %= 2 * PI;
  if (x > PI) x -= 2 * PI;
  if (x < -PI) x += 2 * PI;
  let sign = 1;
  if (x > PI / 2) { x = PI - x; sign = -1; }
  if (x < -PI / 2) { x = -PI - x; sign = -1; }
  let term = 1, sum = 1;
  for (let k = 1; k <= 16; k++) { term *= -x * x / ((2 * k - 1) * (2 * k)); sum += term; }
  return sign * sum;
}
