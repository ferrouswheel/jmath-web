import { $, $$ } from '../dom.ts';
import { cSequenceLimit, sequenceSnippet } from '../sequence-snippets.ts';
import { sequenceGeometry } from '../sequence-visuals.ts';
import {
  MAX_SEQUENCE_INDEX,
  sequences,
  sequenceTerm,
  sequenceUrl,
  validateIndex,
} from '../sequences.ts';
import type { Sequence } from '../types.ts';
const compact = (value: number | bigint) => {
  const text = String(value);
  return text.length > 16 ? text.slice(0, 8) + '…' + text.slice(-5) : text;
};

export function renderSequencePage(selectedSequence: Sequence | null) {
  if (!selectedSequence) {
    function renderCards() {
      const query = $('#sequence-search').value.trim().toLowerCase(),
        visible = sequences.filter((s) =>
          `${s.name} ${s.category} ${s.description}`
            .toLowerCase()
            .includes(query),
        );
      const urls = new Set(visible.map(sequenceUrl));
      $$('.sequence-card').forEach((card) => {
        card.hidden = !urls.has(card.getAttribute('href')!);
      });
      $('#sequence-empty').hidden = visible.length > 0;
      $('#sequence-search-status').textContent =
        `${visible.length} of ${sequences.length} sequences`;
    }
    $('#sequence-search').addEventListener('input', renderCards);
    renderCards();
    return;
  }
  const sequence = selectedSequence;

  const requested = new URLSearchParams(location.search).get('n');
  let n =
      requested !== null &&
      requested.trim() !== '' &&
      !validateIndex(sequence, Number(requested))
        ? Number(requested)
        : sequence.initial,
    language = 'js';

  $('#sequence-n').value = String(n);
  function renderCode() {
    $('#sequence-code').textContent = sequenceSnippet(sequence, language, n);
    $('#sequence-code-note').textContent =
      language === 'c'
        ? `C uses uint64_t and accepts n = ${sequence.min}–${cSequenceLimit(sequence)}.${n > cSequenceLimit(sequence) ? ' The selected index exceeds that range; this example returns an error. JavaScript and Python support the selected term exactly.' : ''}`
        : 'JavaScript uses BigInt; Python uses arbitrary-precision integers. Terms are exact throughout the supported range.';
    $$('[data-sequence-language]').forEach((b) => {
      const active = b.dataset.sequenceLanguage! === language;
      b.classList.toggle('selected', active);
      b.setAttribute('aria-pressed', String(active));
    });
    $('#sequence-code-status').textContent = '';
  }
  function update() {
    const value = sequenceTerm(sequence, n),
      geometry = sequenceGeometry(sequence, n);
    $('#nth-label').textContent =
      `${sequence.id === 'fibonacci' ? 'F' : sequence.id === 'primes' ? 'p' : 'a'}(${n}) · exact integer`;
    $('#nth-value').textContent = value.toString();
    const previous = n > sequence.min ? sequenceTerm(sequence, n - 1) : null,
      next = n < MAX_SEQUENCE_INDEX ? sequenceTerm(sequence, n + 1) : null;
    $('#sequence-neighbors').textContent =
      `${String(value).length} decimal digit${String(value).length === 1 ? '' : 's'}${previous !== null ? ` · Previous: ${compact(previous)}` : ''}${next !== null ? ` · Next: ${compact(next)}` : ''}`;
    $('#previous-n').disabled = n <= sequence.min;
    $('#next-n').disabled = n >= MAX_SEQUENCE_INDEX;
    $('#sequence-slider').value = String(Math.min(n, sequence.visualMax));
    const start = Math.max(
      sequence.min,
      Math.min(n - 5, MAX_SEQUENCE_INDEX - 11),
    );
    $('#sequence-terms').innerHTML = Array.from(
      { length: 12 },
      (_, i) => start + i,
    )
      .map(
        (i) =>
          `<button type="button" data-sequence-index="${i}" aria-pressed="${i === n}" class="${i === n ? 'selected' : ''}" title="a(${i}) = ${sequenceTerm(sequence, i)}"><span>n = ${i}</span><strong>${compact(sequenceTerm(sequence, i))}</strong></button>`,
      )
      .join('');
    $$('[data-sequence-index]').forEach((b) =>
      b.addEventListener('click', () =>
        select(Number(b.dataset.sequenceIndex!)),
      ),
    );
    $('#sequence-figure').innerHTML = geometry.svg;
    $('#geometry-index').textContent = `n = ${geometry.index}`;
    $('#geometry-caption').textContent = geometry.caption;
    $('#geometry-limit').textContent =
      n !== geometry.index
        ? `The diagram is limited to n = ${geometry.index}. The calculator and code example use the selected n = ${n}.`
        : '';
    $('#sequence-steps').replaceChildren(
      ...sequence.explain(n).map((text: string) => {
        const li = document.createElement('li');
        li.textContent = text;
        return li;
      }),
    );
    $('#term-copy-status').textContent = '';
    renderCode();
  }
  function select(value: number) {
    const error = validateIndex(sequence, value);
    $('#sequence-error').textContent = error;
    if (error) {
      $('#sequence-error').textContent +=
        ' Results retain the last valid index.';
      return;
    }
    n = value;
    $('#sequence-n').value = String(n);
    const url = new URL(location.href);
    url.searchParams.set('n', String(n));
    history.replaceState(null, '', url);
    update();
  }
  $('#sequence-n').addEventListener('input', (e) =>
    select((e.target as HTMLInputElement).valueAsNumber),
  );
  $('#sequence-slider').addEventListener('input', (e) =>
    select(Number((e.target as HTMLInputElement).value)),
  );
  $('#previous-n').addEventListener('click', () => select(n - 1));
  $('#next-n').addEventListener('click', () => select(n + 1));
  $$('[data-sequence-language]').forEach((b) =>
    b.addEventListener('click', () => {
      language = b.dataset.sequenceLanguage!;
      renderCode();
    }),
  );
  $('#copy-term').addEventListener('click', () =>
    copyText($('#nth-value'), $('#term-copy-status')),
  );
  $('#copy-sequence-code').addEventListener('click', () =>
    copyText($('#sequence-code'), $('#sequence-code-status')),
  );
  update();
  // The content is inserted after initial navigation, so resolve deep links now.
  if (location.hash)
    document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
async function copyText(element: HTMLElement, status: HTMLElement) {
  try {
    await navigator.clipboard.writeText(element.textContent);
    status.textContent = 'Copied.';
  } catch {
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = 'Text selected. Press Ctrl+C or ⌘C to copy.';
  }
}
