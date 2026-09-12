import {
  easings,
  ease,
  initialEasingState,
  easingError,
  easingBounds,
  easingFormat,
  easingRates,
  easingRateFormat,
  easingValue,
  type EasingState,
} from '../easings.ts';
import {
  easingPlot,
  easingGraph,
  easingGraphState,
  easingResults,
  easingDerivativeResults,
  type EasingGraphMode,
  easingValueBounds,
  easingInterpolation,
  easingDerivativeOverlay,
} from '../easing-view.ts';
import { easingCode } from '../easing-code.ts';
import { updateCode } from '../code-highlight.ts';
export function initializeEasing() {
  const root = document.querySelector<HTMLElement>('[data-easing]');
  const e = easings.find((e) => e.id === root?.dataset.easing);
  if (!root || !e) return;
  const $ = <T extends HTMLElement = HTMLElement>(s: string) =>
    document.querySelector<T>(s)!;
  let state = initialEasingState(),
    language: 'js' | 'python' = 'js',
    frame = 0,
    playing = false,
    started = 0,
    pointer: number | null = null,
    graphKey = '',
    mode: EasingGraphMode = 'actual';
  const fields = [
      ...document.querySelectorAll<HTMLInputElement>('[data-easing-input]'),
    ],
    graph = $('#easing-graph'),
    play = $<HTMLButtonElement>('#easing-play');
  function updateOverlays(renderValues = true) {
    const enabled = {
      velocity: $<HTMLInputElement>('#easing-show-velocity').checked,
      acceleration: $<HTMLInputElement>('#easing-show-acceleration').checked,
    };
    graph.querySelector('[data-easing-overlays]')!.innerHTML =
      easingDerivativeOverlay(e!, enabled, state, mode);
    $('#easing-overlay-note').hidden =
      !enabled.velocity && !enabled.acceleration;
    if (renderValues) render(false);
  }
  for (const key of ['velocity', 'acceleration'])
    $(`#easing-show-${key}`).addEventListener('change', () => updateOverlays());
  document
    .querySelectorAll<HTMLButtonElement>('[data-easing-mode]')
    .forEach((button) => {
      button.addEventListener('click', () => {
        mode = button.dataset.easingMode as EasingGraphMode;
        document
          .querySelectorAll<HTMLButtonElement>('[data-easing-mode]')
          .forEach((b) => {
            b.classList.toggle('selected', b === button);
            b.setAttribute('aria-pressed', String(b === button));
          });
        $('#easing-results').innerHTML = easingResults(e!, state, mode);
        $('#easing-derivative-results').innerHTML = easingDerivativeResults(
          e!,
          state,
          mode,
        );
        $('#easing-value-legend').textContent =
          mode === 'actual' ? 'Eased value' : 'Eased progress';
        $('#easing-linear-legend').textContent =
          mode === 'actual'
            ? 'Dashed: linear value'
            : 'Dashed: linear progress';
        $('#easing-velocity-label').textContent =
          mode === 'actual' ? 'Velocity · units/s' : 'Velocity E′(t)';
        $('#easing-acceleration-label').textContent =
          mode === 'actual' ? 'Acceleration · units/s²' : 'Acceleration E″(t)';
        $('#easing-axis-note').textContent =
          mode === 'actual'
            ? 'Horizontal: elapsed seconds. Left axis: your value, including the start and end values.'
            : 'Horizontal: time progress t from 0 to 1. Left axis: output progress E(t), independent of start, end, and duration.';
        render(false);
      });
    });
  function sync() {
    fields.forEach(
      (input) =>
        (input.value = String(
          state[input.dataset.easingInput as keyof EasingState],
        )),
    );
    $<HTMLInputElement>('#easing-scrub').value = String(state.t);
  }
  function render(full = true) {
    if (!playing) play.textContent = state.t >= 1 ? 'Replay' : 'Play';
    const plotted = easingGraphState(state, mode);
    const nextKey = [state.start, state.end, state.duration, mode].join(',');
    if (nextKey !== graphKey) {
      graphKey = nextKey;
      graph.innerHTML = easingGraph(e!, state.t, false, state, mode);
      updateOverlays(false);
    }
    const progress = ease(e!, state.t),
      [min, max] = easingBounds(e!),
      [valueMin, valueMax] = easingValueBounds(e!, plotted);
    const { width, height, left, right, top, bottom } = easingPlot;
    const x = left + state.t * (width - left - right),
      y =
        height -
        bottom -
        ((easingValue(e!, plotted) - valueMin) / (valueMax - valueMin)) *
          (height - top - bottom);
    const handle = graph.querySelector('[data-easing-handle]')!;
    handle.setAttribute('cx', String(x));
    handle.setAttribute('cy', String(y));
    handle.setAttribute('aria-valuenow', String(state.t));
    handle.setAttribute(
      'aria-valuetext',
      `${easingFormat(state.t * plotted.duration)} ${mode === 'actual' ? 'seconds; value' : 'time progress; output progress'} ${easingFormat(easingValue(e!, plotted))}`,
    );
    const guide = graph.querySelector('.curve-evaluation-guide')!;
    guide.setAttribute('x1', String(x));
    guide.setAttribute('x2', String(x));
    const values = [
      state.t * plotted.duration,
      progress,
      state.start + (state.end - state.start) * progress,
    ];
    $('#easing-results')
      .querySelectorAll('output')
      .forEach((output, i) => (output.textContent = easingFormat(values[i])));
    const rates = easingRates(e!, plotted);
    $('#easing-derivative-results')
      .querySelectorAll('output')
      .forEach(
        (output, i) => (output.textContent = easingRateFormat(rates[i])),
      );
    graph
      .querySelectorAll<SVGCircleElement>('[data-easing-rate-marker]')
      .forEach((marker) => {
        const value =
          rates[marker.dataset.easingRateMarker === 'velocity' ? 0 : 1];
        const limit = Number(marker.dataset.limit);
        const visible =
          value !== null && Number.isFinite(value) && Math.abs(value) <= limit;
        marker.style.display = visible ? '' : 'none';
        marker.removeAttribute('hidden');
        if (visible) {
          marker.setAttribute('cx', String(x));
          marker.setAttribute(
            'cy',
            String(
              top + ((limit - value!) / (2 * limit)) * (height - top - bottom),
            ),
          );
        }
      });
    $('#easing-motion')
      .querySelectorAll<HTMLElement>('.easing-dot')
      .forEach(
        (dot, i) =>
          (dot.style.left = `${5 + (90 * ((i ? state.t : progress) - min)) / (max - min)}%`),
      );
    $<HTMLInputElement>('#easing-t').value = easingFormat(state.t);
    $<HTMLInputElement>('#easing-scrub').value = String(state.t);
    if (full) {
      $('#easing-interpolation').innerHTML = easingInterpolation(state);
      updateCode($('#easing-code'), easingCode(e!, state, language), language);
      $('#easing-copy-status').textContent = '';
    }
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    playing = false;
    play.textContent = state.t >= 1 ? 'Replay' : 'Play';
  }
  function tick(now: number) {
    if (!playing) return;
    state.t = Math.max(
      0,
      Math.min(1, (now - started) / (state.duration * 1000)),
    );
    render(false);
    if (state.t >= 1) {
      stop();
      render();
      $('#easing-status').textContent = 'Playback complete.';
    } else frame = requestAnimationFrame(tick);
  }
  function read() {
    stop();
    const entered = fields.map((input) => input.value);
    const next = { ...state };
    let bad = false;
    for (const input of fields) {
      const value = input.valueAsNumber;
      input.setAttribute('aria-invalid', String(!input.validity.valid));
      if (!input.validity.valid) bad = true;
      next[input.dataset.easingInput as keyof EasingState] = value;
    }
    const error = easingError(next);
    if (bad || error) {
      $('#easing-error').textContent =
        (error || 'Enter a value within the allowed range.') +
        ' The preview and code show the last valid inputs.';
      play.disabled = true;
      render();
      fields.forEach((input, i) => (input.value = entered[i]));
      return;
    }
    state = next;
    $('#easing-error').textContent = '';
    play.disabled = false;
    render();
  }
  $('#easing-controls').addEventListener('submit', (event) =>
    event.preventDefault(),
  );
  fields.forEach((input) => input.addEventListener('input', read));
  $('#easing-scrub').addEventListener('input', (event) => {
    $<HTMLInputElement>('#easing-t').value = (
      event.target as HTMLInputElement
    ).value;
    read();
  });
  play.addEventListener('click', () => {
    if (playing) {
      stop();
      render();
      $('#easing-status').textContent = 'Playback paused.';
      return;
    }
    if (state.t >= 1) state.t = 0;
    playing = true;
    play.textContent = 'Pause';
    started = performance.now() - state.t * state.duration * 1000;
    frame = requestAnimationFrame(tick);
    $('#easing-status').textContent =
      'Playing the easing and linear comparison.';
  });
  $('#easing-reset').addEventListener('click', () => {
    stop();
    state = initialEasingState();
    fields.forEach((f) => f.removeAttribute('aria-invalid'));
    $('#easing-error').textContent = '';
    play.disabled = false;
    sync();
    render();
  });
  function setTime(t: number) {
    stop();
    state.t = Math.max(0, Math.min(1, Math.round(t * 1000) / 1000));
    $('#easing-error').textContent = '';
    play.disabled = false;
    fields.forEach((f) => f.removeAttribute('aria-invalid'));
    sync();
    render();
  }
  function localPoint(event: PointerEvent) {
    const svg = graph.querySelector('svg')!,
      matrix = svg.getScreenCTM();
    return matrix
      ? new DOMPoint(event.clientX, event.clientY).matrixTransform(
          matrix.inverse(),
        )
      : null;
  }
  function move(event: PointerEvent) {
    const point = localPoint(event);
    if (point)
      setTime(
        (point.x - easingPlot.left) /
          (easingPlot.width - easingPlot.left - easingPlot.right),
      );
  }
  graph.addEventListener('pointerdown', (event) => {
    if (event.button !== 0 || pointer !== null) return;
    const point = localPoint(event);
    if (
      !point ||
      point.x < easingPlot.left ||
      point.x > easingPlot.width - easingPlot.right ||
      point.y < easingPlot.top ||
      point.y > easingPlot.height - easingPlot.bottom
    )
      return;
    event.preventDefault();
    pointer = event.pointerId;
    graph.setPointerCapture(pointer);
    move(event);
  });
  graph.addEventListener('pointermove', (event) => {
    if (pointer !== event.pointerId) return;
    event.preventDefault();
    move(event);
  });
  const end = (event: PointerEvent) => {
    if (pointer !== event.pointerId) return;
    pointer = null;
    if (graph.hasPointerCapture(event.pointerId))
      graph.releasePointerCapture(event.pointerId);
    graph
      .querySelector<SVGCircleElement>('[data-easing-handle]')
      ?.focus({ preventScroll: true });
  };
  graph.addEventListener('pointerup', end);
  graph.addEventListener('pointercancel', end);
  graph.addEventListener('lostpointercapture', end);
  graph.addEventListener('keydown', (event) => {
    if (
      !(event.target as Element).matches('[data-easing-handle]') ||
      ![
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Home',
        'End',
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    setTime(
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? 1
          : state.t +
            (['ArrowLeft', 'ArrowDown'].includes(event.key) ? -1 : 1) *
              (event.shiftKey ? 0.1 : 0.01),
    );
  });
  document
    .querySelectorAll<HTMLButtonElement>('[data-easing-language]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        language = button.dataset.easingLanguage as typeof language;
        document
          .querySelectorAll<HTMLButtonElement>('[data-easing-language]')
          .forEach((b) => {
            b.classList.toggle('selected', b === button);
            b.setAttribute('aria-pressed', String(b === button));
          });
        stop();
        render();
      }),
    );
  $('#easing-copy').addEventListener('click', async () => {
    stop();
    render();
    try {
      await navigator.clipboard.writeText($('#easing-code').textContent!);
      $('#easing-copy-status').textContent = 'Copied.';
    } catch {
      $('#easing-copy-status').textContent = 'Select and copy the code above.';
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stop();
      render();
    }
  });
  window.addEventListener('pagehide', stop);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  reduced.addEventListener('change', () => {
    if (reduced.matches) {
      stop();
      render();
    }
  });
  read();
}
