import metadata from './generated/curve-metadata.json' with { type: 'json' };

export type CurveId = 'linear' | 'quadratic' | 'cubic' | 'bezier';
export type Point = [number, number];
export interface Curve {
  id: CurveId;
  name: string;
  description: string;
  color: string;
  order: number;
  input: number;
  coefficients?: number[];
  points?: Point[];
  quadraticPoints?: Point[];
  related: CurveId[];
  reference: { label: string; url: string };
}
export interface CurveState {
  input: number;
  coefficients: number[];
  points: Point[];
}
export const curves = metadata as Curve[];
export const curveUrl = (curve: { id: string }) => `/curves/${curve.id}`;
export const coefficientNames = ['a', 'b', 'c', 'd'];
export const curveFormat = (value: number) =>
  Number(value.toPrecision(7)).toString();

export function initialCurveState(curve: Curve, degree = 3): CurveState {
  return {
    input: curve.input,
    coefficients: [...(curve.coefficients ?? [])],
    points: (degree === 2
      ? (curve.quadraticPoints ?? [])
      : (curve.points ?? [])
    ).map((p) => [...p]),
  };
}

// Simultaneous Horner evaluation of a polynomial and its derivative.
export function polynomial(coefficients: number[], x: number) {
  if (!coefficients.length || ![x, ...coefficients].every(Number.isFinite))
    throw new RangeError('Use finite polynomial inputs.');
  let value = coefficients[0],
    derivative = 0;
  for (const coefficient of coefficients.slice(1)) {
    derivative = derivative * x + value;
    value = value * x + coefficient;
  }
  return { value, derivative };
}

export function deCasteljau(points: Point[], t: number): Point[][] {
  if (
    points.length < 2 ||
    points.length > 4 ||
    !Number.isFinite(t) ||
    t < 0 ||
    t > 1 ||
    points.some((p) => p.length !== 2 || !p.every(Number.isFinite))
  )
    throw new RangeError('Use 2–4 finite points and t between 0 and 1.');
  const levels: Point[][] = [points.map((p) => [...p])];
  while (levels.at(-1)!.length > 1) {
    const row = levels.at(-1)!;
    levels.push(
      row
        .slice(0, -1)
        .map((p, i) => [
          (1 - t) * p[0] + t * row[i + 1][0],
          (1 - t) * p[1] + t * row[i + 1][1],
        ]),
    );
  }
  return levels;
}
export function bezier(points: Point[], t: number) {
  const levels = deCasteljau(points, t);
  const degree = points.length - 1;
  const row = levels.at(-2)!;
  const derivative: Point = [
    degree * (row[1][0] - row[0][0]),
    degree * (row[1][1] - row[0][1]),
  ];
  return { point: levels.at(-1)![0], derivative, levels };
}
export function curveError(curve: Curve, state: CurveState): string {
  const limit = curve.id === 'bezier' ? [0, 1] : [-5, 5];
  if (
    !Number.isFinite(state.input) ||
    state.input < limit[0] ||
    state.input > limit[1]
  )
    return `Enter ${curve.id === 'bezier' ? 't between 0 and 1' : 'x between −5 and 5'}.`;
  const values =
    curve.id === 'bezier' ? state.points.flat() : state.coefficients;
  if (values.some((n) => !Number.isFinite(n) || Math.abs(n) > 5))
    return 'Enter coefficients and coordinates between −5 and 5.';
  if (
    curve.id === 'bezier'
      ? ![3, 4].includes(state.points.length) ||
        state.points.some((p) => p.length !== 2)
      : state.coefficients.length !== curve.coefficients!.length
  )
    return 'The number of coefficients or control points does not match the curve.';
  return '';
}
export function curveResult(curve: Curve, state: CurveState) {
  const error = curveError(curve, state);
  if (error) throw new RangeError(error);
  if (curve.id === 'bezier') {
    const result = bezier(state.points, state.input);
    return { point: result.point, derivative: result.derivative };
  }
  const result = polynomial(state.coefficients, state.input);
  return {
    point: [state.input, result.value] as Point,
    derivative: [1, result.derivative] as Point,
  };
}
export function curveSlope(derivative: Point) {
  if (derivative[0] === 0)
    return derivative[1] === 0 ? 'Undefined (zero derivative)' : 'Vertical';
  return curveFormat(derivative[1] / derivative[0]);
}
export function curveNote(curve: Curve, state: CurveState) {
  if (curve.id === 'bezier')
    return `${state.points.length - 1 === 2 ? 'Quadratic' : 'Cubic'} Bézier · t is a parameter, not distance travelled. Drag a control point or edit its coordinates.`;
  const first = state.coefficients.findIndex((c) => c !== 0);
  const degree = first < 0 ? 0 : state.coefficients.length - first - 1;
  if (degree < state.coefficients.length - 1)
    return `The leading coefficient is zero: this is currently a ${['constant', 'linear', 'quadratic'][degree]} function.`;
  if (curve.id === 'quadratic') {
    const [a, b] = state.coefficients,
      x = -b / (2 * a);
    if (!Number.isFinite(x) || Math.abs(x) > 5)
      return 'The vertex lies outside the displayed x-window. The vertical graph scale adjusts to the curve.';
    return `Vertex: (${curveFormat(x)}, ${curveFormat(polynomial(state.coefficients, x).value)}). The vertical graph scale adjusts to the curve.`;
  }
  if (curve.id === 'cubic') {
    const x = -state.coefficients[1] / (3 * state.coefficients[0]);
    return `${Math.abs(x) <= 5 ? `Inflection at x = ${curveFormat(x)}` : 'The inflection point lies outside the displayed x-window'}. The vertical graph scale adjusts to the curve.`;
  }
  return 'The slope is constant everywhere on this line.';
}

export function curveSearch(curve: Curve, state: CurveState) {
  const params = new URLSearchParams();
  if (curve.id === 'bezier') {
    params.set('degree', String(state.points.length - 1));
    params.set('t', String(state.input));
    state.points.forEach((p, i) => {
      params.set(`x${i}`, String(p[0]));
      params.set(`y${i}`, String(p[1]));
    });
  } else {
    params.set('x', String(state.input));
    state.coefficients.forEach((n, i) =>
      params.set(coefficientNames[i], String(n)),
    );
  }
  return params.toString();
}
export function curveFromSearch(curve: Curve, search: string) {
  const params = new URLSearchParams(search);
  const degree = Number(params.get('degree') ?? 3);
  const state = initialCurveState(curve, degree);
  const read = (key: string, value: number) =>
    params.has(key)
      ? params.get(key)!.trim() === ''
        ? NaN
        : Number(params.get(key))
      : value;
  state.input = read(curve.id === 'bezier' ? 't' : 'x', state.input);
  if (curve.id === 'bezier')
    state.points = state.points.map((p, i) => [
      read(`x${i}`, p[0]),
      read(`y${i}`, p[1]),
    ]);
  else
    state.coefficients = state.coefficients.map((n, i) =>
      read(coefficientNames[i], n),
    );
  const error =
    curve.id === 'bezier' && ![2, 3].includes(degree)
      ? 'Bézier degree must be 2 or 3.'
      : curveError(curve, state);
  return {
    state: error ? initialCurveState(curve) : state,
    error: error ? `${error} Showing defaults for this link.` : '',
  };
}
