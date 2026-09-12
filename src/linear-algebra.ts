export type Vector = [number, number];
export type Matrix = [number, number, number, number];
export const add = (u: Vector, v: Vector): Vector => [u[0] + v[0], u[1] + v[1]];
export const scale = (k: number, v: Vector): Vector => [k * v[0], k * v[1]];
export const dot = (u: Vector, v: Vector) => u[0] * v[0] + u[1] * v[1];
export const norm = (v: Vector) => Math.hypot(...v);
export const det = ([a, b, c, d]: Matrix) => a * d - b * c;
export const trace = ([a, , , d]: Matrix) => a + d;
export const apply = ([a, b, c, d]: Matrix, [x, y]: Vector): Vector => [
  a * x + b * y,
  c * x + d * y,
];
export const transpose = ([a, b, c, d]: Matrix): Matrix => [a, c, b, d];
export const multiply = (a: Matrix, b: Matrix): Matrix => [
  a[0] * b[0] + a[1] * b[2],
  a[0] * b[1] + a[1] * b[3],
  a[2] * b[0] + a[3] * b[2],
  a[2] * b[1] + a[3] * b[3],
];
export const hadamard = (a: Matrix, b: Matrix): Matrix =>
  a.map((v, i) => v * b[i]) as Matrix;
export const matrixScale = (k: number, a: Matrix): Matrix =>
  a.map((v) => k * v) as Matrix;
export const matrixAdd = (a: Matrix, b: Matrix): Matrix =>
  a.map((v, i) => v + b[i]) as Matrix;
const matrixSize = (a: Matrix) => Math.max(...a.map(Math.abs));
export const singular = (a: Matrix) =>
  Math.abs(det(a)) <= 1e-12 * matrixSize(a) ** 2;
export const rank = (a: Matrix) =>
  matrixSize(a) === 0 ? 0 : singular(a) ? 1 : 2;
export const inverse = (a: Matrix): Matrix | null =>
  singular(a) ? null : matrixScale(1 / det(a), [a[3], -a[1], -a[2], a[0]]);
export const projection = (u: Vector, v: Vector): Vector | null =>
  norm(v) === 0 ? null : scale(dot(u, v) / dot(v, v), v);
export const angle = (u: Vector, v: Vector) =>
  norm(u) * norm(v) === 0
    ? null
    : (Math.acos(Math.max(-1, Math.min(1, dot(u, v) / (norm(u) * norm(v))))) *
        180) /
      Math.PI;
export interface EigenResult {
  kind: 'distinct' | 'scalar' | 'defective' | 'complex';
  values: number[];
  vectors: Vector[];
  imaginary: number;
}
export function eigen(a: Matrix): EigenResult {
  const [aa, b, c, d] = a,
    t = trace(a),
    determinant = det(a);
  const discriminant = (aa - d) ** 2 + 4 * b * c;
  const tolerance = 1e-12 * matrixSize(a) ** 2;
  if (discriminant < -tolerance)
    return {
      kind: 'complex',
      values: [t / 2, t / 2],
      vectors: [],
      imaginary: Math.sqrt(-discriminant) / 2,
    };
  const direction = (lambda: number): Vector => {
    const first: Vector = [b, lambda - aa],
      second: Vector = [lambda - d, c];
    const v = norm(first) > norm(second) ? first : second;
    return norm(v) === 0 ? [1, 0] : scale(1 / norm(v), v);
  };
  if (Math.abs(discriminant) <= tolerance) {
    const lambda = t / 2;
    const scalar =
      Math.max(Math.abs(b), Math.abs(c), Math.abs(aa - d)) <=
      1e-12 * matrixSize(a);
    return {
      kind: scalar ? 'scalar' : 'defective',
      values: [lambda, lambda],
      vectors: scalar
        ? [
            [1, 0],
            [0, 1],
          ]
        : [direction(lambda)],
      imaginary: 0,
    };
  }
  // Recover the smaller root from the product to avoid cancellation.
  const q = (t + (t >= 0 ? 1 : -1) * Math.sqrt(discriminant)) / 2;
  const values = [q, determinant / q].sort((x, y) => y - x);
  return {
    kind: 'distinct',
    values,
    vectors: values.map(direction),
    imaginary: 0,
  };
}
export type MapKind = 'square' | 'polar' | 'shear';
export function mapping(kind: MapKind, [x, y]: Vector): Vector {
  if (kind === 'polar') return [x * Math.cos(y), x * Math.sin(y)];
  if (kind === 'shear') return [x, y + x * x];
  return [x * x - y * y, 2 * x * y];
}
export function jacobian(kind: MapKind, [x, y]: Vector): Matrix {
  if (kind === 'polar')
    return [Math.cos(y), -x * Math.sin(y), Math.sin(y), x * Math.cos(y)];
  if (kind === 'shear') return [1, 0, 2 * x, 1];
  return [2 * x, -2 * y, 2 * y, 2 * x];
}
export const numberText = (n: number) => {
  if (Math.abs(n) < 1e-12) return '0';
  return Number(n.toPrecision(5)).toString();
};
