import {
  algebraPages,
  initialAlgebraState,
  presets,
  type AlgebraId,
  type AlgebraState,
} from './linear-algebra-content.ts';
export interface AlgebraOperation {
  key: string;
  engine: AlgebraId;
  operation: string;
  path: string;
  section: string;
  title: string;
  short: string;
  description: string;
  interpretation: string;
  color: string;
}
const vectorEntries = [
  [
    'addition',
    'add',
    'Vector addition',
    'Addition',
    'Combine two movements or effects.',
    'Walking east and then north, or combining two forces, gives one total displacement or force. Put the arrows head to tail: the result reaches from the starting point to the final tip.',
  ],
  [
    'subtraction',
    'subtract',
    'Vector subtraction',
    'Subtraction',
    'Find the change needed to get from one vector to another.',
    'If u and v are positions, u − v is the displacement from v to u. It tells you which way to travel and how far, rather than where either point is on its own.',
  ],
  [
    'scaling',
    'scale',
    'Vector scaling',
    'Scalar multiplication',
    'Change the size of a movement without changing its line of action.',
    'Doubling a velocity doubles the distance covered in the same time. Multiplying by a negative number reverses direction; multiplying by zero stops the movement.',
  ],
  [
    'dot-product',
    'dot',
    'Dot product',
    'Dot product',
    'Measure how much two vectors point in the same direction.',
    'In physics, force dotted with displacement measures work: only the force along the movement contributes. Aligned vectors give a positive result, perpendicular vectors give zero, and opposing vectors give a negative result.',
  ],
  [
    'projection',
    'project',
    'Vector projection',
    'Projection',
    'Keep only the part of a vector that acts along a chosen direction.',
    'A projection is the shadow of one arrow on the line of another. Use it to find the part of a velocity along a road, or separate a force into components along and across a slope.',
  ],
  [
    'magnitude',
    'magnitude',
    'Vector magnitude',
    'Magnitude',
    'Turn a vector into its size or length.',
    'The magnitude of a velocity is speed. The magnitude of a displacement is straight-line distance. It ignores direction and uses the Pythagorean theorem to combine the coordinates.',
  ],
  [
    'normalization',
    'normalize',
    'Vector normalization',
    'Normalization',
    'Keep a direction while setting its length to one.',
    'A unit vector describes which way to go without prescribing a speed or distance. Multiply it by the magnitude you want. The zero vector cannot be normalized because it has no direction.',
  ],
  [
    'angle',
    'angle',
    'Angle between vectors',
    'Angle',
    'Compare the directions of two arrows, regardless of their lengths.',
    'The angle tells you how much one direction must turn to align with another. It ranges from 0° for the same direction through 90° for perpendicular directions to 180° for opposite directions.',
  ],
  [
    'signed-area',
    'area',
    'Signed area of two vectors',
    'Signed area',
    'Measure the area and orientation spanned by two directions.',
    'The vectors form two sides of a parallelogram. Its signed area is positive when the turn from u to v is counterclockwise, negative when clockwise, and zero when they lie on the same line.',
  ],
];
const matrixEntries = [
  [
    'addition',
    'add',
    'Matrix addition',
    'Addition',
    'Combine the effects of two linear rules.',
    'For the same input vector, (A + B)v adds the outputs Av and Bv. For data tables with matching shapes, it adds corresponding measurements. Both matrices must have the same dimensions.',
  ],
  [
    'subtraction',
    'subtract',
    'Matrix subtraction',
    'Subtraction',
    'Measure the entry-by-entry difference between two rules or tables.',
    'A − B describes how the output of A differs from the output of B for the same input. In a data table, it can show changes between two snapshots.',
  ],
  [
    'scaling',
    'scale',
    'Matrix scaling',
    'Scalar multiplication',
    'Apply one gain to every output of a linear rule.',
    'Multiplying a matrix by k scales every entry and every output vector by k. For a table, it rescales all measurements; for a transformation, a negative gain also reverses output directions.',
  ],
  [
    'multiplication',
    'multiply',
    'Matrix multiplication',
    'Matrix multiplication',
    'Chain two transformations together.',
    'AB means apply B first, then A, when vectors are columns. It packages two steps into one rule. Order matters: rotating and then stretching can differ from stretching and then rotating.',
  ],
  [
    'matrix-vector',
    'transform',
    'Matrix–vector multiplication',
    'Transform a vector',
    'Apply a linear rule to a set of input quantities.',
    'A matrix turns input coordinates into output coordinates. Each column tells you where an input basis direction goes; the input vector weights those columns to produce the result.',
  ],
  [
    'transpose',
    'transpose',
    'Matrix transpose',
    'Transpose',
    'Swap the roles of rows and columns.',
    'For a data table, transpose changes whether each record is a row or a column. For a linear map, the transpose transfers a dot-product comparison from the output side back to the input side.',
  ],
  [
    'inverse',
    'inverse',
    'Matrix inverse',
    'Inverse',
    'Undo a transformation to recover the input.',
    'If A maps an input to an output, A⁻¹ maps that output back. An inverse exists only when A has not lost information: a map that collapses a plane onto a line cannot recover every original point.',
  ],
  [
    'rank',
    'rank',
    'Matrix rank',
    'Rank',
    'Count how many independent directions survive a linear map.',
    'Rank 2 means a 2D input can reach a whole plane. Rank 1 means all outputs lie on one line, and rank 0 means every input becomes zero. Rank measures independent information, not the number of nonzero entries.',
  ],
  [
    'trace',
    'trace',
    'Matrix trace',
    'Trace',
    'Add the diagonal entries to get a basis-independent summary of a square matrix.',
    'The trace equals the sum of the eigenvalues, including repeats. For a covariance matrix it is the total variance across all coordinates. For a general transformation it is a summary, not an area or length scale.',
  ],
];
function entries(
  rows: string[][],
  engine: 'vectors' | 'matrices',
): AlgebraOperation[] {
  const base = algebraPages.find((p) => p.id === engine)!;
  return rows.map(
    ([slug, operation, title, short, description, interpretation]) => ({
      key: `${engine}-${slug}`,
      engine,
      operation,
      path: `/${engine}/${slug}`,
      section: `/${engine}`,
      title,
      short,
      description,
      interpretation,
      color: base.color,
    }),
  );
}
export const operationPages: AlgebraOperation[] = [
  ...entries(vectorEntries, 'vectors'),
  ...entries(matrixEntries, 'matrices'),
  ...algebraPages
    .filter((p) => !['vectors', 'matrices'].includes(p.id))
    .map((p) => ({
      ...p,
      title: p.id === 'determinants' ? 'Matrix determinant' : p.title,
      key: p.id,
      engine: p.id,
      operation: p.id,
      interpretation:
        p.id === 'determinants'
          ? 'The determinant tells you how a square matrix changes signed area: its magnitude is the area multiplier, and its sign says whether orientation is preserved or reversed. A zero determinant means the transformation loses a direction.'
          : p.id === 'hadamard'
            ? 'Use a Hadamard product to apply a separate weight or mask to each entry of a table. Multiply matching positions without combining rows and columns. It is useful for masking pixels, gating features, and weighting measurements.'
            : p.id === 'jacobians'
              ? 'A Jacobian predicts how a small change in each input affects every output of a nonlinear function. Near a chosen point, it acts like a matrix you can use for sensitivity, local motion, and area scaling.'
              : 'Eigenvectors are directions a transformation keeps on the same line. Their eigenvalues say how much those directions stretch, shrink, reverse, or collapse. They reveal the independent modes hidden inside a coupled system.',
    })),
];
export const operationByKey = (key: string) =>
  operationPages.find((p) => p.key === key)!;
export function operationState(page: AlgebraOperation): AlgebraState {
  return { ...initialAlgebraState(page.engine), operation: page.operation };
}
export function operationPresets(page: AlgebraOperation) {
  // A preset changes the example, never the operation named in the URL.
  return presets[page.engine].map((p) => ({
    ...p,
    label:
      page.engine === 'vectors'
        ? ({ 'Head to tail': 'Two directions', Projection: 'Oblique vectors' }[
            p.label
          ] ?? p.label)
        : page.engine === 'matrices'
          ? ({
              'Compose transforms': 'Stretch & rotate',
              'Undo a shear': 'Shear',
            }[p.label] ?? p.label)
          : p.label,
    state: { ...p.state, operation: page.operation },
  }));
}
