import type { Distribution, Parameters } from './types.ts';
export const fmt = (v: number | string) =>
  typeof v === 'number'
    ? Number(v.toPrecision(5)).toLocaleString('en', {
        maximumFractionDigits: 5,
      })
    : v;
export function chart(
  d: Distribution,
  p: Parameters,
  cumulative = false,
  mini = false,
) {
  const [lo, hi] = d.range(p),
    w = mini ? 210 : 720,
    h = mini ? 85 : 250;
  const left = mini ? 3 : 48,
    right = w - 12,
    top = mini ? 8 : 16,
    bottom = h - (mini ? 5 : 32);
  const discrete = d.type === 'Discrete';
  const points = discrete
    ? [
        lo,
        ...Array.from(
          { length: Math.floor(hi) - Math.ceil(lo) + 1 },
          (_, i) => Math.ceil(lo) + i,
        ),
        hi,
      ]
    : Array.from({ length: 321 }, (_, i) => lo + ((hi - lo) * i) / 320);
  // Include exact uniform discontinuities, avoiding sloped edges at the support boundaries.
  if (d.id === 'uniform')
    points.push(p.a - (hi - lo) * 1e-9, p.a, p.b, p.b + (hi - lo) * 1e-9);
  if (d.plotKnots) points.push(...d.plotKnots(p));
  points.sort((a, b) => a - b);
  const ys = points.map((x) => (cumulative ? d.cdf(x, p) : d.density(x, p)));
  const max = cumulative ? 1.05 : Math.max(...ys) * 1.14 || 1;
  const X = (x: number) => left + ((x - lo) / (hi - lo)) * (right - left),
    Y = (y: number) => bottom - (y / max) * (bottom - top);
  let grid = '',
    plot = '';
  if (!mini) {
    for (let i = 0; i <= 4; i++) {
      const y = (max * i) / 4;
      grid += `<line x1="${left}" y1="${Y(y)}" x2="${right}" y2="${Y(y)}" class="grid-line"/><text x="${left - 10}" y="${Y(y) + 4}" text-anchor="end">${fmt(y)}</text>`;
    }
    for (let i = 0; i <= 4; i++) {
      const x = lo + ((hi - lo) * i) / 4;
      grid += `<text x="${X(x)}" y="${h - 10}" text-anchor="middle">${fmt(x)}</text>`;
    }
  } else
    grid = `<line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" class="grid-line"/>`;
  if (discrete && !cumulative) {
    const bw = Math.max(1, ((right - left) / (hi - lo)) * 0.58);
    plot = points
      .map(
        (x, i) =>
          `<rect x="${X(x) - bw / 2}" y="${Y(ys[i])}" width="${bw}" height="${bottom - Y(ys[i])}" rx="1" fill="${d.color}" opacity=".75"><title>P(X = ${x}) = ${fmt(ys[i])}</title></rect>`,
      )
      .join('');
  } else {
    let line = `M${X(points[0])},${Y(ys[0])}`;
    for (let i = 1; i < points.length; i++)
      line += discrete
        ? `H${X(points[i])}V${Y(ys[i])}`
        : `L${X(points[i])},${Y(ys[i])}`;
    plot = `<path d="${line}L${X(points.at(-1)!)},${bottom}L${X(points[0])},${bottom}Z" fill="${d.color}" opacity=".09"/><path d="${line}" fill="none" stroke="${d.color}" stroke-width="${mini ? 2 : 2.6}" stroke-linejoin="round"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" ${mini ? 'aria-hidden="true"' : `role="img" aria-label="${d.name} ${cumulative ? 'cumulative probability' : discrete ? 'probability mass' : 'probability density'} graph"`}>${grid}${plot}</svg>`;
}
