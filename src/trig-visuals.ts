import { cosine, PI, sine } from './trig-math.ts';
import type { TrigFunction } from './types.ts';
export const trigFormat = (x: number) =>
  Math.abs(x) < 1e-14 ? '0' : Number(x.toPrecision(11)).toString();
export function trigGraph(
  item: TrigFunction,
  input: number | null = null,
  unit = 'radians',
  mini = false,
) {
  const [xmin, xmax, ymin, ymax] = item.graph,
    w = 640,
    h = 300,
    left = 52,
    right = 18,
    top = 22,
    bottom = 42;
  const px = (x: number) =>
      left + ((x - xmin) / (xmax - xmin)) * (w - left - right),
    py = (y: number) =>
      h - bottom - ((y - ymin) / (ymax - ymin)) * (h - top - bottom);
  let path = '',
    active = false,
    branch = null;
  for (let i = 0; i <= 800; i++) {
    const x = xmin + ((xmax - xmin) * i) / 800;
    let y;
    try {
      y = item.fn(x);
    } catch {
      active = false;
      continue;
    }
    const nextBranch = item.id === 'tan' ? Math.floor((x + PI / 2) / PI) : 0;
    if (!Number.isFinite(y) || y < ymin || y > ymax) {
      active = false;
      continue;
    }
    path += `${active && branch === nextBranch ? 'L' : 'M'}${px(x).toFixed(2)},${py(y).toFixed(2)} `;
    active = true;
    branch = nextBranch;
  }
  let marks = '';
  const xticks = item.inverse
    ? item.id === 'arctan'
      ? [-5, -2.5, 0, 2.5, 5]
      : [-1, -0.5, 0, 0.5, 1]
    : [-2 * PI, -PI, 0, PI, 2 * PI];
  const yticks = item.inverse
    ? item.id === 'arccos'
      ? [0, PI / 2, PI]
      : [-PI / 2, 0, PI / 2]
    : item.id === 'tan'
      ? [-4, -2, 0, 2, 4]
      : [-1, 0, 1];
  const angleLabel = (x: number) =>
    unit === 'degrees'
      ? `${Math.round((x * 180) / PI)}°`
      : x === 0
        ? '0'
        : `${x < 0 ? '−' : ''}${Math.abs(x) === 2 * PI ? '2π' : Math.abs(x) === PI ? 'π' : 'π/2'}`;
  for (const x of xticks)
    marks += `<line x1="${px(x)}" x2="${px(x)}" y1="${top}" y2="${h - bottom}" class="trig-gridline"/><text x="${px(x)}" y="${h - 20}" text-anchor="middle">${item.inverse ? x : angleLabel(x)}</text>`;
  for (const y of yticks)
    marks += `<line x1="${left}" x2="${w - right}" y1="${py(y)}" y2="${py(y)}" class="trig-gridline"/><text x="${left - 8}" y="${py(y) + 4}" text-anchor="end">${item.inverse ? angleLabel(y) : y}</text>`;
  if (item.id === 'tan')
    for (const x of [-1.5 * PI, -0.5 * PI, 0.5 * PI, 1.5 * PI])
      marks += `<line data-asymptote="true" x1="${px(x)}" x2="${px(x)}" y1="${top}" y2="${h - bottom}" stroke="#c49a50" stroke-dasharray="5 4"/>`;
  if (item.id === 'arctan')
    for (const y of [-PI / 2, PI / 2])
      marks += `<line data-asymptote="true" x1="${left}" x2="${w - right}" y1="${py(y)}" y2="${py(y)}" stroke="#c49a50" stroke-dasharray="5 4"/>`;
  let marker = '';
  if (input !== null) {
    try {
      const y = item.fn(input);
      if (input >= xmin && input <= xmax && y >= ymin && y <= ymax)
        marker = `<circle data-selected-point="true" cx="${px(input)}" cy="${py(y)}" r="5" fill="#c49a50" stroke="white" stroke-width="2"/>`;
    } catch {}
  }
  return `<svg viewBox="0 0 ${w} ${h}" ${mini ? 'aria-hidden="true"' : `role="img" aria-label="${item.name} graph; ${item.inverse ? 'vertical' : 'horizontal'} axis angles in ${unit}"`}>${marks}<line x1="${left}" x2="${w - right}" y1="${py(0)}" y2="${py(0)}" stroke="#aaa4ba"/><line x1="${px(0)}" x2="${px(0)}" y1="${top}" y2="${h - bottom}" stroke="#aaa4ba"/><path data-curve="true" d="${path}" fill="none" stroke="#8270c7" stroke-width="2.5"/>${marker}</svg>`;
}
export function unitCircle(angle: number) {
  const x = cosine(angle),
    y = sine(angle),
    cx = 170,
    cy = 155,
    r = 112,
    px = cx + r * x,
    py = cy - r * y;
  return `<svg viewBox="0 0 340 320" role="img" aria-label="Unit circle: cosine ${trigFormat(x)}, sine ${trigFormat(y)}"><line x1="30" x2="310" y1="${cy}" y2="${cy}" stroke="#d9d5e2"/><line x1="${cx}" x2="${cx}" y1="20" y2="290" stroke="#d9d5e2"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#c7bedf" stroke-width="2"/><path d="M${cx},${cy}H${px}V${py}Z" fill="#eee9f7"/><line x1="${cx}" x2="${px}" y1="${cy}" y2="${cy}" stroke="#8270c7" stroke-width="4"/><line x1="${px}" x2="${px}" y1="${cy}" y2="${py}" stroke="#c49a50" stroke-width="4"/><line x1="${cx}" x2="${px}" y1="${cy}" y2="${py}" stroke="#575063" stroke-width="2"/><circle cx="${px}" cy="${py}" r="5" fill="#575063"/><text x="308" y="148">x</text><text x="178" y="23">y</text><text x="${cx + r + 5}" y="173">1</text><text x="20" y="309" fill="#8270c7">cos θ = ${trigFormat(x)}</text><text x="180" y="309" fill="#a37b36">sin θ = ${trigFormat(y)}</text></svg>`;
}
