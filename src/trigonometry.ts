import { theoremsFor } from './content-data.ts';
import {
  arccosine,
  arcsine,
  arctangent,
  cosine,
  PI,
  sine,
  tangent,
} from './trig-math.ts';
import type { TrigFunction } from './types.ts';
export const trigFunctions: TrigFunction[] = [
  {
    id: 'sin',
    name: 'Sine',
    notation: 'sin(θ)',
    description: 'The vertical coordinate of a point on the unit circle.',
    inverse: false,
    fn: sine,
    initial: PI / 6,
    domain: 'All real angles',
    range: '[−1, 1]',
    period: '2π radians · 360°',
    parity: 'Odd: sin(−θ) = −sin(θ)',
    derivative: 'cos(θ)',
    formula: 'sin(θ) = opposite / hypotenuse',
    explanation:
      'For an acute angle in a right triangle, sine is the opposite side divided by the hypotenuse. On the unit circle, it is the y-coordinate for any angle.',
    graph: [-2 * PI, 2 * PI, -1.4, 1.4],
    related: ['cos', 'arcsin'],
    theorems: theoremsFor('trigonometry/sin'),
  },
  {
    id: 'cos',
    name: 'Cosine',
    notation: 'cos(θ)',
    description: 'The horizontal coordinate of a point on the unit circle.',
    inverse: false,
    fn: cosine,
    initial: PI / 3,
    domain: 'All real angles',
    range: '[−1, 1]',
    period: '2π radians · 360°',
    parity: 'Even: cos(−θ) = cos(θ)',
    derivative: '−sin(θ)',
    formula: 'cos(θ) = adjacent / hypotenuse',
    explanation:
      'For an acute angle in a right triangle, cosine is the adjacent side divided by the hypotenuse. On the unit circle, it is the x-coordinate for any angle.',
    graph: [-2 * PI, 2 * PI, -1.4, 1.4],
    related: ['sin', 'arccos'],
    theorems: theoremsFor('trigonometry/cos'),
  },
  {
    id: 'tan',
    name: 'Tangent',
    notation: 'tan(θ)',
    description:
      'The slope of the unit-circle radius, where its horizontal coordinate is nonzero.',
    inverse: false,
    fn: tangent,
    initial: PI / 4,
    domain: 'θ ≠ π/2 + kπ, for any integer k',
    range: 'All real numbers',
    period: 'π radians · 180°',
    parity: 'Odd: tan(−θ) = −tan(θ)',
    derivative: '1 / cos²(θ)',
    formula: 'tan(θ) = sin(θ) / cos(θ)',
    explanation:
      'Tangent is the slope y/x of the radius. At odd multiples of π/2 the radius is vertical and tangent is undefined. Dashed lines on the graph mark these poles.',
    graph: [-2 * PI, 2 * PI, -5, 5],
    related: ['sin', 'cos', 'arctan'],
    theorems: theoremsFor('trigonometry/tan'),
  },
  {
    id: 'arcsin',
    name: 'Arcsine',
    notation: 'arcsin(x)',
    description: 'The principal angle whose sine is x.',
    inverse: true,
    fn: arcsine,
    initial: 0.5,
    domain: '[−1, 1]',
    range: '[−π/2, π/2] · [−90°, 90°]',
    period: 'Not periodic',
    parity: 'Odd: arcsin(−x) = −arcsin(x)',
    derivative: '1 / √(1 − x²), for −1 < x < 1',
    formula: 'θ = arcsin(x) ⇔ sin(θ) = x, −π/2 ≤ θ ≤ π/2',
    explanation:
      'A horizontal line at height x usually meets the unit circle twice. Arcsine chooses the point on the right half, so its angle lies between −π/2 and π/2.',
    graph: [-1, 1, -1.8, 1.8],
    related: ['sin', 'arccos'],
    theorems: theoremsFor('trigonometry/arcsin'),
  },
  {
    id: 'arccos',
    name: 'Arccosine',
    notation: 'arccos(x)',
    description: 'The principal angle whose cosine is x.',
    inverse: true,
    fn: arccosine,
    initial: 0.5,
    domain: '[−1, 1]',
    range: '[0, π] · [0°, 180°]',
    period: 'Not periodic',
    parity: 'Neither odd nor even',
    derivative: '−1 / √(1 − x²), for −1 < x < 1',
    formula: 'θ = arccos(x) ⇔ cos(θ) = x, 0 ≤ θ ≤ π',
    explanation:
      'A vertical line at horizontal coordinate x usually meets the circle twice. Arccosine chooses the point on the upper half, with an angle from 0 to π.',
    graph: [-1, 1, -0.3, 3.5],
    related: ['cos', 'arcsin'],
    theorems: theoremsFor('trigonometry/arccos'),
  },
  {
    id: 'arctan',
    name: 'Arctangent',
    notation: 'arctan(x)',
    description: 'The principal angle of a line with slope x.',
    inverse: true,
    fn: arctangent,
    initial: 1,
    domain: 'All real numbers',
    range: '(−π/2, π/2) · (−90°, 90°)',
    period: 'Not periodic',
    parity: 'Odd: arctan(−x) = −arctan(x)',
    derivative: '1 / (1 + x²)',
    formula: 'θ = arctan(x) ⇔ tan(θ) = x, −π/2 < θ < π/2',
    explanation:
      'A line through the origin with slope x meets the circle twice. Arctangent chooses the point on the right half. Its angle approaches, but never reaches, ±π/2 for finite x.',
    graph: [-5, 5, -1.8, 1.8],
    related: ['tan', 'arcsin'],
    theorems: theoremsFor('trigonometry/arctan'),
  },
];
export const trigUrl = (f: { id: string }) => `/trigonometry/${f.id}`;
export function trigAtPath(pathname: string) {
  const path = pathname.replace(/\/$/, '');
  if (path === '/trigonometry') return { item: null };
  const item = trigFunctions.find((f) => trigUrl(f) === path);
  return item ? { item } : null;
}
export function evaluateTrig(
  item: TrigFunction,
  input: number,
  unit = 'radians',
) {
  if (!['radians', 'degrees'].includes(unit))
    throw new RangeError('Unknown angle unit.');
  const angleFactor = unit === 'degrees' ? PI / 180 : 1;
  const value = item.fn(item.inverse ? input : input * angleFactor);
  return item.inverse ? value / angleFactor : value;
}
