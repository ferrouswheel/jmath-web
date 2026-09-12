import { easeDerivatives } from './easing-derivatives.js';
export type EasingFamily =
  | 'linear'
  | 'quadratic'
  | 'cubic'
  | 'quartic'
  | 'quintic'
  | 'sine'
  | 'exponential'
  | 'circular'
  | 'back'
  | 'elastic'
  | 'bounce';
export type EasingDirection = 'in' | 'out' | 'in-out';
export interface Easing {
  id: string;
  family: EasingFamily;
  direction: EasingDirection;
  name: string;
  description: string;
  color: string;
}
export const easingFamilies: {
  id: EasingFamily;
  name: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'linear',
    name: 'Linear',
    description: 'Constant progress: equal time produces equal movement.',
    color: '#657e9a',
  },
  {
    id: 'quadratic',
    name: 'Quadratic',
    description: 'A simple, gentle change of speed using a square.',
    color: '#527cb5',
  },
  {
    id: 'cubic',
    name: 'Cubic',
    description: 'A stronger acceleration or deceleration using a cube.',
    color: '#8062bd',
  },
  {
    id: 'quartic',
    name: 'Quartic',
    description: 'A more pronounced contrast between slow and fast motion.',
    color: '#9a6aad',
  },
  {
    id: 'quintic',
    name: 'Quintic',
    description: 'An even more concentrated burst of motion.',
    color: '#aa688e',
  },
  {
    id: 'sine',
    name: 'Sine',
    description: 'A gentle transition shaped by part of a sine wave.',
    color: '#458c82',
  },
  {
    id: 'exponential',
    name: 'Exponential',
    description: 'A dramatic change of speed, with most motion near one end.',
    color: '#b77a46',
  },
  {
    id: 'circular',
    name: 'Circular',
    description: 'A quarter-circle profile with a sharply changing slope.',
    color: '#628e69',
  },
  {
    id: 'back',
    name: 'Back',
    description: 'A small anticipation or overshoot before settling.',
    color: '#af7156',
  },
  {
    id: 'elastic',
    name: 'Elastic',
    description: 'A spring-like oscillation that overshoots the endpoints.',
    color: '#ac6687',
  },
  {
    id: 'bounce',
    name: 'Bounce',
    description: 'A sequence of rebounds with progressively smaller bounces.',
    color: '#7b7fae',
  },
];
const directionText = {
  in: 'Starts slowly and builds speed toward the end.',
  out: 'Moves quickly at first and slows toward the end.',
  'in-out':
    'Starts slowly, moves fastest around the middle, and slows again at the end.',
};
const specialDirection: Partial<
  Record<EasingFamily, Record<EasingDirection, string>>
> = {
  back: {
    in: 'Pulls back briefly before moving toward the destination.',
    out: 'Passes the destination, then returns to it.',
    'in-out': 'Pulls back at the start and overshoots near the end.',
  },
  elastic: {
    in: 'Oscillates around the start before moving to the destination.',
    out: 'Springs past the destination and oscillates as it settles.',
    'in-out':
      'Combines spring-like anticipation with a spring-like settling motion.',
  },
  bounce: {
    in: 'Small rebounds lead into the main movement.',
    out: 'Reaches the destination, then rebounds with progressively smaller bounces.',
    'in-out':
      'Combines small rebounds at the beginning and end of the movement.',
  },
};
export const easings: Easing[] = easingFamilies.flatMap((f) =>
  (f.id === 'linear' ? ['in'] : ['in', 'out', 'in-out']).map((direction) => ({
    id: f.id === 'linear' ? 'linear' : `${f.id}-${direction}`,
    family: f.id,
    direction: direction as EasingDirection,
    name: f.id === 'linear' ? 'Linear easing' : `${f.name} ease-${direction}`,
    description:
      f.id === 'linear'
        ? f.description
        : `${specialDirection[f.id]?.[direction as EasingDirection] ?? directionText[direction as EasingDirection]} ${f.description}`,
    color: f.color,
  })),
);
export const easingUrl = (easing: Easing) => `/easing/${easing.id}`;
export function bounceOut(t: number) {
  const n = 7.5625,
    d = 2.75;
  if (t < 1 / d) return n * t * t;
  if (t < 2 / d) {
    t -= 1.5 / d;
    return n * t * t + 0.75;
  }
  if (t < 2.5 / d) {
    t -= 2.25 / d;
    return n * t * t + 0.9375;
  }
  t -= 2.625 / d;
  return n * t * t + 0.984375;
}
export function easeIn(family: EasingFamily, t: number) {
  if (t === 0 || t === 1) return t;
  switch (family) {
    case 'linear':
      return t;
    case 'quadratic':
      return t ** 2;
    case 'cubic':
      return t ** 3;
    case 'quartic':
      return t ** 4;
    case 'quintic':
      return t ** 5;
    case 'sine':
      return 1 - Math.cos((Math.PI * t) / 2);
    case 'exponential':
      return 2 ** (10 * t - 10);
    case 'circular':
      return 1 - Math.sqrt(1 - t * t);
    case 'back':
      return 2.70158 * t ** 3 - 1.70158 * t ** 2;
    case 'elastic':
      return (
        -(2 ** (10 * t - 10)) * Math.sin(((10 * t - 10.75) * 2 * Math.PI) / 3)
      );
    case 'bounce':
      return 1 - bounceOut(1 - t);
  }
}
export function ease(easing: Easing, t: number) {
  if (!Number.isFinite(t) || t < 0 || t > 1)
    throw new RangeError('Time progress must be between 0 and 1.');
  if (t === 0 || t === 1) return t;
  if (easing.direction === 'in') return easeIn(easing.family, t);
  if (easing.direction === 'out') return 1 - easeIn(easing.family, 1 - t);
  return t < 0.5
    ? easeIn(easing.family, 2 * t) / 2
    : 1 - easeIn(easing.family, 2 - 2 * t) / 2;
}
export interface EasingState {
  t: number;
  start: number;
  end: number;
  duration: number;
}
export const initialEasingState = (): EasingState => ({
  t: 0.35,
  start: 0,
  end: 100,
  duration: 2,
});
export function easingError(s: EasingState) {
  if (!Number.isFinite(s.t) || s.t < 0 || s.t > 1)
    return 'Enter time progress t between 0 and 1.';
  if (![s.start, s.end].every((n) => Number.isFinite(n) && Math.abs(n) <= 1000))
    return 'Start and end values must be between −1000 and 1000.';
  if (!Number.isFinite(s.duration) || s.duration < 0.2 || s.duration > 10)
    return 'Duration must be between 0.2 and 10 seconds.';
  return '';
}
export const easingValue = (e: Easing, s: EasingState) =>
  s.start + (s.end - s.start) * ease(e, s.t);
export const easingBounds = (e: Easing) =>
  ['back', 'elastic'].includes(e.family) ? [-0.5, 1.5] : [0, 1];
export const easingFormat = (n: number) => Number(n.toPrecision(6)).toString();

export function easingRates(e: Easing, s: EasingState) {
  const rates = easeDerivatives(e.family, e.direction, s.t);
  return rates.map((rate, i) =>
    s.end === s.start
      ? 0
      : rate === null
        ? null
        : ((s.end - s.start) / s.duration ** (i + 1)) * rate,
  );
}
export const easingRateFormat = (n: number | null) =>
  n === null
    ? 'Undefined'
    : !Number.isFinite(n)
      ? n < 0
        ? '−∞'
        : '∞'
      : easingFormat(n);
