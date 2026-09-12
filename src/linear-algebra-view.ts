import katex from 'katex';
import {
  add,
  scale,
  dot,
  norm,
  det,
  trace,
  apply,
  transpose,
  multiply,
  hadamard,
  matrixAdd,
  matrixScale,
  inverse,
  rank,
  projection,
  angle,
  eigen,
  mapping,
  jacobian,
  numberText as n,
  type Vector,
  type Matrix,
} from './linear-algebra.ts';
import {
  algebraPages,
  type AlgebraId,
  type AlgebraState,
} from './linear-algebra-content.ts';
export const math = (tex: string) =>
  katex.renderToString(tex, {
    displayMode: true,
    throwOnError: true,
    trust: false,
  });
const vec = (v: Vector) =>
  String.raw`\begin{bmatrix}${n(v[0])}\\${n(v[1])}\end{bmatrix}`;
const mat = (a: Matrix) =>
  String.raw`\begin{bmatrix}${n(a[0])}&${n(a[1])}\\${n(a[2])}&${n(a[3])}\end{bmatrix}`;
const result = (title: string, tex: string, note = '') =>
  `<article class="la-result"><h3>${title}</h3><div class="la-math">${math(tex)}</div>${note ? `<p>${note}</p>` : ''}</article>`;
const fact = (title: string, value: string) =>
  `<div class="la-fact"><span>${title}</span><strong>${value}</strong></div>`;
const blue = '#527cb5',
  coral = '#be7459',
  green = '#528b70';
const esc = (s: string) =>
  s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
interface Arrow {
  from?: Vector;
  to: Vector;
  color: string;
  label?: string;
  dashed?: boolean;
  handle?: 'u' | 'v' | 'a0' | 'a1';
}
interface Curve {
  points: Vector[];
  color: string;
  dashed?: boolean;
  fill?: boolean;
}
function basePlot(
  title: string,
  arrows: Arrow[],
  curves: Curve[] = [],
  extra: Vector[] = [],
  lines: Vector[] = [],
  fixedExtent?: number,
) {
  const points = [
    ...arrows.flatMap((a) => [a.from ?? ([0, 0] as Vector), a.to]),
    ...curves.flatMap((c) => c.points),
    ...extra,
  ];
  const extent =
    fixedExtent ??
    Math.max(2, ...points.flatMap((p) => p.map(Math.abs))) * 1.25;
  const size = 520,
    h = 400,
    unit = 160 / extent,
    cx = 260,
    cy = 200;
  const xy = ([x, y]: Vector) => `${cx + x * unit},${cy - y * unit}`;
  const rawStep = extent / 4,
    magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 5, 10].find((v) => v * magnitude >= rawStep)! * magnitude;
  let grid = '';
  for (let i = -4; i <= 4; i++) {
    const v = i * step;
    if (Math.abs(v) > extent) continue;
    const x = cx + v * unit,
      y = cy - v * unit;
    grid += `<path d="M${x} 25V375 M30 ${y}H490" stroke="${i === 0 ? '#aab1bf' : '#e9ecf1'}" fill="none"/>`;
    if (i)
      grid += `<text x="${x}" y="${cy + 17}" text-anchor="middle">${n(v)}</text><text x="${cx - 8}" y="${y - 5}" text-anchor="end">${n(v)}</text>`;
  }
  const labelBoxes: { x: number; y: number; w: number }[] = [];
  const labels: string[] = [];
  function placeLabel(a: Arrow, x: number, y: number) {
    if (!a.label) return;
    const w = a.label.length * 7.5 + 6;
    const candidates = [
      [9, -9],
      [9, 19],
      [-w - 9, -9],
      [-w - 9, 19],
      [9, -31],
      [9, 41],
      [-w - 9, -31],
      [-w - 9, 41],
    ];
    const positions = candidates.map(([dx, dy]) => ({
      x: Math.max(8, Math.min(size - w - 8, x + dx)),
      y: Math.max(20, Math.min(h - 12, y + dy)),
      w,
    }));
    const position =
      positions.find((p) =>
        labelBoxes.every(
          (b) => p.x + w < b.x || b.x + b.w < p.x || Math.abs(p.y - b.y) > 18,
        ),
      ) ?? positions[0];
    labelBoxes.push(position);
    labels.push(
      `<text class="la-arrow-label" style="fill:${a.color}" x="${position.x}" y="${position.y}">${esc(a.label)}</text>`,
    );
  }
  const arrow = (a: Arrow) => {
    const from = a.from ?? [0, 0],
      dx = (a.to[0] - from[0]) * unit,
      dy = -(a.to[1] - from[1]) * unit;
    const length = Math.hypot(dx, dy),
      x = cx + a.to[0] * unit,
      y = cy - a.to[1] * unit;
    const ux = length ? dx / length : 0,
      uy = length ? dy / length : 0;
    placeLabel(a, x, y);
    return `<line x1="${cx + from[0] * unit}" y1="${cy - from[1] * unit}" x2="${x}" y2="${y}" stroke="${a.color}" stroke-width="2.5" ${a.dashed ? 'stroke-dasharray="6 4"' : ''}/>${length > 1 ? `<polygon points="${x},${y} ${x - 9 * ux + 4 * uy},${y - 9 * uy - 4 * ux} ${x - 9 * ux - 4 * uy},${y - 9 * uy + 4 * ux}" fill="${a.color}"/>` : `<circle cx="${x}" cy="${y}" r="4" fill="${a.color}"/>`}`;
  };
  return `<svg data-extent="${extent}" data-unit="${unit}" viewBox="0 0 ${size} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title>${grid}<text x="486" y="${cy - 9}">x</text><text x="${cx + 10}" y="22">y</text>${lines.map((v) => `<line x1="${cx - v[0] * 180}" y1="${cy + v[1] * 180}" x2="${cx + v[0] * 180}" y2="${cy - v[1] * 180}" stroke="${green}" stroke-dasharray="5 5" opacity="0.5"/>`).join('')}${curves.map((c) => `<${c.fill ? 'polygon' : 'polyline'} points="${c.points.map(xy).join(' ')}" fill="${c.fill ? c.color : 'none'}" fill-opacity="0.12" stroke="${c.color}" stroke-width="2" ${c.dashed ? 'stroke-dasharray="5 4"' : ''}/>`).join('')}${arrows.map(arrow).join('')}${labels.join('')}${arrows
    .filter((a) => a.handle)
    .map(
      (a) =>
        `<circle class="la-drag-handle" data-handle="${a.handle}" cx="${cx + a.to[0] * unit}" cy="${cy - a.to[1] * unit}" r="9" fill="white" stroke="${a.color}" stroke-width="2.5" tabindex="0" role="button" aria-label="Move ${a.handle === 'a0' ? 'first column of A' : a.handle === 'a1' ? 'second column of A' : 'vector ' + a.handle}; drag or use arrow keys" />`,
    )
    .join('')}</svg>`;
}
const square: Vector[] = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 1],
  [0, 0],
];
const panel = (title: string, svg: string, caption: string) =>
  `<section class="la-plot"><h2>${title}</h2>${svg}<p>${caption}</p></section>`;
function transformationPlot(
  a: Matrix,
  color: string,
  vector?: Vector,
  editable = false,
  extent?: number,
) {
  const arrows: Arrow[] = [
    {
      to: apply(a, [1, 0]),
      color: blue,
      label: 'Ae₁',
      handle: editable ? 'a0' : undefined,
    },
    {
      to: apply(a, [0, 1]),
      color: coral,
      label: 'Ae₂',
      handle: editable ? 'a1' : undefined,
    },
  ];
  if (vector)
    arrows.push(
      { to: vector, color: '#939baa', label: 'v', dashed: true, handle: 'v' },
      { to: apply(a, vector), color, label: 'Av' },
    );
  return basePlot(
    'Unit square and its image under the matrix',
    arrows,
    [
      { points: square, color: '#939baa', dashed: true },
      { points: square.map((p) => apply(a, p)), color, fill: true },
    ],
    [],
    [],
    extent,
  );
}
export function renderAlgebra(
  id: AlgebraId,
  s: AlgebraState,
  options: { extent?: number } = {},
): { visual: string; results: string; summary: string } {
  const plot = (
    title: string,
    arrows: Arrow[],
    curves: Curve[] = [],
    extra: Vector[] = [],
    lines: Vector[] = [],
  ) => basePlot(title, arrows, curves, extra, lines, options.extent);
  const transformPlot = (
    matrix: Matrix,
    color: string,
    vector?: Vector,
    editable = false,
  ) => transformationPlot(matrix, color, vector, editable, options.extent);
  const color = algebraPages.find((p) => p.id === id)!.color;
  const { a, b, u, v, k } = s;
  if (id === 'vectors') {
    const sum = add(u, v),
      difference = add(u, scale(-1, v)),
      proj = projection(u, v),
      theta = angle(u, v);
    const unary = ['scale', 'magnitude', 'normalize'].includes(s.operation);
    const arrows: Arrow[] = [{ to: u, color: blue, label: 'u', handle: 'u' }];
    if (!unary) arrows.push({ to: v, color: coral, label: 'v', handle: 'v' });
    const curves: Curve[] = [];
    let caption = '',
      selected = '';
    const angleResult = result(
      'Angle between the vectors',
      theta === null
        ? String.raw`\text{Undefined for a zero vector.}`
        : String.raw`\theta=\cos^{-1}\!\left(\frac{\mathbf u\cdot\mathbf v}{\|\mathbf u\|\|\mathbf v\|}\right)=${n(theta)}^\circ`,
    );
    if (s.operation === 'add') {
      arrows.push(
        { from: u, to: sum, color: coral, dashed: true },
        { to: sum, color: green, label: 'u + v' },
      );
      caption =
        'Slide v to the tip of u. The green arrow is the total displacement; the dashed arrow is the translated copy of v.';
      selected = result(
        'Addition',
        String.raw`\mathbf u+\mathbf v=${vec(u)}+${vec(v)}=${vec(sum)}`,
        'Add matching coordinates. Sliding an arrow does not change its length or direction.',
      );
    } else if (s.operation === 'subtract') {
      arrows.push(
        { to: difference, color: green, label: 'u − v' },
        { from: v, to: u, color: green, dashed: true },
      );
      caption =
        'The dashed arrow goes from the tip of v to the tip of u. The green arrow is the same displacement moved to the origin.';
      selected = result(
        'Subtraction',
        String.raw`\mathbf u-\mathbf v=${vec(u)}-${vec(v)}=${vec(difference)}`,
        'Subtract matching coordinates. Unlike addition, reversing the order reverses the result.',
      );
    } else if (s.operation === 'scale') {
      arrows.push({ to: scale(k, u), color: green, label: 'ku' });
      caption =
        'Green is the scaled vector. A negative k reverses the direction; k = 0 collapses the arrow to the origin.';
      selected =
        result(
          'Scalar multiplication',
          String.raw`k\mathbf u=${n(k)}${vec(u)}=${vec(scale(k, u))}`,
        ) +
        result(
          'Length after scaling',
          String.raw`\|k\mathbf u\|=|k|\|\mathbf u\|=${n(norm(scale(k, u)))}`,
        );
    } else if (s.operation === 'magnitude') {
      curves.push({
        points: [[0, 0], [u[0], 0], u],
        color: '#939baa',
        dashed: true,
      });
      caption =
        'The arrow is the hypotenuse of a right triangle whose horizontal and vertical legs are the coordinates.';
      selected = result(
        'Length of u',
        String.raw`\|\mathbf u\|=\sqrt{u_x^2+u_y^2}=\sqrt{(${n(u[0])})^2+(${n(u[1])})^2}=${n(norm(u))}`,
        'Lengths are nonnegative. Changing the signs of coordinates does not change this length.',
      );
    } else if (s.operation === 'normalize') {
      if (norm(u))
        arrows.push({
          to: scale(1 / norm(u), u),
          color: green,
          label: 'unit u',
        });
      curves.push({
        points: Array.from(
          { length: 81 },
          (_, i) =>
            [
              Math.cos((i * Math.PI) / 40),
              Math.sin((i * Math.PI) / 40),
            ] as Vector,
        ),
        color: '#939baa',
        dashed: true,
      });
      caption =
        'A normalized vector ends on the dashed unit circle. Its direction is unchanged.';
      selected = result(
        'Unit vector',
        norm(u)
          ? String.raw`\widehat{\mathbf u}=\frac{\mathbf u}{\|\mathbf u\|}=${vec(scale(1 / norm(u), u))}`
          : String.raw`\text{The zero vector has no unit direction.}`,
        'Divide each coordinate by the vector’s magnitude.',
      );
    } else if (s.operation === 'area') {
      curves.push({
        points: [[0, 0], u, sum, v, [0, 0]],
        color: green,
        fill: true,
      });
      caption =
        'The shaded parallelogram is spanned by u and v. Collinear arrows give zero area.';
      selected = result(
        'Signed area',
        String.raw`u_xv_y-u_yv_x=${n(det([u[0], v[0], u[1], v[1]]))}`,
        'Take the absolute value for ordinary area. The signed value is the 2D determinant, or the z-component of a 3D cross product with zero z inputs.',
      );
    } else if (s.operation === 'angle') {
      if (theta !== null) {
        const start = Math.atan2(u[1], u[0]),
          turn = Math.atan2(det([u[0], v[0], u[1], v[1]]), dot(u, v));
        const radius = Math.min(norm(u), norm(v)) * 0.4;
        curves.push({
          points: Array.from(
            { length: 41 },
            (_, i) =>
              [
                radius * Math.cos(start + (turn * i) / 40),
                radius * Math.sin(start + (turn * i) / 40),
              ] as Vector,
          ),
          color: green,
        });
      }
      caption =
        'The green arc marks the smaller angle between the vectors. A zero vector has no direction, so its angle is undefined.';
      selected = angleResult;
    } else {
      if (proj)
        arrows.push(
          { to: proj, color: green, label: 'projᵥ u' },
          { from: u, to: proj, color: '#939baa', dashed: true },
        );
      caption = proj
        ? 'The green arrow is the part of u along v. The dashed segment is perpendicular to v.'
        : 'Projection onto the zero vector is undefined because it has no direction.';
      selected =
        s.operation === 'dot'
          ? result(
              'Dot product',
              String.raw`\mathbf u\cdot\mathbf v=u_xv_x+u_yv_y=(${n(u[0])})(${n(v[0])})+(${n(u[1])})(${n(v[1])})=${n(dot(u, v))}`,
              'The result is a scalar. Its sign measures alignment, and its magnitude also depends on both vector lengths.',
            )
          : result(
              'Projection of u onto v',
              proj
                ? String.raw`\operatorname{proj}_{\mathbf v}\mathbf u=\frac{\mathbf u\cdot\mathbf v}{\mathbf v\cdot\mathbf v}\mathbf v=${vec(proj)}`
                : String.raw`\text{Undefined when }\mathbf v=\mathbf0`,
              'The result is a vector along the line of v. The perpendicular remainder is what the projection leaves out.',
            );
    }
    return {
      visual: panel(
        'Vectors on the plane',
        plot('Vector operation: ' + s.operation, arrows, curves),
        caption,
      ),
      results: selected,
      summary: `${s.operation}: u = (${u.map(n).join(', ')}), v = (${v.map(n).join(', ')}).`,
    };
  }
  if (id === 'jacobians') {
    const j = jacobian(s.map, u),
      origin = mapping(s.map, u),
      delta = s.delta;
    const grid: Curve[] = [],
      local: Curve[] = [],
      input: Curve[] = [];
    for (let axis = 0; axis < 2; axis++)
      for (let line = -2; line <= 2; line++) {
        const offsets: Vector[] = Array.from({ length: 41 }, (_, i) =>
          axis === 0
            ? [(line * delta) / 2, -delta + (2 * delta * i) / 40]
            : [-delta + (2 * delta * i) / 40, (line * delta) / 2],
        );
        input.push({ points: offsets.map((h) => add(u, h)), color: '#939baa' });
        grid.push({
          points: offsets.map((h) => mapping(s.map, add(u, h))),
          color,
        });
        local.push({
          points: offsets.map((h) => add(origin, apply(j, h))),
          color: '#939baa',
          dashed: true,
        });
      }
    const f =
      s.map === 'square'
        ? String.raw`F(x,y)=\begin{bmatrix}x^2-y^2\\2xy\end{bmatrix}`
        : s.map === 'polar'
          ? String.raw`F(r,\theta)=\begin{bmatrix}r\cos\theta\\r\sin\theta\end{bmatrix}`
          : String.raw`F(x,y)=\begin{bmatrix}x\\y+x^2\end{bmatrix}`;
    const symbolic =
      s.map === 'square'
        ? String.raw`\begin{bmatrix}2x&-2y\\2y&2x\end{bmatrix}`
        : s.map === 'polar'
          ? String.raw`\begin{bmatrix}\cos\theta&-r\sin\theta\\\sin\theta&r\cos\theta\end{bmatrix}`
          : String.raw`\begin{bmatrix}1&0\\2x&1\end{bmatrix}`;
    const h: Vector = [delta, delta],
      actual = mapping(s.map, add(u, h)),
      approximate = add(origin, apply(j, h));
    return {
      visual:
        panel(
          'Input neighbourhood',
          plot(
            'Grid around the evaluation point',
            [{ to: u, color, label: 'p', handle: 'u' }],
            input,
          )
            .replace('>x</text>', s.map === 'polar' ? '>r</text>' : '>x</text>')
            .replace(
              '>y</text>',
              s.map === 'polar' ? '>θ</text>' : '>y</text>',
            ),
          'A square grid around p. Half-width δ controls the size of the neighbourhood.',
        ) +
        panel(
          'Mapped grid & tangent approximation',
          plot(
            'Nonlinear mapped grid and Jacobian approximation',
            [{ to: origin, color, label: 'F(p)' }],
            [...local, ...grid],
          ),
          'Solid colour: exact nonlinear map. Dashed grey: F(p) + J(p)h. Reduce δ to compare them near the evaluation point.',
        ),
      results:
        result(
          'Nonlinear map',
          f,
          s.map === 'polar'
            ? 'The first input is radius r and the second is angle θ in radians. Negative r values give the signed-radius extension; conventional polar coordinates use r ≥ 0.'
            : '',
        ) +
        result('Jacobian at p', String.raw`J(p)=${symbolic}=${mat(j)}`) +
        result(
          'Local area scaling',
          String.raw`\det J(p)=${n(det(j))},\qquad |\det J(p)|=${n(Math.abs(det(j)))}`,
          'The absolute determinant is the infinitesimal area factor. A zero determinant means the derivative is singular; it does not imply the whole nonlinear image has zero area.',
        ) +
        result(
          'Check the corner h = (δ, δ)',
          String.raw`F(p+h)=${vec(actual)},\quad F(p)+J(p)h=${vec(approximate)}`,
        ) +
        result(
          'Approximation error at that corner',
          String.raw`\|F(p+h)-F(p)-J(p)h\|=${n(norm(add(actual, scale(-1, approximate))))}`,
          'Both plots have equal horizontal and vertical units, but their overall scales adjust independently.',
        ),
      summary: `Jacobian determinant ${n(det(j))}. Approximation error ${n(norm(add(actual, scale(-1, approximate))))}.`,
    };
  }
  if (id === 'eigenvalues') {
    const e = eigen(a),
      av = apply(a, v),
      intermediate = add(scale(1 - s.t, v), scale(s.t, av));
    const arrows: Arrow[] = [
      {
        to: v,
        color: '#939baa',
        dashed: true,
        handle: 'v',
        label: s.t === 0 ? '' : 'v',
      },
      { to: av, color: coral, dashed: true, label: s.t === 1 ? '' : 'Av' },
      {
        to: intermediate,
        color,
        label: s.t === 0 ? 'v' : s.t === 1 ? 'Av' : 'current',
      },
    ];
    e.vectors.forEach((direction, i) => {
      arrows.push(
        { to: direction, color: blue, label: `e${i === 0 ? '₁' : '₂'}` },
        {
          to: scale(e.values[i], direction),
          color: i ? coral : green,
          label: `λ${i === 0 ? '₁' : '₂'}e${i === 0 ? '₁' : '₂'}`,
        },
      );
    });
    const explanation =
      e.kind === 'complex'
        ? 'There are no real eigenvectors. The eigenvalues are a complex conjugate pair; no nonzero real direction is preserved.'
        : e.kind === 'scalar'
          ? 'Every nonzero vector is an eigenvector. The two coordinate directions below are just one choice of eigenbasis.'
          : e.kind === 'defective'
            ? 'The repeated eigenvalue has only one independent eigenvector. This matrix is not diagonalizable, even over the complex numbers.'
            : 'There are two distinct real eigenvalues and two independent eigendirections. The matrix is diagonalizable over the reals.';
    const valueTex =
      e.kind === 'complex'
        ? String.raw`\lambda_{1,2}=${n(e.values[0])}\pm ${n(e.imaginary)}i`
        : String.raw`\lambda_1=${n(e.values[0])},\quad\lambda_2=${n(e.values[1])}`;
    return {
      visual: panel(
        'Directions preserved by A',
        plot(
          'Eigenvectors and the transformation of an editable vector',
          arrows,
          [],
          [],
          e.vectors,
        ),
        'Dashed green lines mark real eigendirections. Move t from 0 to 1 to follow the straight interpolation (1 − t)v + tAv; this is not repeated matrix multiplication.',
      ),
      results:
        result(
          'Characteristic equation',
          String.raw`\det(A-\lambda I)=\lambda^2-(${n(trace(a))})\lambda+(${n(det(a))})=0`,
        ) +
        result('Eigenvalues', valueTex, explanation) +
        e.vectors
          .map((direction, i) =>
            result(
              `Eigenvector ${i + 1}`,
              String.raw`\mathbf e_${i + 1}=${vec(direction)},\quad A\mathbf e_${i + 1}=${vec(apply(a, direction))}`,
              'Any nonzero scalar multiple is also an eigenvector. Negative eigenvalues reverse direction; zero eigenvalues send the eigenvector to zero.',
            ),
          )
          .join('') +
        result(
          'Your test vector',
          String.raw`\mathbf v=${vec(v)},\quad A\mathbf v=${vec(av)}`,
          norm(v) === 0
            ? 'The zero vector is never an eigenvector.'
            : Math.abs(det([v[0], av[0], v[1], av[1]])) <=
                1e-10 * norm(v) ** 2 * Math.hypot(...a)
              ? 'Your nonzero vector lies on an eigendirection.'
              : 'Your vector changes direction: it is not an eigenvector.',
        ),
      summary:
        e.kind === 'complex'
          ? 'Complex conjugate eigenvalues. No real eigendirections.'
          : `Eigenvalues ${e.values.map(n).join(' and ')}. ${e.vectors.length} independent eigendirections shown.`,
    };
  }
  if (id === 'hadamard') {
    const h = hadamard(a, b),
      product = multiply(a, b);
    const cells = a
      .map(
        (x, i) =>
          `<div class="la-cell" style="--cell-color:${[blue, coral, green, '#8468ad'][i]}"><span>Row ${Math.floor(i / 2) + 1}, column ${(i % 2) + 1}</span>${math(String.raw`${n(x)}\times(${n(b[i])})=${n(h[i])}`)}</div>`,
      )
      .join('');
    return {
      visual:
        panel(
          'Input matrix A · drag its columns',
          transformPlot(a, color, undefined, true),
          'Drag either column vector to change the matching entries of A. The four products below update together.',
        ) +
        `<section class="la-plot"><h2>Four independent multiplications</h2><div class="la-cell-grid">${cells}</div><p>Match each entry of A with the entry in the same position in B. No row–column sums are involved.</p></section>` +
        panel(
          'Transformation defined by A ⊙ B',
          transformPlot(h, color)
            .replaceAll('Ae₁', 'He₁')
            .replaceAll('Ae₂', 'He₂'),
          'Here H = A ⊙ B. The result is still a matrix, so it can act on the plane. This transformation is generally different from applying B and then A.',
        ),
      results:
        result('Hadamard product', String.raw`A\odot B=${mat(h)}`) +
        result(
          'Ordinary matrix product for comparison',
          String.raw`AB=${mat(product)}`,
          'Ordinary multiplication composes linear maps and combines rows with columns.',
        ) +
        result(
          'Entry rule',
          String.raw`(A\odot B)_{ij}=A_{ij}B_{ij}`,
          'The matrices must have the same dimensions. Hadamard multiplication is commutative and associative. Its identity is the all-ones matrix, not the usual identity matrix.',
        ),
      summary: 'Hadamard product entries ' + h.map(n).join(', '),
    };
  }
  if (id === 'determinants') {
    const determinant = det(a),
      r = rank(a);
    return {
      visual: panel(
        'Signed area of the transformed unit square',
        transformPlot(a, color, undefined, true),
        'Blue is the first column of A; orange is the second. Together they span the coloured parallelogram. Dashed grey is the original unit square.',
      ),
      results:
        result(
          'Determinant',
          String.raw`\det A=ad-bc=(${n(a[0])})(${n(a[3])})-(${n(a[1])})(${n(a[2])})=${n(determinant)}`,
        ) +
        `<div class="la-facts">${fact('Area factor', n(Math.abs(determinant)))}${fact('Orientation', r < 2 ? 'Collapsed' : determinant < 0 ? 'Reversed' : 'Preserved')}</div>` +
        result(
          'Useful identities',
          String.raw`\det(AB)=\det A\det B,\quad\det(A^T)=\det A`,
          'A zero determinant means the columns are dependent and the map collapses the plane to a line or point. Very nearly singular matrices are classified using a relative numerical tolerance.',
        ),
      summary: `Determinant ${n(determinant)}. Rank ${r}. ${r === 2 ? 'Invertible' : 'Not invertible'}.`,
    };
  }
  if (s.operation === 'rank' || s.operation === 'trace') {
    const r = rank(a);
    return {
      visual: panel(
        'Columns of A',
        transformPlot(a, color, undefined, true),
        'Drag the blue and orange handles to change the columns of A and the transformation they define.',
      ),
      results:
        s.operation === 'rank'
          ? result(
              'Independent output directions',
              String.raw`\operatorname{rank}(A)=${r}`,
              r === 2
                ? 'The columns are independent, so the output fills a plane.'
                : r === 1
                  ? 'The columns lie on one line. Only one independent output direction remains.'
                  : 'Both columns are zero. Every input maps to zero.',
            ) +
            result(
              'Dimension lost',
              String.raw`\operatorname{nullity}(A)=2-\operatorname{rank}(A)=${2 - r}`,
              'Rank is calculated with a relative tolerance near dependent columns.',
            )
          : result(
              'Trace',
              String.raw`\operatorname{tr}(A)=a+d=${n(a[0])}+(${n(a[3])})=${n(trace(a))}`,
              'Add the diagonal entries, not every entry. Off-diagonal changes do not change the trace.',
            ) +
            result(
              'Sum of eigenvalues',
              String.raw`\operatorname{tr}(A)=\lambda_1+\lambda_2`,
              'This remains true for complex eigenvalues and repeated eigenvalues.',
            ),
      summary: s.operation === 'rank' ? `Rank ${r}.` : `Trace ${n(trace(a))}.`,
    };
  }
  let output: Matrix | null, formula: string, explanation: string;
  switch (s.operation) {
    case 'transform':
      output = a;
      formula = 'A';
      explanation =
        'Each output coordinate is the dot product of a matrix row with the input vector.';
      break;
    case 'add':
      output = matrixAdd(a, b);
      formula = 'A+B';
      explanation =
        'Add corresponding entries. On any vector v, (A + B)v = Av + Bv.';
      break;
    case 'subtract':
      output = matrixAdd(a, matrixScale(-1, b));
      formula = 'A-B';
      explanation =
        'Subtract corresponding entries. On any vector v, (A − B)v = Av − Bv.';
      break;
    case 'transpose':
      output = transpose(a);
      formula = 'A^T';
      explanation =
        'Swap rows and columns. Transposing twice returns the original matrix.';
      break;
    case 'inverse':
      output = inverse(a);
      formula = 'A^{-1}';
      explanation = output
        ? 'The inverse undoes A: A⁻¹A = I. It exists only when the determinant is nonzero.'
        : 'A is singular (within numerical tolerance), so no inverse exists. Independent input directions have been lost.';
      break;
    case 'scale':
      output = matrixScale(k, a);
      formula = `${n(k)}A`;
      explanation =
        'Scale every entry by k. This scales every output vector by k.';
      break;
    default:
      output = multiply(a, b);
      formula = 'AB';
      explanation =
        'With column vectors, AB means apply B first, then A. Matrix multiplication is generally not commutative.';
  }
  const sourceVisual = panel(
    'Input matrix A · drag its columns',
    transformPlot(a, color, v, true),
    'Hollow handles are editable. Drag the blue or orange column vector to change A; drag the grey vector to change v.',
  );
  const visual =
    sourceVisual +
    (s.operation === 'transform'
      ? ''
      : output
        ? panel(
            'The resulting linear transformation',
            transformPlot(output, color, v)
              .replaceAll('Ae₁', 'Re₁')
              .replaceAll('Ae₂', 'Re₂')
              .replaceAll('Av', 'Rv'),
            'R is the result matrix. Its columns are the images of the basis vectors. Dashed grey shows the original unit square and your vector v; the coloured arrow is Rv.',
          )
        : `<p class="la-empty">${explanation}</p>`);
  return {
    visual,
    results:
      result(
        'Result matrix R',
        output
          ? `${formula}=${mat(output)}`
          : String.raw`A^{-1}\text{ does not exist}`,
        explanation,
      ) +
      (output
        ? result(
            'Action on your vector',
            String.raw`R\mathbf v=${mat(output)}${vec(v)}=${vec(apply(output, v))}`,
          )
        : '') +
      (s.operation === 'multiply'
        ? result(
            'Reverse the order',
            String.raw`BA=${mat(multiply(b, a))}`,
            'Compare BA with AB above. They need not agree.',
          )
        : '') +
      (s.operation === 'multiply'
        ? result(
            'Matrix multiplication rule',
            String.raw`(AB)_{ij}=\sum_k A_{ik}B_{kj}`,
            'The inner dimensions must match. The entry in row i, column j is the dot product of row i of A and column j of B.',
          )
        : '') +
      (s.operation === 'inverse'
        ? result(
            'Inverse formula for 2 × 2 matrices',
            String.raw`A^{-1}=\frac{1}{ad-bc}\begin{bmatrix}d&-b\\-c&a\end{bmatrix}`,
            'Valid only when ad − bc ≠ 0.',
          )
        : '') +
      (s.operation === 'transpose'
        ? result(
            'Move a dot product across the map',
            String.raw`(A\mathbf x)\cdot\mathbf y=\mathbf x\cdot(A^T\mathbf y)`,
            'Transpose is generally not the inverse. They coincide for orthogonal matrices.',
          )
        : ''),
    summary: output
      ? 'Result matrix entries ' + output.map(n).join(', ')
      : 'This matrix has no inverse.',
  };
}
