import { jsDerivatives, pyDerivatives } from './easing-derivative-code.ts';
import type { Easing, EasingState } from './easings.ts';
const jsBounce = `function bounceOut(t) {
  const n = 7.5625, d = 2.75;
  if (t < 1/d) return n*t*t;
  if (t < 2/d) { t -= 1.5/d; return n*t*t + 0.75; }
  if (t < 2.5/d) { t -= 2.25/d; return n*t*t + 0.9375; }
  t -= 2.625/d;
  return n*t*t + 0.984375;
}`;
const pyBounce = `def bounce_out(t):
    n, d = 7.5625, 2.75
    if t < 1/d:
        return n*t*t
    if t < 2/d:
        t -= 1.5/d
        return n*t*t + 0.75
    if t < 2.5/d:
        t -= 2.25/d
        return n*t*t + 0.9375
    t -= 2.625/d
    return n*t*t + 0.984375`;
export function easingCode(
  e: Easing,
  s: EasingState,
  language: 'js' | 'python',
) {
  const js: Record<string, string> = {
    linear: 't',
    quadratic: 't ** 2',
    cubic: 't ** 3',
    quartic: 't ** 4',
    quintic: 't ** 5',
    sine: '1 - Math.cos(Math.PI * t / 2)',
    exponential: '2 ** (10 * t - 10)',
    circular: '1 - Math.sqrt(1 - t * t)',
    back: '2.70158 * t ** 3 - 1.70158 * t ** 2',
    elastic:
      '-(2 ** (10 * t - 10)) * Math.sin((10 * t - 10.75) * 2 * Math.PI / 3)',
    bounce: '1 - bounceOut(1 - t)',
  };
  const transform =
    e.direction === 'in'
      ? 'base(t)'
      : e.direction === 'out'
        ? '1 - base(1 - t)'
        : 't < 0.5 ? base(2 * t) / 2 : 1 - base(2 - 2 * t) / 2';
  if (language === 'js')
    return `${e.family === 'bounce' ? jsBounce + '\n\n' : ''}function base(t) {
  if (t === 0 || t === 1) return t;
  return ${js[e.family]};
}
function ease(t) {
  if (!Number.isFinite(t) || t < 0 || t > 1) throw new RangeError("t must be between 0 and 1");
  if (t === 0 || t === 1) return t;
  return ${transform};
}

${jsDerivatives}
function velocityAt(t) {
  const [v] = easeDerivatives('${e.family}', '${e.direction}', t);
  return end === start ? 0 : v === null ? null : (end - start) / duration * v;
}
function accelerationAt(t) {
  const [, a] = easeDerivatives('${e.family}', '${e.direction}', t);
  return end === start ? 0 : a === null ? null : (end - start) / duration ** 2 * a;
}

const duration = ${s.duration}; // seconds
const elapsed = ${s.t} * duration;
const t = Math.max(0, Math.min(1, elapsed / duration));
const start = ${s.start}, end = ${s.end};
const progress = ease(t);
const value = start + (end - start) * progress;
const velocity = velocityAt(t); // units / second
const acceleration = accelerationAt(t); // units / second squared
console.log(progress, value, velocity, acceleration);
`;
  const expression = js[e.family]
    .replaceAll('Math.cos', 'math.cos')
    .replaceAll('Math.sin', 'math.sin')
    .replaceAll('Math.sqrt', 'math.sqrt')
    .replaceAll('Math.PI', 'math.pi')
    .replaceAll('bounceOut', 'bounce_out');
  const pyTransform =
    e.direction === 'in'
      ? 'base(t)'
      : e.direction === 'out'
        ? '1 - base(1 - t)'
        : 'base(2 * t) / 2 if t < 0.5 else 1 - base(2 - 2 * t) / 2';
  return `import math

${e.family === 'bounce' ? pyBounce + '\n\n' : ''}def base(t):
    if t == 0 or t == 1:
        return t
    return ${expression}

def ease(t):
    if not math.isfinite(t) or not 0 <= t <= 1:
        raise ValueError("t must be between 0 and 1")
    if t == 0 or t == 1:
        return t
    return ${pyTransform}

${pyDerivatives}
def velocity_at(t):
    v, _ = ease_derivatives('${e.family}', '${e.direction}', t)
    return 0 if end == start else None if v is None else (end-start)/duration*v

def acceleration_at(t):
    _, a = ease_derivatives('${e.family}', '${e.direction}', t)
    return 0 if end == start else None if a is None else (end-start)/duration**2*a

duration = ${s.duration}  # seconds
elapsed = ${s.t} * duration
t = max(0, min(1, elapsed / duration))
start, end = ${s.start}, ${s.end}
progress = ease(t)
value = start + (end - start) * progress
velocity = velocity_at(t)  # units / second
acceleration = acceleration_at(t)  # units / second squared
print(progress, value, velocity, acceleration)
`;
}
