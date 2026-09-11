import { updateCode } from '../code-highlight.ts';
import { chart, fmt } from '../distribution-visuals.ts';
import {
  defaults,
  distributions,
  examplePoint,
  seededRandom,
  validate,
} from '../distributions.ts';
import { $, $$ } from '../dom.ts';
import {
  distributionAtPath,
  distributionUrl,
  isCataloguePath,
} from '../routes.ts';
import { algorithms, snippetSource } from '../snippets.ts';
let snippetLanguage = 'js';
const isDistributionPage = Boolean(distributionAtPath(location.pathname));
const selected = distributionAtPath(location.pathname) ?? distributions[0];
let values = selected ? defaults(selected) : {},
  filter = 'All',
  query = '',
  mode = 'density',
  samples: number[] = [],
  sampleInfo: {
    parameters: Record<string, number>;
    distribution: string;
    seed: string;
  } | null = null;

function renderCards() {
  const visible = distributions.filter(
    (d) =>
      (filter === 'All' || d.type === filter) &&
      `${d.name} ${d.alias} ${d.description} ${d.tags.join(' ')}`
        .toLowerCase()
        .includes(query),
  );
  const ids = new Set(visible.map((d) => d.id));
  $$('.distribution-card').forEach((card) => {
    card.hidden = !ids.has(card.dataset.id!);
  });
  $('#catalogue-empty').hidden = visible.length > 0;
  $('#catalogue-status').textContent =
    `Showing ${visible.length} of ${distributions.length} distributions · Select one to open its page`;
}
function renderExplorer() {
  const d = selected;
  $('#explorer').style.setProperty('--accent', d.color);
  $$<HTMLInputElement>('[data-param], [data-range]').forEach((el) =>
    el.addEventListener('input', () => updateParameter(el)),
  );
  $$('[data-mode]').forEach((el) =>
    el.addEventListener('click', () => {
      mode = el.dataset.mode!;
      $$('[data-mode]').forEach((b) => {
        b.classList.toggle('selected', b === el);
        b.setAttribute('aria-pressed', String(b === el));
      });
      updatePlot();
    }),
  );
  $('#reset').addEventListener('click', () => {
    values = defaults(d);
    samples = [];
    sampleInfo = null;
    for (const p of d.params) {
      $(`[data-param="${p.key}"]`).value = String(values[p.key]);
      $(`[data-range="${p.key}"]`).value = String(values[p.key]);
    }
    $('#parameter-error').textContent = '';
    $('#generate-form button[type="submit"]').disabled = false;
    $('#download').disabled = true;
    $('#samples').textContent = 'No samples generated.';
    $('#sample-status').textContent =
      'A fixed seed reproduces the sample sequence.';
    $('#prob-x').value = String(fmtInput(examplePoint(d, values)));
    updatePlot();
    updateStats();
    updateSnippet();
  });
  $('#generate-form').addEventListener('submit', generate);
  $('#download').addEventListener('click', download);
  $('#prob-x').addEventListener('input', updateProbability);
  $$('[data-language]').forEach((button) =>
    button.addEventListener('click', () => {
      snippetLanguage = button.dataset.language!;
      updateSnippet();
    }),
  );
  $('#copy-code').addEventListener('click', copySnippet);
  updatePlot();
  updateStats();
  updateSnippet();
}
const fmtInput = (n: number) => Number(n.toPrecision(6));
function updateParameter(el: HTMLInputElement) {
  const key = el.dataset.param! || el.dataset.range!;
  if (el.dataset.range!) $(`[data-param="${key}"]`).value = el.value;
  const next = Object.fromEntries(
    selected.params.map((p) => [
      p.key,
      $(`[data-param="${p.key}"]`).value === ''
        ? NaN
        : Number($(`[data-param="${p.key}"]`).value),
    ]),
  );
  const error = validate(selected, next);
  $('#parameter-error').textContent = error;
  $('#generate-form button[type="submit"]').disabled = !!error;
  if (error) {
    $('#parameter-error').textContent +=
      ' Preview retains the last valid parameters.';
    return;
  }
  values = next;
  for (const p of selected.params)
    $(`[data-range="${p.key}"]`).value = String(values[p.key]);
  samples = [];
  sampleInfo = null;
  $('#download').disabled = true;
  $('#samples').textContent = 'Parameters changed. Generate a new sample.';
  $('#sample-status').textContent =
    'A fixed seed reproduces the sample sequence.';
  updatePlot();
  updateStats();
  updateSnippet();
}
function updatePlot() {
  $('#plot').innerHTML = chart(selected, values, mode === 'cdf');
  $('#plot-explanation').textContent =
    mode === 'cdf'
      ? 'F(x) = P(X ≤ x) · cumulative probability'
      : selected.type === 'Discrete'
        ? 'Bar height gives the probability at each integer.'
        : 'Area under the curve represents probability.';
  $('#plot-explanation').textContent +=
    ' Finite plotting window; tails may extend beyond it.';
  if (selected.id === 'weibull' && values.shape < 1)
    $('#plot-explanation').textContent +=
      ' Density diverges at zero; the plot starts at the 0.5th percentile.';
  $('#formula').textContent =
    mode === 'cdf' ? 'F(x) = P(X ≤ x)' : selected.formula;
}
function updateStats() {
  $('#stats').innerHTML = Object.entries(selected.stats(values))
    .map(([k, v]) => `<div><span>${k}</span><strong>${fmt(v)}</strong></div>`)
    .join('');
  updateProbability();
}
function updateProbability() {
  const x = $('#prob-x').valueAsNumber;
  $('#prob-result').textContent = Number.isFinite(x)
    ? `${(selected.cdf(x, values) * 100).toFixed(4)}%`
    : 'Enter a value';
}
function generate(e: Event) {
  e.preventDefault();
  if (validate(selected, values) || $('#parameter-error').textContent) return;
  const n = $('#sample-size').valueAsNumber;
  if (!Number.isInteger(n) || n < 1 || n > 10000) return;
  const seed = $('#seed').value,
    rng = seed ? seededRandom(seed) : Math.random;
  samples = Array.from({ length: n }, () => selected.sample(values, rng));
  sampleInfo = { distribution: selected.id, parameters: { ...values }, seed };
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  $('#samples').textContent =
    samples.slice(0, 60).map(fmt).join(', ') +
    (n > 60 ? `\n… ${n - 60} more values in the CSV` : '');
  $('#sample-status').textContent =
    `${n.toLocaleString()} samples · Sample mean ${fmt(mean)}${seed ? ' · Seeded sequence' : ''}`;
  $('#download').disabled = false;
}
function download() {
  if (!samples.length || !sampleInfo) return;
  const csvCell = (v: string | number) =>
    '"' + String(v).replaceAll('"', '""') + '"';
  const parameters = Object.entries(sampleInfo.parameters)
    .map(([k, v]) => `${k}=${v}`)
    .join(';');
  const csv =
    'index,value,distribution,parameters\n' +
    samples
      .map((v, i) =>
        [i + 1, v, sampleInfo!.distribution, csvCell(parameters)].join(','),
      )
      .join('\n');
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' }),
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = `jmath-${sampleInfo!.distribution}-${samples.length}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Native links provide browser history, open-in-new-tab, and reloadable URLs.
function initializePage() {
  const legacy =
    isCataloguePath(location.pathname) &&
    distributions.find((d) => d.id === location.hash.slice(1));
  if (legacy) {
    location.replace(distributionUrl(legacy));
    return;
  }
  if (isDistributionPage) {
    const linkedValues = { ...values };
    for (const p of selected.params) {
      // Preserve edits made to the server-rendered controls before this module loads.
      const input = $(`[data-param="${p.key}"]`);
      const range = $(`[data-range="${p.key}"]`);
      const raw =
        input.value !== input.defaultValue
          ? input.value
          : range.value !== range.defaultValue
            ? range.value
            : new URLSearchParams(location.search).get(p.key);
      if (raw !== null)
        linkedValues[p.key] = raw.trim() === '' ? NaN : Number(raw);
    }
    if (!validate(selected, linkedValues)) values = linkedValues;

    for (const p of selected.params) {
      $(`[data-param="${p.key}"]`).value = String(values[p.key]);
      $(`[data-range="${p.key}"]`).value = String(values[p.key]);
    }
    $('#prob-x').value = String(fmtInput(examplePoint(selected, values)));
    renderExplorer();
    if (location.hash)
      document.getElementById(location.hash.slice(1))?.scrollIntoView();
    return;
  }

  $('.filters').addEventListener('click', (e) => {
    const button = (e.target as HTMLElement).closest<HTMLElement>(
      '[data-filter]',
    );
    if (!button) return;
    filter = button.dataset.filter!;
    $$('[data-filter]').forEach((b) => {
      b.classList.toggle('selected', b === button);
      b.setAttribute('aria-pressed', String(b === button));
    });
    renderCards();
  });
  $('#search').addEventListener('input', (e) => {
    query = (e.target as HTMLInputElement).value.trim().toLowerCase();
    renderCards();
  });
  document.addEventListener('keydown', (e) => {
    if (
      e.key === '/' &&
      !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName ?? '')
    ) {
      e.preventDefault();
      $('#search').focus();
    }
  });
  // Restore form controls when returning with browser Back, including without bfcache.
  const saved = history.state?.catalogue;
  if (saved) {
    query = saved.query;
    filter = saved.filter;
    $('#search').value = query;
    $$('[data-filter]').forEach((b) => {
      const active = b.dataset.filter! === filter;
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', String(active));
    });
  }
  window.addEventListener('pagehide', () =>
    history.replaceState(
      { ...history.state, catalogue: { query, filter } },
      '',
    ),
  );
  for (const button of $$('[data-filter]')) {
    button.querySelector('span')!.textContent = String(
      distributions.filter(
        (d) =>
          button.dataset.filter! === 'All' || d.type === button.dataset.filter!,
      ).length,
    );
  }
  renderCards();
}
initializePage();

function updateSnippet() {
  updateCode(
    $('#snippet-code'),
    snippetSource(selected, snippetLanguage, values),
    snippetLanguage,
  );
  $('#code-algorithm').textContent = algorithms[selected.id];
  $('#code-note').textContent =
    'Example calls follow the last valid explorer parameters. RNG seeds are independent of the page generator.';
  $('#copy-status').textContent = '';
  for (const button of $$('[data-language]')) {
    const active = button.dataset.language! === snippetLanguage;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', String(active));
  }
}
async function copySnippet() {
  const code = $('#snippet-code'),
    status = $('#copy-status');
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = 'Copied to clipboard.';
  } catch {
    const selection = window.getSelection()!,
      range = document.createRange();
    range.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Code selected. Press Ctrl+C or ⌘C to copy.';
    code.parentElement!.focus();
  }
}
