import { $, $$, errorMessage } from '../dom.ts';
import { empiricalChart } from '../experiment-visuals.ts';
import {
  MAX_TRIALS,
  addTrials,
  createExperiment,
  experimentCsv,
  experimentDefaults,
  experimentSummary,
  validateExperiment,
} from '../experiments.ts';
const number = (x: number | null) =>
  x === null
    ? '—'
    : Number(x.toPrecision(5)).toLocaleString('en', {
        maximumFractionDigits: 4,
      });
const percent = (x: number) => `${(x * 100).toFixed(2)}%`;

export function renderRandomTools(kind: string) {
  if (!kind) {
    return;
  }

  const initial = experimentDefaults(kind);
  let experiment = createExperiment(kind, initial),
    busy = false;
  function readSettings() {
    return kind === 'dice'
      ? {
          count: $('#trial-count').valueAsNumber,
          sides: $('#die-sides').valueAsNumber,
        }
      : {
          count: $('#trial-count').valueAsNumber,
          p: $('#heads-p').valueAsNumber,
        };
  }
  function settingsChanged() {
    const settings = readSettings(),
      error = validateExperiment(kind, settings);
    $('#settings-error').textContent = error;
    $('#single-trial').disabled = !!error;
    $('#simulate').disabled = !!error;
    if (error) {
      $('#settings-error').textContent +=
        ' The results below retain the last valid settings.';
      return;
    }
    experiment = createExperiment(kind, settings, $('#experiment-seed').value);
    $('#simulation-error').textContent = '';
    $('#simulation-status').textContent =
      'Experiment reset. No trials recorded.';
    renderResults();
  }
  function setBusy(value: boolean) {
    busy = value;
    $$<HTMLInputElement>(
      '#experiment-settings input, #experiment-settings button, #simulation-form input, [data-trials]',
    ).forEach((el) => {
      el.disabled = value;
    });
    $('#single-trial').disabled = value;
    $('#simulate').disabled = value;
    $('#reset-experiment').disabled = value;
    $('#cancel-simulation').hidden = !value;
    $('#export-experiment').disabled = value || !experiment.total;
  }
  function renderResults() {
    const { theory, total, frequencies, settings, last } = experiment,
      summary = experimentSummary(experiment);
    const label = (x: number | null) =>
      kind === 'coins' && settings.count === 1
        ? x
          ? 'Heads (1)'
          : 'Tails (0)'
        : String(x);
    $('#trial-definition').textContent =
      kind === 'dice'
        ? `${settings.count} × d${settings.sides} · record the sum`
        : `${settings.count} ${settings.count === 1 ? 'coin' : 'coins'} · record the number of heads`;
    $('#single-trial').textContent =
      kind === 'dice'
        ? `Roll ${settings.count === 1 ? 'die' : 'dice'}`
        : `Flip ${settings.count === 1 ? 'coin' : 'coins'}`;
    $('#trial-items').innerHTML =
      (last || Array.from({ length: Math.min(settings.count, 12) }, () => null))
        .slice(0, 12)
        .map((v) =>
          kind === 'dice'
            ? `<span class="die-face" aria-label="${v === null ? 'Unrolled die' : 'Die showing ' + v}">${v === null ? '?' : settings.sides === 6 ? ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][v - 1] : v}</span>`
            : `<span class="coin-face ${v === 0 ? 'tails' : ''}" aria-label="${v === null ? 'Unflipped coin' : v ? 'Heads' : 'Tails'}">${v === null ? '?' : v ? 'H' : 'T'}</span>`,
        )
        .join('') +
      (settings.count > 12
        ? `<span class="more-coins">+ ${settings.count - 12} coins</span>`
        : '');
    $('#trial-result').textContent = last
      ? `${kind === 'dice' ? 'Total' : 'Heads'}: ${last.reduce((s, v) => s + v, 0)}${kind === 'coins' ? ` / ${settings.count}` : ''}`
      : 'No trial generated.';
    if (kind === 'coins') {
      $('#heads-slider').value = String(settings.p!);
      $('#coin-odds').textContent =
        `${percent(settings.p!)} heads · ${percent(1 - settings.p!)} tails`;
    }
    $('#experiment-stats').innerHTML = [
      ['Completed trials', total.toLocaleString()],
      ['Observed mean', number(summary.mean)],
      ['Theoretical mean', number(theory.mean)],
      ['Observed variance', number(summary.variance)],
      ['Theoretical variance', number(theory.variance)],
      [
        'Total variation distance',
        summary.distance === null ? '—' : percent(summary.distance),
      ],
    ]
      .map(([k, v]) => `<div><span>${k}</span><strong>${v}</strong></div>`)
      .join('');
    ($('#experiment-stats').lastElementChild as HTMLElement).title =
      'Half the sum of absolute differences between observed and theoretical probabilities. Zero means they match exactly.';
    $('#empirical-chart').innerHTML = empiricalChart(
      theory,
      frequencies,
      total,
      label,
      kind === 'dice' ? 'Sum of dice' : 'Number of heads',
    );
    $('#theory-name').textContent = theory.name;
    $('#theory-relation').textContent = theory.relation;
    $('#theory-link').href = theory.href;
    $('#theory-link').textContent = theory.linkText;
    $('#frequency-rows').innerHTML = theory.outcomes
      .map(
        (x, i) =>
          `<tr><th scope="row">${label(x)}</th><td>${frequencies[i].toLocaleString()}</td><td>${total ? percent(frequencies[i] / total) : '—'}</td><td>${number(total * theory.probabilities[i])}</td><td>${percent(theory.probabilities[i])}</td></tr>`,
      )
      .join('');
    $('#export-experiment').disabled = busy || !total;
  }
  $('#experiment-settings').addEventListener('submit', (e) =>
    e.preventDefault(),
  );
  $('#experiment-settings').addEventListener('input', (e) => {
    if ((e.target as HTMLElement).id === 'heads-slider')
      $('#heads-p').value = (e.target as HTMLInputElement).value;
    settingsChanged();
  });
  $$('[data-sides]').forEach((b) =>
    b.addEventListener('click', () => {
      $('#die-sides').value = b.dataset.sides!;
      settingsChanged();
    }),
  );
  $$('[data-trials]').forEach((b) =>
    b.addEventListener('click', () => {
      $('#simulation-n').value = b.dataset.trials!;
    }),
  );
  $('#single-trial').addEventListener('click', () => {
    try {
      addTrials(experiment, 1);
      $('#simulation-error').textContent = '';
      $('#simulation-status').textContent =
        `One trial added · ${experiment.total.toLocaleString()} completed.`;
      renderResults();
    } catch (error) {
      $('#simulation-error').textContent = errorMessage(error);
    }
  });
  $('#reset-experiment').addEventListener('click', settingsChanged);
  let stop = false;
  $('#cancel-simulation').addEventListener('click', () => {
    stop = true;
  });
  $('#simulation-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (busy || validateExperiment(kind, readSettings())) return;
    const n = $('#simulation-n').valueAsNumber;
    if (!Number.isInteger(n) || n < 1 || experiment.total + n > MAX_TRIALS) {
      $('#simulation-error').textContent =
        experiment.total === MAX_TRIALS
          ? 'This experiment has reached 100,000 trials. Reset to start another.'
          : `Choose 1–${(MAX_TRIALS - experiment.total).toLocaleString()} additional trials, or reset the experiment.`;
      return;
    }
    $('#simulation-error').textContent = '';
    stop = false;
    setBusy(true);
    let done = 0;
    try {
      while (done < n && !stop) {
        const batch = Math.min(1000, n - done);
        addTrials(experiment, batch);
        done += batch;
        $('#simulation-status').textContent =
          `Simulating ${done.toLocaleString()} / ${n.toLocaleString()} · ${experiment.total.toLocaleString()} completed in total.`;
        renderResults();
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      $('#simulation-status').textContent =
        `${stop && done < n ? 'Stopped. ' : ''}${done.toLocaleString()} trials added · ${experiment.total.toLocaleString()} completed in total.`;
    } catch (error) {
      $('#simulation-error').textContent = errorMessage(error);
    } finally {
      setBusy(false);
    }
  });
  $('#export-experiment').addEventListener('click', () => {
    const url = URL.createObjectURL(
      new Blob([experimentCsv(experiment)], { type: 'text/csv;charset=utf-8' }),
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `jmath-${kind}-${experiment.total}-frequencies.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  renderResults();
}
