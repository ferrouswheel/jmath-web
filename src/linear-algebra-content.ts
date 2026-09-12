export const algebraPages = [
  {
    id: 'vectors',
    path: '/vectors',
    section: '/vectors',
    title: 'Vector operations',
    short: 'Vectors',
    color: '#527cb5',
    description:
      'Add arrows, find angles, and project one vector onto another. Every coordinate is yours to change.',
  },
  {
    id: 'matrices',
    path: '/matrices',
    section: '/matrices',
    title: 'Matrix operations',
    short: 'Basic operations',
    color: '#8468ad',
    description:
      'Calculate with 2 × 2 matrices and see how their columns transform the plane.',
  },
  {
    id: 'determinants',
    path: '/matrices/determinants',
    section: '/matrices',
    title: 'Determinants & matrix properties',
    short: 'Determinants',
    color: '#b77a46',
    description:
      'Watch a unit square become a parallelogram. Its signed area reveals the determinant.',
  },
  {
    id: 'hadamard',
    path: '/matrices/hadamard',
    section: '/matrices',
    title: 'Hadamard product',
    short: 'Hadamard product',
    color: '#3b9382',
    description:
      'Multiply corresponding entries, then compare the result with ordinary matrix multiplication.',
  },
  {
    id: 'jacobians',
    path: '/matrices/jacobians',
    section: '/matrices',
    title: 'Jacobian matrices',
    short: 'Jacobians',
    color: '#b26783',
    description:
      'Zoom in on a nonlinear map to see its local linear approximation and area scaling.',
  },
  {
    id: 'eigenvalues',
    path: '/eigenvalues',
    section: '/eigenvalues',
    title: 'Eigenvalues & eigenvectors',
    short: 'Eigenvalues & vectors',
    color: '#528b70',
    description:
      'Find the directions a matrix preserves, and see how their eigenvalues stretch, reverse, or collapse them.',
  },
] as const;
export type AlgebraId = (typeof algebraPages)[number]['id'];
export interface AlgebraState {
  a: import('./linear-algebra.ts').Matrix;
  b: import('./linear-algebra.ts').Matrix;
  u: import('./linear-algebra.ts').Vector;
  v: import('./linear-algebra.ts').Vector;
  k: number;
  t: number;
  delta: number;
  operation: string;
  map: import('./linear-algebra.ts').MapKind;
}
export function initialAlgebraState(id: AlgebraId): AlgebraState {
  return {
    a: id === 'eigenvalues' ? [2, 1, 1, 2] : [2, 1, 0, 1],
    b: [1, -1, 2, 1],
    u: id === 'jacobians' ? [1, 0.5] : [2, 1],
    v: [1, 2],
    k: 2,
    t: 1,
    delta: 0.5,
    operation: id === 'vectors' ? 'add' : 'multiply',
    map: 'square',
  };
}
export const presets: Record<
  AlgebraId,
  { label: string; state: Partial<AlgebraState> }[]
> = {
  vectors: [
    {
      label: 'Head to tail',
      state: { u: [2, 1], v: [1, 2], operation: 'add' },
    },
    {
      label: 'Perpendicular',
      state: { u: [3, 0], v: [0, 2], operation: 'dot' },
    },
    {
      label: 'Projection',
      state: { u: [1, 3], v: [3, 1], operation: 'project' },
    },
    {
      label: 'Opposite arrows',
      state: { u: [2, 1], v: [-2, -1], operation: 'add' },
    },
  ],
  matrices: [
    {
      label: 'Compose transforms',
      state: { a: [2, 0, 0, 1], b: [0, -1, 1, 0], operation: 'multiply' },
    },
    { label: 'Undo a shear', state: { a: [1, 2, 0, 1], operation: 'inverse' } },
    {
      label: 'Singular matrix',
      state: { a: [1, 2, 2, 4], operation: 'inverse' },
    },
  ],
  determinants: [
    { label: 'Stretch', state: { a: [2, 0, 0, 1] } },
    { label: 'Reflect', state: { a: [-1, 0, 0, 1] } },
    { label: 'Shear', state: { a: [1, 2, 0, 1] } },
    { label: 'Collapse', state: { a: [1, 2, 2, 4] } },
  ],
  hadamard: [
    { label: 'Entry-by-entry', state: { a: [2, 1, 0, 1], b: [1, -1, 2, 1] } },
    { label: 'Diagonal mask', state: { a: [2, 3, 4, 5], b: [1, 0, 0, 1] } },
    { label: 'All-ones identity', state: { a: [2, 3, 4, 5], b: [1, 1, 1, 1] } },
  ],
  jacobians: [
    { label: 'Complex squaring', state: { map: 'square', u: [1, 0.5] } },
    { label: 'Polar coordinates', state: { map: 'polar', u: [2, 0.7] } },
    { label: 'Nonlinear shear', state: { map: 'shear', u: [1, 0.5] } },
    { label: 'Singular point', state: { map: 'square', u: [0, 0] } },
  ],
  eigenvalues: [
    { label: 'Two eigendirections', state: { a: [2, 1, 1, 2] } },
    { label: 'Reflection', state: { a: [1, 0, 0, -1] } },
    { label: 'Rotation · complex', state: { a: [0, -1, 1, 0] } },
    { label: 'Shear · repeated', state: { a: [1, 1, 0, 1] } },
    { label: 'Uniform scaling', state: { a: [2, 0, 0, 2] } },
    { label: 'Zero eigenvalue', state: { a: [1, 0, 0, 0] } },
  ],
};
