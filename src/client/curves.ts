import {
  curves,
  curveFromSearch,
  curveSearch,
  curveUrl,
  curveError,
  curveResult,
  curveNote,
  curveSlope,
  curveFormat,
  initialCurveState,
  type CurveState,
  type Point,
} from '../curves.ts';
import { curveGraph, curvePlot } from '../curve-visuals.ts';
import { curveSnippet } from '../curve-snippets.ts';
import { updateCode } from '../code-highlight.ts';

export function initializeCurve() {
  const root = document.querySelector<HTMLElement>('[data-curve]');
  const curve = curves.find((c) => c.id === root?.dataset.curve);
  if (!root || !curve) return;
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) =>
    document.querySelector<T>(selector)!;
  const all = <T extends HTMLElement = HTMLElement>(selector: string) => [
    ...document.querySelectorAll<T>(selector),
  ];
  const parametric = curve.id === 'bezier';
  const initial = curveFromSearch(curve, location.search);
  let state = initial.state,
    language = 'js',
    drag: number | null = null;
  const graph = $('#curve-graph');
  const number = (input: HTMLInputElement) =>
    input.value.trim() === '' ? NaN : Number(input.value);

  function pointControls() {
    if (!parametric) return;
    $('#curve-point-controls').innerHTML = state.points
      .map(
        (p, i) =>
          `<fieldset class="curve-point-row"><legend>Point P${i}</legend>${p.map((n, axis) => `<label><span>${axis === 0 ? 'x' : 'y'}</span><input type="number" min="-5" max="5" step="any" value="${n}" data-point-input="${i}" data-axis="${axis}" aria-label="P${i} ${axis === 0 ? 'x' : 'y'}" /></label>`).join('')}</fieldset>`,
      )
      .join('');
    $<HTMLSelectElement>('#curve-degree').value = String(
      state.points.length - 1,
    );
  }
  function sync(force = false) {
    const set = (el: HTMLInputElement, value: number) => {
      if (force || document.activeElement !== el) el.value = String(value);
    };
    all<HTMLInputElement>('[data-coefficient]').forEach((el) =>
      set(el, state.coefficients[Number(el.dataset.coefficient)]),
    );
    all<HTMLInputElement>('[data-coefficient-range]').forEach((el) => {
      el.value = String(
        state.coefficients[Number(el.dataset.coefficientRange)],
      );
    });
    all<HTMLInputElement>('[data-point-input]').forEach((el) =>
      set(
        el,
        state.points[Number(el.dataset.pointInput)][Number(el.dataset.axis)],
      ),
    );
    set($<HTMLInputElement>('#curve-input'), state.input);
    $<HTMLInputElement>('#curve-position').value = String(state.input);
  }
  function render(save = true, force = false) {
    const result = curveResult(curve!, state);
    graph.innerHTML = curveGraph(curve!, state);
    $('#curve-point').textContent =
      `(${result.point.map(curveFormat).join(', ')})`;
    $('#curve-derivative').textContent = parametric
      ? `(${result.derivative.map(curveFormat).join(', ')})`
      : curveFormat(result.derivative[1]);
    $('#curve-slope').textContent = curveSlope(result.derivative);
    $('#curve-note').textContent = curveNote(curve!, state);
    updateCode(
      $('#curve-code'),
      curveSnippet(curve!, language, state),
      language,
    );
    $('#curve-copy-status').textContent = '';
    $('#curve-share-status').textContent = '';
    $('#curve-error').textContent = '';
    $('#curve-copy-code').removeAttribute('disabled');
    $('#curve-share').removeAttribute('disabled');
    sync(force);
    if (save)
      history.replaceState(
        null,
        '',
        `${curveUrl(curve!)}?${curveSearch(curve!, state)}${location.hash}`,
      );
  }
  function read(): CurveState {
    return {
      input: number($<HTMLInputElement>('#curve-input')),
      coefficients: all<HTMLInputElement>('[data-coefficient]').map(number),
      points: state.points.map((_, i) => [
        number($<HTMLInputElement>(`[data-point-input="${i}"][data-axis="0"]`)),
        number($<HTMLInputElement>(`[data-point-input="${i}"][data-axis="1"]`)),
      ]),
    };
  }
  $('#curve-controls').addEventListener('submit', (event) =>
    event.preventDefault(),
  );
  $('#curve-controls').addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    if (target.tagName !== 'INPUT') return;
    if (target.matches('[data-coefficient-range]'))
      $<HTMLInputElement>(
        `[data-coefficient="${target.dataset.coefficientRange}"]`,
      ).value = target.value;
    if (target.id === 'curve-position')
      $<HTMLInputElement>('#curve-input').value = target.value;
    const next = read(),
      error = curveError(curve, next);
    if (error) {
      $('#curve-error').textContent =
        `${error} The graph and code retain the last valid settings.`;
      $('#curve-copy-code').setAttribute('disabled', '');
      $('#curve-share').setAttribute('disabled', '');
      return;
    }
    state = next;
    render();
  });
  if (parametric)
    $('#curve-degree').addEventListener('change', (event) => {
      const input = state.input;
      state = initialCurveState(
        curve,
        Number((event.target as HTMLSelectElement).value),
      );
      state.input = input;
      pointControls();
      render(true, true);
    });
  $('#curve-reset').addEventListener('click', () => {
    state = initialCurveState(curve);
    pointControls();
    render(false, true);
    history.replaceState(null, '', curveUrl(curve));
  });
  all<HTMLButtonElement>('[data-curve-language]').forEach((button) =>
    button.addEventListener('click', () => {
      language = button.dataset.curveLanguage!;
      all<HTMLButtonElement>('[data-curve-language]').forEach((b) => {
        b.classList.toggle('selected', b === button);
        b.setAttribute('aria-pressed', String(b === button));
      });
      updateCode(
        $('#curve-code'),
        curveSnippet(curve, language, state),
        language,
      );
      $('#curve-copy-status').textContent = '';
    }),
  );
  $('#curve-copy-code').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#curve-code').textContent ?? '');
      $('#curve-copy-status').textContent = 'Copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#curve-code'));
      const selection = getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      $('#curve-copy-status').textContent =
        'Code selected. Press Ctrl+C or ⌘C to copy.';
    }
  });
  $('#curve-share').addEventListener('click', async () => {
    const url = `${location.origin}${curveUrl(curve)}?${curveSearch(curve, state)}`;
    try {
      await navigator.clipboard.writeText(url);
      $('#curve-share-status').textContent = 'Link copied.';
    } catch {
      $('#curve-share-status').textContent = `Copy this link: ${url}`;
    }
  });
  graph.addEventListener('pointerdown', (event) => {
    const handle = (event.target as Element).closest<SVGCircleElement>(
      '[data-point]',
    );
    if (!handle || !parametric || event.button !== 0) return;
    drag = Number(handle.dataset.point);
    graph.setPointerCapture(event.pointerId);
    event.preventDefault();
  });
  graph.addEventListener('pointermove', (event) => {
    if (drag === null) return;
    const svg = graph.querySelector('svg')!,
      matrix = svg.getScreenCTM();
    if (!matrix) return;
    const p = svg.createSVGPoint();
    p.x = event.clientX;
    p.y = event.clientY;
    const local = p.matrixTransform(matrix.inverse());
    const { width, height, left, right, top, bottom } = curvePlot;
    const clamp = (n: number) =>
      Math.round(Math.max(-5, Math.min(5, n)) * 100) / 100;
    const point: Point = [
      clamp(-6 + ((local.x - left) / (width - left - right)) * 12),
      clamp(6 - ((local.y - top) / (height - top - bottom)) * 12),
    ];
    state.points[drag] = point;
    render(true, true);
  });
  const stopDrag = () => {
    drag = null;
  };
  graph.addEventListener('pointerup', stopDrag);
  graph.addEventListener('pointercancel', stopDrag);
  graph.addEventListener('lostpointercapture', stopDrag);
  window.addEventListener('popstate', () => {
    const restored = curveFromSearch(curve, location.search);
    state = restored.state;
    pointControls();
    render(false, true);
    $('#curve-error').textContent = restored.error;
  });
  pointControls();
  render(false, true);
  $('#curve-error').textContent = initial.error;
}
