/** Exact derivatives with respect to normalized time, not seconds.
 * null means undefined; Infinity means an unbounded one-sided limit.
 * At endpoints, derivatives are taken from inside the interval.
 * @param {import('./easings.ts').EasingFamily} family
 * @param {import('./easings.ts').EasingDirection} direction
 * @param {number} t
 * @returns {[number | null, number | null]}
 */
export function easeDerivatives(family, direction, t) {
  if (!Number.isFinite(t) || t < 0 || t > 1)
    throw new RangeError('t must be between 0 and 1');
  const u =
    direction === 'in'
      ? t
      : direction === 'out'
        ? 1 - t
        : t < 0.5
          ? 2 * t
          : 2 - 2 * t;
  let v, a;
  const power = { quadratic: 2, cubic: 3, quartic: 4, quintic: 5 }[family];
  if (power) {
    v = power * u ** (power - 1);
    a = power * (power - 1) * u ** (power - 2);
  } else if (family === 'linear') {
    v = 1;
    a = 0;
  } else if (family === 'sine') {
    v = (Math.PI / 2) * Math.sin((Math.PI * u) / 2);
    a = (Math.PI ** 2 / 4) * Math.cos((Math.PI * u) / 2);
  } else if (family === 'exponential') {
    if (u === 0) return [null, null]; // Endpoint jump.
    const k = 10 * Math.LN2;
    v = k * 2 ** (10 * u - 10);
    a = k * v;
  } else if (family === 'circular') {
    v = u === 1 ? Infinity : u / Math.sqrt(1 - u * u);
    a = u === 1 ? Infinity : (1 - u * u) ** -1.5;
  } else if (family === 'back') {
    v = 8.10474 * u * u - 3.40316 * u;
    a = 16.20948 * u - 3.40316;
  } else if (family === 'elastic') {
    if (u === 0) return [null, null]; // Endpoint jump.
    const k = 10 * Math.LN2,
      w = (20 * Math.PI) / 3;
    const phase = ((10 * u - 10.75) * 2 * Math.PI) / 3;
    const amplitude = 2 ** (10 * u - 10);
    v = -amplitude * (k * Math.sin(phase) + w * Math.cos(phase));
    a =
      -amplitude *
      ((k * k - w * w) * Math.sin(phase) + 2 * k * w * Math.cos(phase));
  } else if (family === 'bounce') {
    const q = 1 - u,
      d = 2.75;
    if ([1 / d, 2 / d, 2.5 / d].some((b) => Math.abs(q - b) < 1e-12))
      return [null, null]; // Slope changes abruptly at a rebound.
    const offset =
      q < 1 / d ? 0 : q < 2 / d ? 1.5 / d : q < 2.5 / d ? 2.25 / d : 2.625 / d;
    v = 15.125 * (q - offset);
    a = -15.125;
  } else {
    throw new RangeError('Unknown easing family');
  }
  if (direction === 'in-out' && t === 0.5)
    return [v, Math.abs(a) < 1e-12 ? 0 : null]; // Second derivatives must agree at the join.
  const factor =
    direction === 'in' ? 1 : direction === 'out' ? -1 : t < 0.5 ? 2 : -2;
  return [v, factor * a];
}
