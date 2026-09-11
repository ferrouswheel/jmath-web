import { updateCode } from '../code-highlight.ts';
import { $, $$, errorMessage } from '../dom.ts';
import { PI } from '../trig-math.ts';
import { trigSnippet } from '../trig-snippets.ts';
import { trigFormat, trigGraph, unitCircle } from '../trig-visuals.ts';
import { evaluateTrig } from '../trigonometry.ts';
import type { TrigFunction } from '../types.ts';
export function renderTrigPage(requested: TrigFunction | null) {
  if (!requested) {
    return;
  }
  const item = requested;

  const query = new URLSearchParams(location.search);
  let unit = query.get('unit') === 'degrees' ? 'degrees' : 'radians',
    language = 'js';
  let input =
    query.has('x') && query.get('x')!.trim() !== ''
      ? Number(query.get('x'))
      : item.initial * (item.inverse || unit === 'radians' ? 1 : 180 / PI);
  if (!Number.isFinite(input))
    input = item.initial * (item.inverse || unit === 'radians' ? 1 : 180 / PI);
  let codeInput = item.initial;
  function renderCode() {
    updateCode(
      $('#trig-code'),
      trigSnippet(item, language, codeInput),
      language,
    );
    $$('[data-trig-language]').forEach((b) => {
      const active = b.dataset.trigLanguage! === language;
      b.setAttribute('aria-pressed', String(active));
      b.classList.toggle('selected', active);
    });
    $('#trig-copy-status').textContent = '';
  }
  function update(save = true) {
    const degrees = unit === 'degrees',
      factor = degrees ? 180 / PI : 1;
    $('#trig-unit').value = unit;
    if (document.activeElement !== $('#trig-input'))
      $('#trig-input').value = String(Number.isFinite(input) ? input : '');
    $('#trig-input-label').textContent = item.inverse
      ? 'Input x (dimensionless)'
      : `Angle θ (${unit})`;
    $('#trig-result-label').textContent = item.inverse
      ? `${item.id}(x) · ${unit}`
      : `${item.id}(θ)`;
    const min = item.graph[0] * (item.inverse ? 1 : factor),
      max = item.graph[1] * (item.inverse ? 1 : factor);
    $('#trig-slider').min = String(min);
    $('#trig-slider').max = String(max);
    $('#trig-slider').value = String(
      Math.max(min, Math.min(max, Number.isFinite(input) ? input : 0)),
    );
    $('#trig-slider-label').textContent =
      `Graph range: ${trigFormat(min)} to ${trigFormat(max)}${item.inverse ? '' : degrees ? '°' : ' rad'}`;
    const presets = item.inverse
      ? [-1, -0.5, 0, 0.5, 1]
      : [0, PI / 6, PI / 4, PI / 3, PI / 2, PI];
    const labels = item.inverse
      ? presets.map(String)
      : degrees
        ? ['0°', '30°', '45°', '60°', '90°', '180°']
        : ['0', 'π/6', 'π/4', 'π/3', 'π/2', 'π'];
    $('#trig-presets').innerHTML = presets
      .map(
        (v, i) =>
          `<button type="button" data-trig-value="${v * (item.inverse ? 1 : factor)}">${labels[i]}</button>`,
      )
      .join('');
    $$('[data-trig-value]').forEach((b) =>
      b.addEventListener('click', () => {
        input = Number(b.dataset.trigValue!);
        update();
      }),
    );
    let graphInput = null,
      result;
    try {
      result = evaluateTrig(item, input, unit);
      graphInput = item.inverse ? input : input / factor;
      codeInput = graphInput;
      $('#trig-error').textContent = '';
      $('#trig-result').textContent =
        trigFormat(result) + (item.inverse && degrees ? '°' : '');
      const angle = item.inverse ? item.fn(input) : graphInput;
      $('#trig-conversion').innerHTML =
        `<span>Radians</span><span>${trigFormat(angle)}</span><span>Degrees</span><span>${trigFormat((angle * 180) / PI)}°</span>`;
      $('#trig-circle').innerHTML = unitCircle(angle);
      $('#trig-angle-note').textContent = item.inverse
        ? 'The circle shows the principal angle.'
        : 'The circle shows the angle modulo one full turn; the calculator uses the entered angle.';
      const y = item.fn(graphInput);
      $('#trig-offscreen').textContent =
        graphInput < item.graph[0] ||
        graphInput > item.graph[1] ||
        y < item.graph[2] ||
        y > item.graph[3]
          ? 'The selected point is outside the displayed graph window.'
          : '';
      $('#trig-copy').disabled = false;
      renderCode();
    } catch (error) {
      $('#trig-error').textContent = Number.isFinite(input)
        ? errorMessage(error)
        : 'Enter a finite number.';
      $('#trig-result').textContent = 'Unavailable';
      $('#trig-conversion').textContent = '';
      $('#trig-circle').innerHTML =
        '<p>Enter a valid input to show the unit-circle point.</p>';
      $('#trig-angle-note').textContent = '';
      $('#trig-offscreen').textContent = '';
      $('#trig-code').textContent =
        'Enter a valid input to generate a runnable example.';
      $('#trig-copy').disabled = true;
    }
    $('#trig-graph').innerHTML = trigGraph(item, graphInput, unit);
    $('#trig-graph-caption').textContent = item.inverse
      ? `Horizontal axis: input x. Vertical axis: principal angle in ${unit}.${item.id === 'arctan' ? ' Dashed lines are the limiting angles ±π/2.' : ''}`
      : `Horizontal axis: angle in ${unit}. Vertical axis: ${item.id}(θ).${item.id === 'tan' ? ' Dashed lines are vertical asymptotes; branches are drawn separately.' : ''}`;
    if (save && Number.isFinite(input)) {
      const url = new URL(location.href);
      url.searchParams.set('x', String(input));
      url.searchParams.set('unit', unit);
      history.replaceState(null, '', url);
    }
  }
  $('#trig-input').addEventListener('input', (e) => {
    input = (e.target as HTMLInputElement).valueAsNumber;
    update();
  });
  $('#trig-slider').addEventListener('input', (e) => {
    input = Math.max(
      Number((e.target as HTMLInputElement).min),
      Math.min(
        Number((e.target as HTMLInputElement).max),
        Number((e.target as HTMLInputElement).value),
      ),
    );
    update();
  });
  $('#trig-unit').addEventListener('change', (e) => {
    const next = (e.target as HTMLInputElement).value;
    if (!item.inverse) input *= next === 'degrees' ? 180 / PI : PI / 180;
    unit = next;
    update();
  });
  $$('[data-trig-language]').forEach((b) =>
    b.addEventListener('click', () => {
      language = b.dataset.trigLanguage!;
      update(false);
    }),
  );
  $('#trig-copy').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText($('#trig-code').textContent);
      $('#trig-copy-status').textContent = 'Copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents($('#trig-code'));
      const selection = window.getSelection()!;
      selection.removeAllRanges();
      selection.addRange(range);
      $('#trig-copy-status').textContent =
        'Code selected. Press Ctrl+C or ⌘C to copy.';
    }
  });
  update(false);
  if (location.hash)
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
