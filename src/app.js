import { colorAtPath } from './color-math.js';
import { renderColorPage } from './color-pages.js';
import { trigAtPath } from './trigonometry.js';
import { renderTrigPage } from './trig-pages.js';
import { distributionTheorems } from './distribution-theorems.js';
import { renderTheorems } from './theorem-view.js';
import { renderSequencePage } from './sequence-pages.js';
import { sequences, sequenceAtPath } from './sequences.js';
import { renderRandomTools } from './random-tools.js';
import { distributionUrl, distributionAtPath, isCataloguePath, randomToolAtPath } from './routes.js';
import { languages, algorithms, snippetSource } from './snippets.js';
import { distributions, defaults, validate, seededRandom, examplePoint } from './distributions.js';
const $ = s => document.querySelector(s);
const fmt = v => typeof v === 'number' ? Number(v.toPrecision(5)).toLocaleString('en', { maximumFractionDigits: 5 }) : v;
let snippetLanguage = 'js';
let selected = distributionAtPath(location.pathname);
let values = selected ? defaults(selected) : {}, filter = 'All', query = '', mode = 'density', samples = [], sampleInfo = null;
function chart(d, p, cumulative = false, mini = false) {
  const [lo, hi] = d.range(p), w = mini ? 210 : 720, h = mini ? 85 : 250;
  const left = mini ? 3 : 48, right = w - 12, top = mini ? 8 : 16, bottom = h - (mini ? 5 : 32);
  const discrete = d.type === 'Discrete';
  const points = discrete ? [lo, ...Array.from({ length: Math.floor(hi) - Math.ceil(lo) + 1 }, (_, i) => Math.ceil(lo) + i), hi] : Array.from({ length: 321 }, (_, i) => lo + (hi - lo) * i / 320);
  // Include exact uniform discontinuities, avoiding sloped edges at the support boundaries.
  if (d.id === 'uniform') points.push(p.a - (hi - lo) * 1e-9, p.a, p.b, p.b + (hi - lo) * 1e-9);
  if (d.plotKnots) points.push(...d.plotKnots(p));
  points.sort((a, b) => a - b);
  const ys = points.map(x => cumulative ? d.cdf(x, p) : d.density(x, p));
  const max = cumulative ? 1.05 : Math.max(...ys) * 1.14 || 1;
  const X = x => left + (x - lo) / (hi - lo) * (right - left), Y = y => bottom - y / max * (bottom - top);
  let grid = '', plot = '';
  if (!mini) {
    for (let i = 0; i <= 4; i++) { const y = max * i / 4; grid += `<line x1="${left}" y1="${Y(y)}" x2="${right}" y2="${Y(y)}" class="grid-line"/><text x="${left - 10}" y="${Y(y) + 4}" text-anchor="end">${fmt(y)}</text>`; }
    for (let i = 0; i <= 4; i++) { const x = lo + (hi - lo) * i / 4; grid += `<text x="${X(x)}" y="${h - 10}" text-anchor="middle">${fmt(x)}</text>`; }
  } else grid = `<line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" class="grid-line"/>`;
  if (discrete && !cumulative) {
    const bw = Math.max(1, (right - left) / (hi - lo) * 0.58);
    plot = points.map((x, i) => `<rect x="${X(x) - bw / 2}" y="${Y(ys[i])}" width="${bw}" height="${bottom - Y(ys[i])}" rx="1" fill="${d.color}" opacity=".75"><title>P(X = ${x}) = ${fmt(ys[i])}</title></rect>`).join('');
  } else {
    let line = `M${X(points[0])},${Y(ys[0])}`;
    for (let i = 1; i < points.length; i++) line += discrete ? `H${X(points[i])}V${Y(ys[i])}` : `L${X(points[i])},${Y(ys[i])}`;
    plot = `<path d="${line}L${X(points.at(-1))},${bottom}L${X(points[0])},${bottom}Z" fill="${d.color}" opacity=".09"/><path d="${line}" fill="none" stroke="${d.color}" stroke-width="${mini ? 2 : 2.6}" stroke-linejoin="round"/>`;
  }
  return `<svg viewBox="0 0 ${w} ${h}" ${mini ? 'aria-hidden="true"' : `role="img" aria-label="${d.name} ${cumulative ? 'cumulative probability' : discrete ? 'probability mass' : 'probability density'} graph"`}>${grid}${plot}</svg>`;
}
function renderCards() {
  const visible = distributions.filter(d => (filter === 'All' || d.type === filter) && `${d.name} ${d.alias} ${d.description} ${d.tags.join(' ')}`.toLowerCase().includes(query));
  $('#cards').innerHTML = visible.map(d => `<a class="distribution-card" href="${distributionUrl(d)}" data-id="${d.id}" style="--accent:${d.color}"><div class="card-top"><span class="type-tag ${d.type.toLowerCase()}">${d.type}</span><span class="card-arrow">↗</span></div>${chart(d, defaults(d), false, true)}<div class="card-name">${d.name}</div><div class="notation">${d.notation}</div><p>${d.description}</p><div class="card-tags">${d.tags.map(t => `<span>${t}</span>`).join('')}</div></a>`).join('') || '<div class="empty-state">No distributions found. Try another name or filter.</div>';
  $('#catalogue-status').textContent = `Showing ${visible.length} of ${distributions.length} distributions · Select one to open its page`;
}
function renderExplorer() {
  const d = selected;
  $('#explorer').style.setProperty('--accent', d.color);
  $('#explorer').innerHTML = `<div class="explorer-heading"><div><span class="eyebrow">DISTRIBUTION EXPLORER</span><h1>${d.name} distribution <span class="type-tag ${d.type.toLowerCase()}">${d.type}</span></h1><p>${d.alias} <span class="heading-dot">·</span> <span class="math">${d.notation}</span></p></div><button id="reset" class="quiet-button" aria-label="Reset parameters">↺ <span>Reset parameters</span></button></div>
  <div class="explorer-body"><div class="visual-panel"><div class="plot-toolbar"><div class="plot-tabs"><button data-mode="density" class="${mode === 'density' ? 'selected' : ''}" aria-pressed="${mode === 'density'}">${d.type === 'Discrete' ? 'Probability mass' : 'Probability density'} <span>${d.type === 'Discrete' ? 'PMF' : 'PDF'}</span></button><button data-mode="cdf" class="${mode === 'cdf' ? 'selected' : ''}" aria-pressed="${mode === 'cdf'}">Cumulative <span>CDF</span></button></div><span class="live"><span class="status-dot"></span> Live preview</span></div><div id="plot"></div><div class="plot-caption"><span id="plot-explanation"></span><span>Value, x</span></div><div class="formula" id="formula"></div></div>
  <div class="parameters"><div class="section-label">Parameters</div>${d.params.map(p => `<div class="parameter"><label for="number-${p.key}"><span class="parameter-symbol">${p.symbol}</span>${p.label}</label><input id="number-${p.key}" data-param="${p.key}" type="number" value="${values[p.key]}" min="${p.min}" max="${p.max}" step="${p.step}"><input type="range" aria-label="${p.label} slider" data-range="${p.key}" value="${values[p.key]}" min="${p.min}" max="${p.max}" step="${p.step}"><div class="range-labels"><span>${p.min}</span><span>${p.max}</span></div></div>`).join('')}<p id="parameter-error" class="error" role="alert"></p><div class="parameter-tip"><span>ⓘ</span> Adjust the parameters to see how the distribution changes.</div></div></div>
  <div class="detail-grid"><section class="properties"><h3>Properties</h3><div id="stats" class="stats"></div><div class="use-case"><h4>Applications</h4><p>${d.use}</p><a href="${d.sourceUrl || `https://www.itl.nist.gov/div898/handbook/eda/section3/eda366${d.source}.htm`}" target="_blank" rel="noreferrer">Explore the ${d.sourceUrl ? 'distribution' : 'NIST'} reference ↗</a></div></section><section class="generator"><h3>Sample generator</h3><p>Generate values from your current distribution.</p><form id="generate-form"><div class="generator-inputs"><label>Sample size<input id="sample-size" type="number" min="1" max="10000" step="1" value="100" required></label><label>Seed <span>optional</span><input id="seed" type="text" placeholder="Optional seed" maxlength="100"></label></div><div class="generate-actions"><button class="primary" type="submit">⚄ &nbsp; Generate samples</button><button id="download" type="button" class="quiet-button" disabled>↓ CSV</button></div></form><p id="sample-status" class="sample-status" aria-live="polite">A fixed seed reproduces the sample sequence.</p><pre id="samples" class="sample-output">No samples generated.</pre><div class="calculator"><label for="prob-x">Cumulative probability · P(X ≤ x)</label><div><input id="prob-x" type="number" step="any" value="${fmtInput(examplePoint(d, values))}" aria-label="Value x for cumulative probability"><output id="prob-result"></output></div></div></section></div>
  ${renderTheorems(distributionTheorems[d.id], distributions, distributionUrl)}
  <section class="code-section" aria-labelledby="code-title"><div class="code-heading"><div><h3 id="code-title">Implementation</h3><p>PDF/PMF and sample generation, implemented from scratch. Standard-library math and uniform random numbers only.</p></div><button id="copy-code" class="quiet-button">Copy code</button></div><div class="code-languages" aria-label="Code language">${Object.entries(languages).map(([key, name]) => `<button data-language="${key}" aria-pressed="${key === snippetLanguage}" class="${key === snippetLanguage ? 'selected' : ''}">${name}</button>`).join('')}</div><p id="code-algorithm"></p><pre class="code-source" tabindex="0" aria-label="Implementation code"><code id="snippet-code"></code></pre><div class="code-footer"><span id="code-note"></span><span id="copy-status" role="status"></span></div></section>`;
  document.querySelectorAll('[data-param], [data-range]').forEach(el => el.addEventListener('input', () => updateParameter(el)));
  document.querySelectorAll('[data-mode]').forEach(el => el.addEventListener('click', () => { mode = el.dataset.mode; document.querySelectorAll('[data-mode]').forEach(b => { b.classList.toggle('selected', b === el); b.setAttribute('aria-pressed', b === el); }); updatePlot(); }));
  $('#reset').addEventListener('click', () => { values = defaults(d); samples = []; sampleInfo = null; renderExplorer(); });
  $('#generate-form').addEventListener('submit', generate);
  $('#download').addEventListener('click', download);
  $('#prob-x').addEventListener('input', updateProbability);
  document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => {
    snippetLanguage = button.dataset.language; updateSnippet();
  }));
  $('#copy-code').addEventListener('click', copySnippet);
  updatePlot(); updateStats(); updateSnippet();
}
const fmtInput = n => Number(n.toPrecision(6));
function updateParameter(el) {
  const key = el.dataset.param || el.dataset.range;
  if (el.dataset.range) $(`[data-param="${key}"]`).value = el.value;
  const next = Object.fromEntries(selected.params.map(p => [p.key, $(`[data-param="${p.key}"]`).value === '' ? NaN : Number($(`[data-param="${p.key}"]`).value)]));
  const error = validate(selected, next); $('#parameter-error').textContent = error;
  $('#generate-form button[type="submit"]').disabled = !!error;
  if (error) { $('#parameter-error').textContent += ' Preview retains the last valid parameters.'; return; }
  values = next;
  for (const p of selected.params) $(`[data-range="${p.key}"]`).value = values[p.key];
  samples = []; sampleInfo = null; $('#download').disabled = true; $('#samples').textContent = 'Parameters changed. Generate a new sample.'; $('#sample-status').textContent = 'A fixed seed reproduces the sample sequence.';
  updatePlot(); updateStats(); updateSnippet();
}
function updatePlot() {
  $('#plot').innerHTML = chart(selected, values, mode === 'cdf');
  $('#plot-explanation').textContent = mode === 'cdf' ? 'F(x) = P(X ≤ x) · cumulative probability' : selected.type === 'Discrete' ? 'Bar height gives the probability at each integer.' : 'Area under the curve represents probability.';
  $('#plot-explanation').textContent += ' Finite plotting window; tails may extend beyond it.';
  if (selected.id === 'weibull' && values.shape < 1) $('#plot-explanation').textContent += ' Density diverges at zero; the plot starts at the 0.5th percentile.';
  $('#formula').textContent = mode === 'cdf' ? 'F(x) = P(X ≤ x)' : selected.formula;
}
function updateStats() { $('#stats').innerHTML = Object.entries(selected.stats(values)).map(([k, v]) => `<div><span>${k}</span><strong>${fmt(v)}</strong></div>`).join(''); updateProbability(); }
function updateProbability() { const x = $('#prob-x').valueAsNumber; $('#prob-result').textContent = Number.isFinite(x) ? `${(selected.cdf(x, values) * 100).toFixed(4)}%` : 'Enter a value'; }
function generate(e) {
  e.preventDefault();
  if (validate(selected, values) || $('#parameter-error').textContent) return;
  const n = $('#sample-size').valueAsNumber;
  if (!Number.isInteger(n) || n < 1 || n > 10000) return;
  const seed = $('#seed').value, rng = seed ? seededRandom(seed) : Math.random;
  samples = Array.from({ length: n }, () => selected.sample(values, rng));
  sampleInfo = { distribution: selected.id, parameters: { ...values }, seed };
  const mean = samples.reduce((a, b) => a + b, 0) / n;
  $('#samples').textContent = samples.slice(0, 60).map(fmt).join(', ') + (n > 60 ? `\n… ${n - 60} more values in the CSV` : '');
  $('#sample-status').textContent = `${n.toLocaleString()} samples · Sample mean ${fmt(mean)}${seed ? ' · Seeded sequence' : ''}`;
  $('#download').disabled = false;
}
function download() {
  if (!samples.length) return;
  const csvCell = v => '"' + String(v).replaceAll('"', '""') + '"';
  const parameters = Object.entries(sampleInfo.parameters).map(([k, v]) => `${k}=${v}`).join(';');
  const csv = 'index,value,distribution,parameters\n' + samples.map((v, i) => [i + 1, v, sampleInfo.distribution, csvCell(parameters)].join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = `jmath-${sampleInfo.distribution}-${samples.length}.csv`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
// Native links provide browser history, open-in-new-tab, and reloadable URLs.
function initializePage() {
  $('.nav-item .count').textContent = distributions.length;
  const toolRoute = randomToolAtPath(location.pathname);
  const sequenceRoute = sequenceAtPath(location.pathname);
  const trigRoute = trigAtPath(location.pathname);
  const colorRoute = colorAtPath(location.pathname);
  document.querySelector('.nav-item[href="/sequences"] .count').textContent = sequences.length;
  document.querySelectorAll('.mobile-tool-nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === (colorRoute ? '/color-math' : trigRoute ? '/trigonometry' : sequenceRoute ? '/sequences' : toolRoute ? '/random-tools' : '/')));
  if (colorRoute) { renderColorPage(colorRoute.page); return; }
  if (trigRoute) { renderTrigPage(trigRoute.item); return; }
  if (sequenceRoute) { renderSequencePage(sequenceRoute.sequence); return; }
  if (toolRoute) { renderRandomTools(toolRoute.kind); return; }
  const legacy = isCataloguePath(location.pathname) && distributions.find(d => d.id === location.hash.slice(1));
  if (legacy) { location.replace(distributionUrl(legacy)); return; }
  if (selected) {
    const linkedValues = { ...values };
    for (const p of selected.params) {
      const raw = new URLSearchParams(location.search).get(p.key);
      if (raw !== null) linkedValues[p.key] = raw.trim() === '' ? NaN : Number(raw);
    }
    if (!validate(selected, linkedValues)) values = linkedValues;
    $('#catalogue-intro').remove();
    $('#catalogue-list').remove();
    $('main').id = 'distribution-page';
    $('.breadcrumb').innerHTML = `<a href="/">← All distributions</a><span>/</span><span aria-current="page">${selected.name}</span>`;
    document.title = `${selected.name} distribution · jmath`;
    $('meta[name="description"]').content = selected.description;
    renderExplorer();
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    return;
  }
  $('#explorer').remove();
  if (!isCataloguePath(location.pathname)) {
    $('#catalogue-intro').remove();
    $('#catalogue-list').innerHTML = '<div class="not-found"><h1>Page not found</h1><p>That page is not in the toolkit.</p><a class="quiet-button" href="/">← All distributions</a></div>';
    document.title = 'Page not found · jmath';
    return;
  }
  $('.filters').addEventListener('click', e => {
    const button = e.target.closest('[data-filter]');
    if (!button) return;
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', b === button); });
    renderCards();
  });
  $('#search').addEventListener('input', e => { query = e.target.value.trim().toLowerCase(); renderCards(); });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { e.preventDefault(); $('#search').focus(); }
  });
  // Restore form controls when returning with browser Back, including without bfcache.
  const saved = history.state?.catalogue;
  if (saved) {
    query = saved.query;
    filter = saved.filter;
    $('#search').value = query;
    document.querySelectorAll('[data-filter]').forEach(b => { const active = b.dataset.filter === filter; b.classList.toggle('selected', active); b.setAttribute('aria-pressed', active); });
  }
  window.addEventListener('pagehide', () => history.replaceState({ ...history.state, catalogue: { query, filter } }, ''));
  for (const button of document.querySelectorAll('[data-filter]')) {
    button.querySelector('span').textContent = distributions.filter(d => button.dataset.filter === 'All' || d.type === button.dataset.filter).length;
  }
  renderCards();
}
initializePage();

function updateSnippet() {
  $('#snippet-code').textContent = snippetSource(selected, snippetLanguage, values);
  $('#code-algorithm').textContent = algorithms[selected.id];
  $('#code-note').textContent = 'Example calls follow the last valid explorer parameters. RNG seeds are independent of the page generator.';
  $('#copy-status').textContent = '';
  for (const button of document.querySelectorAll('[data-language]')) {
    const active = button.dataset.language === snippetLanguage;
    button.classList.toggle('selected', active);
    button.setAttribute('aria-pressed', active);
  }
}
async function copySnippet() {
  const code = $('#snippet-code'), status = $('#copy-status');
  try {
    await navigator.clipboard.writeText(code.textContent);
    status.textContent = 'Copied to clipboard.';
  } catch {
    const selection = window.getSelection(), range = document.createRange();
    range.selectNodeContents(code); selection.removeAllRanges(); selection.addRange(range);
    status.textContent = 'Code selected. Press Ctrl+C or ⌘C to copy.';
    code.parentElement.focus();
  }
}
