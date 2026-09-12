import {
  operationByKey,
  operationState,
  operationPresets,
} from '../algebra-operations.ts';
import type { AlgebraState } from '../linear-algebra-content.ts';
import { renderAlgebra } from '../linear-algebra-view.ts';
import { algebraCode } from '../algebra-code.ts';
import { updateCode } from '../code-highlight.ts';
export function initializeAlgebra() {
  const root = document.querySelector<HTMLElement>('[data-operation-page]');
  if (!root) return;
  const page = operationByKey(root.dataset.operationPage!);
  const id = page.engine,
    examples = operationPresets(page);
  let state = operationState(page),
    language: 'python' | 'js' = 'python';
  const form = root.querySelector<HTMLFormElement>('#la-controls')!;
  const fields = [...form.querySelectorAll<HTMLInputElement>('input')];
  const error = root.querySelector<HTMLElement>('#la-error')!;
  const visual = root.querySelector<HTMLElement>('#la-visual')!;
  const code = document.querySelector<HTMLElement>('#la-code')!;
  let drag: {
    pointer: number;
    handle: string;
    matrix: DOMMatrix;
    unit: number;
    extent: number;
  } | null = null;
  function render() {
    if (id === 'jacobians') {
      form.querySelector('[data-point-label="0"]')!.textContent =
        state.map === 'polar' ? 'Radius r' : 'x';
      form.querySelector('[data-point-label="1"]')!.textContent =
        state.map === 'polar' ? 'Angle θ (radians)' : 'y';
    }
    const output = renderAlgebra(
      id,
      state,
      drag ? { extent: drag.extent } : {},
    );
    visual.innerHTML = output.visual;
    root!.querySelector('#la-results')!.innerHTML = output.results;
    root!.querySelector('#la-status')!.textContent = output.summary;
    for (const key of ['delta', 't'] as const) {
      const label = form.querySelector(`#la-${key}-value`);
      if (label) label.textContent = String(state[key]);
    }
    updateCode(code, algebraCode(page, state, language), language);
    document.querySelector('#la-copy-status')!.textContent = '';
  }
  function syncControls() {
    fields.forEach((input) => {
      const group = input.dataset.group as 'a' | 'b' | 'u' | 'v' | undefined;
      input.value = String(
        group
          ? state[group][Number(input.dataset.index)]
          : state[input.dataset.scalar as 'k' | 't' | 'delta'],
      );
      input.removeAttribute('aria-invalid');
    });
    const map = form.querySelector<HTMLSelectElement>('#la-map');
    if (map) map.value = state.map;
    error.textContent = '';
    render();
  }
  function readControls() {
    const next: AlgebraState = structuredClone(state);
    const map = form.querySelector<HTMLSelectElement>('#la-map');
    if (map) next.map = map.value as AlgebraState['map'];
    let invalid = false;
    for (const input of fields) {
      const group = input.dataset.group as 'a' | 'b' | 'u' | 'v' | undefined;
      const scalar = input.dataset.scalar as 'k' | 't' | 'delta';
      const value = input.valueAsNumber;
      const valid =
        Number.isFinite(value) &&
        value >= Number(input.min) &&
        value <= Number(input.max);
      input.setAttribute('aria-invalid', String(!valid));
      if (!valid) {
        invalid = true;
        continue;
      }
      if (group) next[group][Number(input.dataset.index)] = value;
      else next[scalar] = value;
    }
    if (invalid) {
      error.textContent =
        'Enter a number within each field’s allowed range. The diagram and code show the last valid inputs.';
      return;
    }
    error.textContent = '';
    state = next;
    render();
  }
  const coordinates = (handle: string): [number, number] =>
    handle === 'a0'
      ? [state.a[0], state.a[2]]
      : handle === 'a1'
        ? [state.a[1], state.a[3]]
        : state[handle as 'u' | 'v'];
  function move(handle: string, x: number, y: number) {
    const round = (n: number) =>
      Math.max(-10, Math.min(10, Math.round(n * 100) / 100));
    const value: [number, number] = [round(x), round(y)];
    if (handle === 'a0' || handle === 'a1') {
      const column = handle === 'a0' ? 0 : 1;
      state.a[column] = value[0];
      state.a[column + 2] = value[1];
    } else state[handle as 'u' | 'v'] = value;
    syncControls();
  }
  visual.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || drag) return;
    const handle = (e.target as Element).closest<SVGCircleElement>(
      '[data-handle]',
    );
    const svg = handle?.ownerSVGElement,
      matrix = svg?.getScreenCTM();
    if (!handle || !svg || !matrix) return;
    e.preventDefault();
    drag = {
      pointer: e.pointerId,
      handle: handle.dataset.handle!,
      matrix: matrix.inverse(),
      unit: Number(svg.dataset.unit),
      extent: Number(svg.dataset.extent),
    };
    // Capture on the stable container: the SVG is replaced while results update.
    visual.setPointerCapture(e.pointerId);
    visual.classList.add('is-dragging');
  });
  visual.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.pointer) return;
    e.preventDefault();
    const point = new DOMPoint(e.clientX, e.clientY).matrixTransform(
      drag.matrix,
    );
    move(drag.handle, (point.x - 260) / drag.unit, (200 - point.y) / drag.unit);
  });
  function endDrag(e: PointerEvent) {
    if (!drag || drag.pointer !== e.pointerId) return;
    const handle = drag.handle;
    drag = null;
    if (visual.hasPointerCapture(e.pointerId))
      visual.releasePointerCapture(e.pointerId);
    visual.classList.remove('is-dragging');
    render();
    visual
      .querySelector<SVGCircleElement>(`[data-handle="${handle}"]`)
      ?.focus({ preventScroll: true });
  }
  visual.addEventListener('pointerup', endDrag);
  visual.addEventListener('pointercancel', endDrag);
  visual.addEventListener('lostpointercapture', endDrag);
  visual.addEventListener('keydown', (e) => {
    const handle = (e.target as Element).closest<SVGCircleElement>(
      '[data-handle]',
    );
    if (
      !handle ||
      !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)
    )
      return;
    e.preventDefault();
    const key = handle.dataset.handle!,
      [x, y] = coordinates(key),
      step = e.shiftKey ? 1 : 0.1;
    move(
      key,
      x + (e.key === 'ArrowRight' ? step : e.key === 'ArrowLeft' ? -step : 0),
      y + (e.key === 'ArrowUp' ? step : e.key === 'ArrowDown' ? -step : 0),
    );
    visual
      .querySelector<SVGCircleElement>(`[data-handle="${key}"]`)
      ?.focus({ preventScroll: true });
  });
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', readControls);
  form.addEventListener('change', readControls);
  root.querySelector('#la-reset')!.addEventListener('click', () => {
    state = operationState(page);
    syncControls();
  });
  root.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach((button) =>
    button.addEventListener('click', () => {
      state = {
        ...operationState(page),
        ...structuredClone(examples[Number(button.dataset.preset)].state),
      };
      syncControls();
    }),
  );
  document
    .querySelectorAll<HTMLButtonElement>('[data-la-language]')
    .forEach((button) =>
      button.addEventListener('click', () => {
        language = button.dataset.laLanguage as typeof language;
        document
          .querySelectorAll<HTMLButtonElement>('[data-la-language]')
          .forEach((b) => {
            const selected = b === button;
            b.classList.toggle('selected', selected);
            b.setAttribute('aria-pressed', String(selected));
          });
        updateCode(code, algebraCode(page, state, language), language);
        document.querySelector('#la-copy-status')!.textContent = '';
      }),
    );
  document
    .querySelector('#la-copy-code')!
    .addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent!);
        document.querySelector('#la-copy-status')!.textContent = 'Copied.';
      } catch {
        document.querySelector('#la-copy-status')!.textContent =
          'Could not copy automatically. Select and copy the code above.';
      }
    });
  readControls();
}
