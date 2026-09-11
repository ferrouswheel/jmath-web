import type { Experiment } from './experiments.ts';
const percent = (x: number) => `${(x * 100).toFixed(2)}%`;
export function empiricalChart(
  theory: Experiment['theory'],
  frequencies: number[],
  total: number,
  label: (x: number) => string,
  axisLabel: string,
) {
  const w = Math.max(720, theory.outcomes.length * 16 + 70),
    h = 290,
    left = 50,
    right = w - 18,
    top = 20,
    bottom = 245;
  const max = Math.min(
    1,
    Math.max(
      ...theory.probabilities,
      ...frequencies.map((n: number) => (total ? n / total : 0)),
    ) * 1.15,
  );
  const Y = (p: number) => bottom - ((bottom - top) * p) / max,
    step = (right - left) / theory.outcomes.length,
    bw = step * 0.62;
  let elements = '';
  for (let i = 0; i <= 4; i++) {
    const p = (max * i) / 4;
    elements += `<line class="grid-line" x1="${left}" y1="${Y(p)}" x2="${right}" y2="${Y(p)}"/><text x="${left - 8}" y="${Y(p) + 4}" text-anchor="end">${(100 * p).toFixed(1)}%</text>`;
  }
  const every = Math.max(1, Math.ceil(theory.outcomes.length / 22));
  theory.outcomes.forEach((outcome, i: number) => {
    const x = left + (i + 0.5) * step,
      p = total ? frequencies[i] / total : 0,
      expected = theory.probabilities[i];
    elements += `<rect x="${x - bw / 2}" y="${Y(p)}" width="${bw}" height="${bottom - Y(p)}" rx="2" fill="#8272d2"><title>${label(outcome)}: ${frequencies[i]} observed (${percent(p)}); theoretical ${percent(expected)}</title></rect><line x1="${x - bw * 0.65}" y1="${Y(expected)}" x2="${x + bw * 0.65}" y2="${Y(expected)}" stroke="#bc8c3d" stroke-width="3"/>`;
    if (i % every === 0 || i === theory.outcomes.length - 1)
      elements += `<text x="${x}" y="${bottom + 19}" text-anchor="middle">${label(outcome)}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" style="min-width:${Math.max(300, theory.outcomes.length * 16 + 70)}px" role="img" aria-label="Observed proportions and theoretical probabilities by outcome. ${total.toLocaleString()} completed trials. Exact values are available in the frequency table.">${elements}<text x="${(left + right) / 2}" y="${h - 3}" text-anchor="middle">${axisLabel}</text></svg>`;
}
