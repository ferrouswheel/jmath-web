import {
  bezier,
  polynomial,
  curveResult,
  curveFormat,
  type Curve,
  type CurveState,
} from './curves.ts';

export const curvePlot = {
  width: 640,
  height: 400,
  left: 60,
  right: 22,
  top: 25,
  bottom: 42,
};
export function curveGraph(curve: Curve, state: CurveState, mini = false) {
  const { width: w, height: h, left, right, top, bottom } = curvePlot;
  const parametric = curve.id === 'bezier';
  const samples = Array.from({ length: 241 }, (_, i) => {
    const t = i / 240;
    return parametric
      ? bezier(state.points, t).point
      : [-5 + 10 * t, polynomial(state.coefficients, -5 + 10 * t).value];
  });
  const xmin = parametric ? -6 : -5,
    xmax = parametric ? 6 : 5;
  const values = samples.map((p) => p[1]);
  const low = Math.min(0, ...values),
    high = Math.max(0, ...values),
    pad = Math.max(1, (high - low) * 0.12);
  const ymin = parametric ? -6 : low - pad,
    ymax = parametric ? 6 : high + pad;
  const px = (x: number) =>
    left + ((x - xmin) / (xmax - xmin)) * (w - left - right);
  const py = (y: number) =>
    h - bottom - ((y - ymin) / (ymax - ymin)) * (h - top - bottom);
  const pair = (p: number[]) => `${px(p[0]).toFixed(2)},${py(p[1]).toFixed(2)}`;
  const line = (a: number[], b: number[], css: string) =>
    `<line x1="${px(a[0])}" y1="${py(a[1])}" x2="${px(b[0])}" y2="${py(b[1])}" class="${css}"/>`;
  let grid = '';
  if (!mini)
    for (let i = 0; i <= 4; i++) {
      const x = xmin + ((xmax - xmin) * i) / 4,
        y = ymin + ((ymax - ymin) * i) / 4;
      grid +=
        line([x, ymin], [x, ymax], 'curve-gridline') +
        line([xmin, y], [xmax, y], 'curve-gridline');
      grid += `<text x="${px(x)}" y="${h - 17}" text-anchor="middle">${curveFormat(x)}</text><text x="${left - 9}" y="${py(y) + 4}" text-anchor="end">${curveFormat(y)}</text>`;
    }
  let construction = '';
  if (parametric && !mini) {
    const levels = bezier(state.points, state.input).levels;
    construction = levels
      .slice(0, -1)
      .map(
        (row, level) =>
          `<polyline points="${row.map(pair).join(' ')}" class="${level === 0 ? 'curve-polygon' : 'curve-construction'}"/>`,
      )
      .join('');
  }
  const result = curveResult(curve, state);
  const dx = (result.derivative[0] / (xmax - xmin)) * (w - left - right);
  const dy = (-result.derivative[1] / (ymax - ymin)) * (h - top - bottom);
  const length = Math.hypot(dx, dy);
  const tangent =
    length > 0 && !mini
      ? `<line x1="${px(result.point[0]) - (dx / length) * 34}" y1="${py(result.point[1]) - (dy / length) * 34}" x2="${px(result.point[0]) + (dx / length) * 34}" y2="${py(result.point[1]) + (dy / length) * 34}" class="curve-tangent"/>`
      : '';
  const controls =
    parametric && !mini
      ? state.points
          .map(
            (p, i) =>
              `<g><circle data-point="${i}" cx="${px(p[0])}" cy="${py(p[1])}" r="9" class="curve-handle"/><text x="${px(p[0]) + 12}" y="${py(p[1]) - 12}">P${i}</text></g>`,
          )
          .join('')
      : '';
  return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="${curve.name} curve${mini ? '' : '; highlighted point and tangent'}" class="curve-svg" style="--curve-color:${curve.color}">
    ${grid}${line([xmin, 0], [xmax, 0], 'curve-axis')}${line([0, ymin], [0, ymax], 'curve-axis')}
    ${construction}<polyline points="${samples.map(pair).join(' ')}" class="curve-path"/>${tangent}${controls}
    ${mini ? '' : `<circle cx="${px(result.point[0])}" cy="${py(result.point[1])}" r="5" class="curve-selected"/><text x="${w - 16}" y="${py(0) - 8}">x</text><text x="${px(0) + 10}" y="17">y</text>`}
  </svg>`;
}
