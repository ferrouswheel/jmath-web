import type { AlgebraOperation } from './algebra-operations.ts';
import type { AlgebraState } from './linear-algebra-content.ts';
const rows = (a: number[]) => [
  [a[0], a[1]],
  [a[2], a[3]],
];
export function algebraCode(
  page: AlgebraOperation,
  s: AlgebraState,
  language: 'python' | 'js',
) {
  const op = page.operation,
    vector = page.engine === 'vectors';
  const needsV = vector
    ? !['scale', 'normalize', 'magnitude'].includes(op)
    : op === 'transform';
  const needsB =
    page.engine === 'hadamard' ||
    (page.engine === 'matrices' &&
      ['add', 'subtract', 'multiply'].includes(op));
  const py = language === 'python';
  const declare = (name: string, value: unknown) =>
    py
      ? `${name} = np.array(${JSON.stringify(value)}, dtype=float)`
      : `const ${name} = ${JSON.stringify(value)};`;
  const declarations = vector
    ? [declare('u', s.u)]
    : page.engine === 'jacobians'
      ? [declare('p', s.u)]
      : [declare('A', rows(s.a))];
  if (needsV) declarations.push(declare('v', s.v));
  if (needsB) declarations.push(declare('B', rows(s.b)));
  if (op === 'scale')
    declarations.push(py ? `k = ${s.k}` : `const k = ${s.k};`);
  let body = '',
    helpers = '';
  if (py) {
    if (vector) {
      body = (
        {
          add: 'result = u + v',
          subtract: 'result = u - v',
          scale: 'result = k * u',
          dot: 'result = np.dot(u, v)',
          magnitude: 'result = np.linalg.norm(u)',
          area: 'result = u[0] * v[1] - u[1] * v[0]',
          normalize:
            'length = np.linalg.norm(u)\nif length == 0:\n    raise ValueError("The zero vector has no direction")\nresult = u / length',
          project:
            'denominator = np.dot(v, v)\nif denominator == 0:\n    raise ValueError("Cannot project onto a zero vector")\nresult = np.dot(u, v) / denominator * v',
          angle:
            'denominator = np.linalg.norm(u) * np.linalg.norm(v)\nif denominator == 0:\n    raise ValueError("Angle is undefined for a zero vector")\ncosine = np.clip(np.dot(u, v) / denominator, -1, 1)\nresult = np.degrees(np.arccos(cosine))',
        } as Record<string, string>
      )[op];
    } else if (page.engine === 'jacobians') {
      const definitions =
        s.map === 'square'
          ? 'def f(p):\n    x, y = p\n    return np.array([x*x - y*y, 2*x*y])\n\ndef jacobian(p):\n    x, y = p\n    return np.array([[2*x, -2*y], [2*y, 2*x]])'
          : s.map === 'polar'
            ? 'def f(p):\n    r, theta = p\n    return np.array([r*np.cos(theta), r*np.sin(theta)])\n\ndef jacobian(p):\n    r, theta = p\n    return np.array([[np.cos(theta), -r*np.sin(theta)],\n                     [np.sin(theta), r*np.cos(theta)]])'
            : 'def f(p):\n    x, y = p\n    return np.array([x, y + x*x])\n\ndef jacobian(p):\n    x, y = p\n    return np.array([[1., 0.], [2*x, 1.]])';
      helpers = definitions;
      body = `J = jacobian(p)\nh = np.array([${s.delta}, ${s.delta}])\nprint("Exact:", f(p + h))\nprint("Local approximation:", f(p) + J @ h)\nresult = J`;
    } else if (page.engine === 'eigenvalues') {
      body =
        'values, vectors = np.linalg.eig(A)\n# Column i of vectors belongs to values[i].\n# Ordering and vector signs may differ from the diagram.\nfor i, value in enumerate(values):\n    print("Eigenvalue:", value, "eigenvector:", vectors[:, i])\n    assert np.allclose(A @ vectors[:, i], value * vectors[:, i])\nresult = values';
    } else {
      body = (
        {
          add: 'result = A + B',
          subtract: 'result = A - B',
          scale: 'result = k * A',
          multiply: 'result = A @ B  # B acts first',
          transform: 'result = A @ v',
          transpose: 'result = A.T',
          inverse:
            'if np.linalg.matrix_rank(A, tol=1e-12 * np.max(np.abs(A))) < 2:\n    raise ValueError("Matrix is singular at the working tolerance")\nresult = np.linalg.inv(A)',
          rank: 'result = np.linalg.matrix_rank(A, tol=1e-12 * np.max(np.abs(A)))',
          trace: 'result = np.trace(A)',
          determinants: 'result = np.linalg.det(A)',
          hadamard: 'result = A * B  # Entrywise product, not A @ B',
        } as Record<string, string>
      )[op];
    }
    return (
      [
        'import numpy as np',
        ...declarations,
        '',
        helpers,
        body,
        'print(result)',
      ]
        .filter((x, i, a) => x || a[i - 1] !== '')
        .join('\n') + '\n'
    );
  }
  const dot =
    'const dot = (a, b) => a.reduce((sum, x, i) => sum + x * b[i], 0);';
  const mv =
    'const apply = (A, v) => A.map(row => row.reduce((sum, x, i) => sum + x * v[i], 0));';
  const det = 'const det = ([[a, b], [c, d]]) => a * d - b * c;';
  const rank = `${det}\nconst rank = A => {\n  const size = Math.max(...A.flat().map(Math.abs));\n  return size === 0 ? 0 : Math.abs(det(A)) <= 1e-12 * size * size ? 1 : 2;\n};`;
  if (vector) {
    if (['dot', 'project', 'angle'].includes(op)) helpers = dot;
    body = (
      {
        add: 'const result = u.map((x, i) => x + v[i]);',
        subtract: 'const result = u.map((x, i) => x - v[i]);',
        scale: 'const result = u.map(x => k * x);',
        dot: 'const result = dot(u, v);',
        magnitude: 'const result = Math.hypot(...u);',
        area: 'const result = u[0] * v[1] - u[1] * v[0];',
        normalize:
          'const length = Math.hypot(...u);\nif (length === 0) throw new Error("The zero vector has no direction");\nconst result = u.map(x => x / length);',
        project:
          'const denominator = dot(v, v);\nif (denominator === 0) throw new Error("Cannot project onto a zero vector");\nconst result = v.map(x => x * dot(u, v) / denominator);',
        angle:
          'const denominator = Math.hypot(...u) * Math.hypot(...v);\nif (denominator === 0) throw new Error("Angle is undefined for a zero vector");\nconst cosine = Math.max(-1, Math.min(1, dot(u, v) / denominator));\nconst result = Math.acos(cosine) * 180 / Math.PI;',
      } as Record<string, string>
    )[op];
  } else if (page.engine === 'jacobians') {
    helpers =
      mv +
      '\n' +
      (s.map === 'square'
        ? 'const f = ([x, y]) => [x*x - y*y, 2*x*y];\nconst jacobian = ([x, y]) => [[2*x, -2*y], [2*y, 2*x]];'
        : s.map === 'polar'
          ? 'const f = ([r, t]) => [r*Math.cos(t), r*Math.sin(t)];\nconst jacobian = ([r, t]) => [[Math.cos(t), -r*Math.sin(t)], [Math.sin(t), r*Math.cos(t)]];'
          : 'const f = ([x, y]) => [x, y + x*x];\nconst jacobian = ([x, y]) => [[1, 0], [2*x, 1]];');
    body = `const result = jacobian(p);\nconst h = [${s.delta}, ${s.delta}];\nconsole.log("Exact:", f(p.map((x, i) => x + h[i])));\nconsole.log("Local approximation:", f(p).map((x, i) => x + apply(result, h)[i]));`;
  } else if (page.engine === 'eigenvalues') {
    helpers = det;
    body = `const [[a, b], [c, d]] = A;
const trace = a + d;
const discriminant = (a - d) ** 2 + 4 * b * c;
const tolerance = 1e-12 * Math.max(...A.flat().map(Math.abs)) ** 2;
let result;
if (discriminant < -tolerance) {
  // Complex conjugate eigenvalues; no real eigenvectors.
  const real = trace / 2, imag = Math.sqrt(-discriminant) / 2;
  result = [{ real, imag }, { real, imag: -imag }];
} else {
  const repeated = Math.abs(discriminant) <= tolerance;
  const q = (trace + (trace >= 0 ? 1 : -1) * Math.sqrt(Math.max(0, discriminant))) / 2;
  const values = repeated ? [trace / 2, trace / 2] : [q, det(A) / q];
  const scalar = Math.max(Math.abs(b), Math.abs(c), Math.abs(a - d)) <= 1e-12 * Math.max(...A.flat().map(Math.abs));
  result = values.map((value, i) => {
    const first = [b, value - a], second = [value - d, c];
    const v = scalar ? (i === 0 ? [1, 0] : [0, 1]) : Math.hypot(...first) > Math.hypot(...second) ? first : second;
    return { value, vector: v.map(x => x / Math.hypot(...v)) };
  });
  // In the defective repeated case the two vectors are dependent.
}`;
  } else {
    if (op === 'transform') helpers = mv;
    if (op === 'determinants') helpers = det;
    if (['rank', 'inverse'].includes(op)) helpers = rank;
    body = (
      {
        add: 'const result = A.map((row, i) => row.map((x, j) => x + B[i][j]));',
        subtract:
          'const result = A.map((row, i) => row.map((x, j) => x - B[i][j]));',
        scale: 'const result = A.map(row => row.map(x => k * x));',
        multiply:
          'const result = A.map(row => B[0].map((_, j) =>\n  row.reduce((sum, x, k) => sum + x * B[k][j], 0)));',
        transform: 'const result = apply(A, v);',
        transpose: 'const result = A[0].map((_, j) => A.map(row => row[j]));',
        inverse:
          'if (rank(A) < 2) throw new Error("Matrix is singular at the working tolerance");\nconst [[a, b], [c, d]] = A;\nconst result = [[d, -b], [-c, a]].map(row => row.map(x => x / det(A)));',
        rank: 'const result = rank(A);',
        trace: 'const result = A.reduce((sum, row, i) => sum + row[i], 0);',
        determinants: 'const result = det(A);',
        hadamard:
          'const result = A.map((row, i) => row.map((x, j) => x * B[i][j]));',
      } as Record<string, string>
    )[op];
  }
  return (
    [...declarations, '', helpers, body, 'console.log(result);']
      .filter((x, i, a) => x || a[i - 1] !== '')
      .join('\n') + '\n'
  );
}
