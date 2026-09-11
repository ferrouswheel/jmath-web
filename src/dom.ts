// Selectors for controls whose markup is owned by Astro. Fail close to a missing element.
interface Controls {
  '#color-copy-code': HTMLButtonElement;
  '#cancel-simulation': HTMLButtonElement;
  '#cards': HTMLElement;
  '#catalogue-intro': HTMLElement;
  '#catalogue-list': HTMLElement;
  '#catalogue-status': HTMLElement;
  '#code-algorithm': HTMLElement;
  '#code-note': HTMLElement;
  '#coin-odds': HTMLElement;
  '#color-adjust-error': HTMLElement;
  '#color-adjusted': HTMLCanvasElement;
  '#color-all-values': HTMLElement;
  '#color-channels': HTMLElement;
  '#color-chart': HTMLButtonElement;
  '#color-clip-high': HTMLOutputElement;
  '#color-clip-low': HTMLOutputElement;
  '#color-content': HTMLElement;
  '#color-converted': HTMLOutputElement;
  '#color-copy': HTMLButtonElement;
  '#color-copy-status': HTMLElement;
  '#color-download': HTMLButtonElement;
  '#color-file': HTMLInputElement;
  '#color-gamut': HTMLElement;
  '#color-hex': HTMLInputElement;
  '#color-hex-apply': HTMLButtonElement;
  '#color-histogram': HTMLElement;
  '#color-hub-example': HTMLCanvasElement;
  '#color-image-error': HTMLElement;
  '#color-image-info': HTMLElement;
  '#color-input-error': HTMLElement;
  '#color-operation': HTMLElement;
  '#color-original': HTMLCanvasElement;
  '#color-picker': HTMLInputElement;
  '#color-preview-hex': HTMLElement;
  '#color-reset': HTMLButtonElement;
  '#color-response': HTMLElement;
  '#color-scene': HTMLButtonElement;
  '#color-source': HTMLSelectElement;
  '#color-source-note': HTMLElement;
  '#color-swap': HTMLButtonElement;
  '#color-swatch': HTMLElement;
  '#color-target': HTMLSelectElement;
  '#color-working': HTMLSelectElement;
  '#copy-code': HTMLButtonElement;
  '#copy-sequence-code': HTMLButtonElement;
  '#copy-status': HTMLElement;
  '#copy-term': HTMLButtonElement;
  '#die-sides': HTMLInputElement;
  '#download': HTMLButtonElement;
  '#empirical-chart': HTMLElement;
  '#experiment-seed': HTMLInputElement;
  '#experiment-settings': HTMLFormElement;
  '#experiment-stats': HTMLElement;
  '#explorer': HTMLElement;
  '#export-experiment': HTMLButtonElement;
  '#formula': HTMLElement;
  '#frequency-rows': HTMLElement;
  '#generate-form': HTMLFormElement;
  '#generate-form button[type="submit"]': HTMLButtonElement;
  '#geometry-caption': HTMLElement;
  '#geometry-index': HTMLElement;
  '#geometry-limit': HTMLElement;
  '#heads-p': HTMLInputElement;
  '#heads-slider': HTMLInputElement;
  '#next-n': HTMLButtonElement;
  '#nth-label': HTMLElement;
  '#nth-value': HTMLOutputElement;
  '#parameter-error': HTMLElement;
  '#plot': HTMLElement;
  '#plot-explanation': HTMLElement;
  '#previous-n': HTMLButtonElement;
  '#prob-result': HTMLOutputElement;
  '#prob-x': HTMLInputElement;
  '#reset': HTMLButtonElement;
  '#reset-experiment': HTMLButtonElement;
  '#sample-size': HTMLInputElement;
  '#sample-status': HTMLElement;
  '#samples': HTMLElement;
  '#search': HTMLInputElement;
  '#seed': HTMLInputElement;
  '#sequence-cards': HTMLElement;
  '#sequence-code': HTMLElement;
  '#sequence-code-note': HTMLElement;
  '#sequence-code-status': HTMLElement;
  '#sequence-error': HTMLElement;
  '#sequence-figure': HTMLElement;
  '#sequence-n': HTMLInputElement;
  '#sequence-neighbors': HTMLElement;
  '#sequence-search': HTMLInputElement;
  '#sequence-search-status': HTMLElement;
  '#sequence-slider': HTMLInputElement;
  '#sequence-steps': HTMLElement;
  '#sequence-terms': HTMLElement;
  '#settings-error': HTMLElement;
  '#simulate': HTMLButtonElement;
  '#simulation-error': HTMLElement;
  '#simulation-form': HTMLFormElement;
  '#simulation-n': HTMLInputElement;
  '#simulation-status': HTMLElement;
  '#single-trial': HTMLButtonElement;
  '#snippet-code': HTMLElement;
  '#stats': HTMLElement;
  '#term-copy-status': HTMLElement;
  '#theory-link': HTMLAnchorElement;
  '#theory-relation': HTMLElement;
  '#trial-count': HTMLInputElement;
  '#trial-definition': HTMLElement;
  '#trial-items': HTMLElement;
  '#trial-result': HTMLElement;
  '#trig-angle-note': HTMLElement;
  '#trig-circle': HTMLElement;
  '#trig-code': HTMLElement;
  '#trig-code-note': HTMLElement;
  '#trig-conversion': HTMLElement;
  '#trig-copy': HTMLButtonElement;
  '#trig-copy-status': HTMLElement;
  '#trig-error': HTMLElement;
  '#trig-graph': HTMLElement;
  '#trig-graph-caption': HTMLElement;
  '#trig-input': HTMLInputElement;
  '#trig-input-label': HTMLElement;
  '#trig-offscreen': HTMLElement;
  '#trig-presets': HTMLElement;
  '#trig-result': HTMLOutputElement;
  '#trig-result-label': HTMLElement;
  '#trig-slider': HTMLInputElement;
  '#trig-slider-label': HTMLElement;
  '#trig-unit': HTMLSelectElement;
  '.filters': HTMLElement;
  'meta[name="description"]': HTMLMetaElement;
}
type Selected<S extends string> = S extends keyof Controls
  ? Controls[S]
  : S extends
        | `[data-param=${string}`
        | `[data-range=${string}`
        | `#adjust-${string}`
        | `#color-channel-${string}`
    ? HTMLInputElement
    : HTMLElement;
export function $<S extends string>(selector: S): Selected<S> {
  const element = document.querySelector(selector);
  if (!element) throw new Error(`Missing page element: ${selector}`);
  return element as Selected<S>;
}
export function $$<T extends HTMLElement = HTMLElement>(
  selector: string,
): NodeListOf<T> {
  return document.querySelectorAll<T>(selector);
}
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
