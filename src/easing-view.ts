import { curveTicks } from './curve-visuals.ts';
import katex from 'katex';
import {
  ease,
  easingBounds,
  easingFormat as fmt,
  easingValue,
  easingRates,
  easingRateFormat,
  initialEasingState,
  type Easing,
  type EasingState,
} from './easings.ts';
export const easingMath = (tex: string) =>
  katex.renderToString(tex, {
    displayMode: true,
    throwOnError: true,
    trust: false,
  });
const baseFormula: Record<string, string> = {
  linear: 't',
  quadratic: 't^2',
  cubic: 't^3',
  quartic: 't^4',
  quintic: 't^5',
  sine: String.raw`1-\cos\!\left(\frac{\pi t}{2}\right)`,
  exponential: String.raw`\begin{cases}0&t=0\\2^{10t-10}&0<t\le1\end{cases}`,
  circular: String.raw`1-\sqrt{1-t^2}`,
  back: String.raw`2.70158t^3-1.70158t^2`,
  elastic: String.raw`\begin{cases}0&t=0\\1&t=1\\-2^{10t-10}\sin\!\left(\frac{2\pi}{3}(10t-10.75)\right)&0<t<1\end{cases}`,
  bounce: String.raw`1-b(1-t)`,
};
export function easingFormula(e: Easing) {
  const power = { quadratic: 2, cubic: 3, quartic: 4, quintic: 5 }[
    e.family as 'quadratic'
  ];
  if (e.family === 'linear') return easingMath('E(t)=t');
  if (power) {
    const formula =
      e.direction === 'in'
        ? `t^{${power}}`
        : e.direction === 'out'
          ? `1-(1-t)^{${power}}`
          : String.raw`\begin{cases}2^{${power - 1}}t^{${power}}&0\le t<\frac12\\1-\frac{(2-2t)^{${power}}}{2}&\frac12\le t\le1\end{cases}`;
    return easingMath(`E(t)=${formula}`);
  }
  if (e.family === 'sine')
    return easingMath(
      'E(t)=' +
        (e.direction === 'in'
          ? baseFormula.sine
          : e.direction === 'out'
            ? String.raw`\sin\!\left(\frac{\pi t}{2}\right)`
            : String.raw`\frac{1-\cos(\pi t)}2`),
    );
  const transform =
    e.direction === 'in'
      ? 'g(t)'
      : e.direction === 'out'
        ? '1-g(1-t)'
        : String.raw`\begin{cases}\frac{g(2t)}2&0\le t<\frac12\\1-\frac{g(2-2t)}2&\frac12\le t\le1\end{cases}`;
  const main =
    e.direction === 'in'
      ? easingMath(`E(t)=${baseFormula[e.family]}`)
      : easingMath(`E(t)=${transform}`) +
        easingMath(`g(t)=${baseFormula[e.family]}`);
  return (
    main +
    (e.family === 'bounce'
      ? easingMath(
          String.raw`b(t)=\begin{cases}\frac{121}{16}t^2&0\le t<\frac4{11}\\\frac{121}{16}(t-\frac6{11})^2+\frac34&\frac4{11}\le t<\frac8{11}\\\frac{121}{16}(t-\frac9{11})^2+\frac{15}{16}&\frac8{11}\le t<\frac{10}{11}\\\frac{121}{16}(t-\frac{21}{22})^2+\frac{63}{64}&\frac{10}{11}\le t\le1\end{cases}`,
        )
      : '')
  );
}
export const easingPlot = {
  width: 700,
  height: 380,
  left: 62,
  right: 84,
  top: 26,
  bottom: 52,
};
export type EasingGraphMode = 'actual' | 'normalized';
export const easingGraphState = (
  s: EasingState,
  mode: EasingGraphMode,
): EasingState =>
  mode === 'actual' ? s : { ...s, start: 0, end: 1, duration: 1 };
export function easingValueBounds(e: Easing, s: EasingState) {
  if (s.start === s.end) {
    const pad = Math.max(1, Math.abs(s.start) * 0.1);
    return [s.start - pad, s.start + pad];
  }
  const values = easingBounds(e).map((p) => s.start + (s.end - s.start) * p);
  return [Math.min(...values), Math.max(...values)];
}
export function easingGraph(
  e: Easing,
  t = 0.35,
  mini = false,
  state = initialEasingState(),
  mode: EasingGraphMode = 'actual',
) {
  const normalized = mini || mode === 'normalized';
  const s = {
    ...easingGraphState(state, normalized ? 'normalized' : 'actual'),
    t,
  };
  const { width: w, height: h, left, right, top, bottom } = easingPlot;
  const [min, max] = easingValueBounds(e, s),
    x = (t: number) => left + t * (w - left - right),
    y = (v: number) =>
      h - bottom - ((v - min) / (max - min)) * (h - top - bottom);
  const value = (t: number) => easingValue(e, { ...s, t });
  const path = Array.from(
    { length: 401 },
    (_, i) => `${x(i / 400).toFixed(2)},${y(value(i / 400)).toFixed(2)}`,
  ).join(' ');
  let grid = '';
  if (!mini) {
    const times = [
      0,
      ...curveTicks(0, s.duration)
        .map((t) => t.value)
        .filter((v) => v > s.duration * 0.07 && v < s.duration * 0.93),
      s.duration,
    ];
    for (const v of times)
      grid += `<line x1="${x(v / s.duration)}" y1="${top}" x2="${x(v / s.duration)}" y2="${h - bottom}" class="curve-gridline"/><text data-easing-time-tick x="${x(v / s.duration)}" y="${h - 30}" text-anchor="middle">${fmt(v)}</text>`;
    const endpoints = [...new Set([s.start, s.end])];
    const ticks = [
      ...endpoints,
      ...curveTicks(min, max)
        .map((t) => t.value)
        .filter((v) =>
          endpoints.every((p) => Math.abs(v - p) > (max - min) * 0.09),
        ),
    ].sort((a, b) => a - b);
    for (const v of ticks)
      grid += `<line x1="${left}" y1="${y(v)}" x2="${w - right}" y2="${y(v)}" class="curve-gridline"/><text data-easing-value-tick x="${left - 10}" y="${y(v) + 4}" text-anchor="end">${fmt(v).replace('-', '−')}</text>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" class="curve-svg easing-svg" role="${mini ? 'img' : 'group'}" aria-label="${e.name}: ${normalized ? 'output progress against normalized time' : 'value against elapsed seconds'}" style="--curve-color:${e.color}">${grid}<line x1="${x(0)}" y1="${y(s.start)}" x2="${x(1)}" y2="${y(s.end)}" stroke="#a9b0be" stroke-dasharray="6 5"/>${mini ? '' : '<g data-easing-overlays></g>'}<polyline points="${path}" class="curve-path"/>${mini ? '' : `<circle data-easing-start cx="${x(0)}" cy="${y(s.start)}" r="4" class="curve-selected"><title>Start: ${fmt(s.start)}</title></circle><circle data-easing-end cx="${x(1)}" cy="${y(s.end)}" r="4" class="curve-selected"><title>End: ${fmt(s.end)}</title></circle><line x1="${x(t)}" y1="${top}" x2="${x(t)}" y2="${h - bottom}" class="curve-evaluation-guide"/><circle cx="${x(t)}" cy="${y(value(t))}" r="9" class="curve-selected curve-evaluation" tabindex="0" data-easing-handle role="slider" aria-label="Time progress; drag or use arrow keys" aria-valuemin="0" aria-valuemax="1" aria-valuenow="${t}" aria-valuetext="${fmt(t * s.duration)} ${normalized ? 'time progress; output progress' : 'seconds; value'} ${fmt(value(t))}"/><text x="${w / 2}" y="${h - 7}" text-anchor="middle">${normalized ? 'Time progress t' : 'Elapsed time · seconds'}</text><text x="${left}" y="16">${normalized ? 'Output progress E(t)' : 'Value · units'}</text>`}</svg>`;
}
export function easingResults(
  e: Easing,
  s: EasingState,
  mode: EasingGraphMode = 'actual',
) {
  const progress = ease(e, s.t);
  return `<div><span>${mode === 'actual' ? 'Elapsed · seconds' : 'Time progress t'}</span><output>${fmt(mode === 'actual' ? s.t * s.duration : s.t)}</output></div><div><span>Normalised output E(t)</span><output>${fmt(progress)}</output></div><div><span>Actual value · units</span><output>${fmt(easingValue(e, s))}</output></div>`;
}
export function easingInterpolation(s: EasingState) {
  return easingMath(
    String.raw`x(\tau)=(${fmt(s.start)})+(${fmt(s.end - s.start)})E\!\left(\frac{\tau}{${fmt(s.duration)}}\right)`,
  );
}
export function easingMotion(e: Easing, s: EasingState) {
  const [min, max] = easingBounds(e),
    position = (v: number) => 5 + (90 * (v - min)) / (max - min);
  const track = (name: string, progress: number, linear = false) =>
    `<div class="easing-motion-row"><span>${name}</span><div class="easing-track"><span class="easing-endpoint" style="left:${position(0)}%">Start</span><span class="easing-endpoint" style="left:${position(1)}%">End</span><span class="easing-dot${linear ? ' easing-dot-linear' : ''}" style="left:${position(progress)}%"></span></div></div>`;
  return track(e.name, ease(e, s.t)) + track('Linear', s.t, true);
}

export interface EasingOverlays {
  velocity: boolean;
  acceleration: boolean;
}
export function easingDerivativeOverlay(
  e: Easing,
  enabled: EasingOverlays,
  state = initialEasingState(),
  mode: EasingGraphMode = 'actual',
) {
  if (!enabled.velocity && !enabled.acceleration) return '';
  state = easingGraphState(state, mode);
  const { width, height, left, right, top, bottom } = easingPlot;
  const samples = Array.from({ length: 801 }, (_, i) => {
    const t = i / 800;
    return { t, rates: easingRates(e, { ...state, t }) };
  });
  const magnitudes = samples.flatMap((s) =>
    s.rates
      .filter(
        (v, i) =>
          (i === 0 ? enabled.velocity : enabled.acceleration) &&
          v !== null &&
          Number.isFinite(v),
      )
      .map((v) => Math.abs(v!)),
  );
  let largest = Math.max(1, ...magnitudes);
  // Keep the circular singularity from flattening the rest of the graph.
  if (e.family === 'circular')
    largest = Math.max(
      1,
      Math.min(
        largest,
        Math.max(
          enabled.velocity
            ? (20 * Math.abs(state.end - state.start)) / state.duration
            : 0,
          enabled.acceleration
            ? (100 * Math.abs(state.end - state.start)) / state.duration ** 2
            : 0,
        ),
      ),
    );
  const power = 10 ** Math.floor(Math.log10(largest));
  const limit = [1, 2, 5, 10].find((n) => n * power >= largest)! * power;
  const x = (t: number) => left + t * (width - left - right);
  const y = (v: number) =>
    top + ((limit - v) / (2 * limit)) * (height - top - bottom);
  const baseBreaks =
    e.family === 'bounce' ? [1 - 4 / 11, 1 - 8 / 11, 1 - 10 / 11] : [];
  const breaks =
    e.direction === 'in'
      ? baseBreaks
      : e.direction === 'out'
        ? baseBreaks.map((b) => 1 - b)
        : [
            ...baseBreaks.map((b) => b / 2),
            ...baseBreaks.map((b) => 1 - b / 2),
            0.5,
          ];
  let content = `<defs><clipPath id="easing-derivative-clip"><rect x="${left}" y="${top}" width="${width - left - right}" height="${height - top - bottom}"/></clipPath></defs>`;
  for (const v of [-limit, -limit / 2, 0, limit / 2, limit]) {
    content += `<text x="${width - right + 8}" y="${y(v) + 4}" class="easing-derivative-tick">${fmt(v).replace('-', '−')}</text>`;
  }
  content += `<text x="${width - right}" y="16" text-anchor="end">${mode === 'normalized' ? 'Derivatives · right axis' : enabled.velocity && enabled.acceleration ? 'units/s · units/s²' : enabled.velocity ? 'Velocity · units/s' : 'Acceleration · units/s²'}</text><line x1="${left}" y1="${y(0)}" x2="${width - right}" y2="${y(0)}" class="easing-derivative-zero"/>`;
  for (const [i, key] of ['velocity', 'acceleration'].entries()) {
    if (!enabled[key as keyof EasingOverlays]) continue;
    let path = '',
      pen = false,
      previous = -1;
    for (const sample of samples) {
      const v = sample.rates[i];
      if (v === null || !Number.isFinite(v)) {
        pen = false;
        previous = sample.t;
        continue;
      }
      const split = breaks.some((b) => b > previous && b <= sample.t);
      path += `${pen && !split ? 'L' : 'M'}${x(sample.t).toFixed(2)},${y(Math.max(-limit * 2, Math.min(limit * 2, v))).toFixed(2)} `;
      pen = true;
      previous = sample.t;
    }
    content += `<path data-easing-overlay="${key}" d="${path}" class="easing-derivative-path easing-${key}" clip-path="url(#easing-derivative-clip)"/><circle data-easing-rate-marker="${key}" r="5" class="easing-${key}" hidden data-limit="${limit}"/>`;
  }
  return content;
}
export function easingDerivativeResults(
  e: Easing,
  s: EasingState,
  mode: EasingGraphMode = 'actual',
) {
  const rates = easingRates(e, easingGraphState(s, mode));
  const labels = [
    mode === 'actual' ? 'Velocity · units/s' : 'Velocity E′(t)',
    mode === 'actual' ? 'Acceleration · units/s²' : 'Acceleration E″(t)',
  ];
  return labels
    .map(
      (label, i) =>
        `<div><span>${label}</span><output class="easing-${i % 2 === 0 ? 'velocity' : 'acceleration'}">${easingRateFormat(rates[i])}</output></div>`,
    )
    .join('');
}
