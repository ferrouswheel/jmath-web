import { MAX_TRIALS, experimentDefaults, validateExperiment, createExperiment, addTrials, experimentSummary, experimentCsv } from './experiments.js';
const $ = s => document.querySelector(s);
const number = x => x === null ? '—' : Number(x.toPrecision(5)).toLocaleString('en', { maximumFractionDigits: 4 });
const percent = x => `${(x * 100).toFixed(2)}%`;
const titles = { dice: 'Dice roller', coins: 'Coin flipper' };

export function renderRandomTools(kind) {
  const main = $('main'), footer = $('footer').outerHTML;
  main.id = 'random-page';
  document.querySelectorAll('.nav-item').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '/random-tools'));
  if (!kind) {
    document.title = 'Dice & coins · jmath';
    main.innerHTML = `<div class="breadcrumb">Toolkit <span>/</span> Dice & coins</div><section class="intro"><div><h1>Dice and coin experiments</h1><p>Generate random outcomes and compare empirical frequencies with exact probability distributions.</p></div><span class="lab-hero" aria-hidden="true">⚄</span></section><section class="tool-cards" aria-label="Random tools"><a href="/random-tools/dice" class="tool-card"><span class="tool-symbol" aria-hidden="true">⚄ ⚂</span><span class="eyebrow">FAIR DICE · EXACT SUM PROBABILITIES</span><h2>Dice roller <span>↗</span></h2><p>Roll configurable fair dice. Calculate the exact distribution of their sum and compare it with repeated trials.</p><span class="tool-card-foot">Discrete Uniform · Convolution</span></a><a href="/random-tools/coins" class="tool-card"><span class="tool-symbol coin-symbol" aria-hidden="true">H <span>T</span></span><span class="eyebrow">FAIR AND BIASED COINS</span><h2>Coin flipper <span>↗</span></h2><p>Generate coin flips with an adjustable heads probability. Compare the number of heads with Bernoulli or Binomial probabilities.</p><span class="tool-card-foot">Bernoulli · Binomial</span></a></section><div class="lab-intro-note"><h3>Empirical and theoretical distributions</h3><p>Each tool compares observed proportions with the exact theoretical probability mass function. Larger samples tend to be closer overall, though individual batches can move away from the model.</p><a href="/">Browse the distribution catalogue →</a></div>${footer}`;
    return;
  }
  document.title = `${titles[kind]} · Dice & coins · jmath`;
  $('meta[name="description"]').content = `Use the ${titles[kind].toLowerCase()} and simulate repeated trials to compare an empirical distribution with exact theoretical probabilities.`;
  const initial = experimentDefaults(kind);
  let experiment = createExperiment(kind, initial), busy = false;
  main.innerHTML = `<div class="breadcrumb"><a href="/random-tools">← Dice & coins</a><span>/</span><span aria-current="page">${titles[kind]}</span></div><section class="intro tool-intro"><div><h1>${titles[kind]}</h1><p>${kind === 'dice' ? 'Roll fair dice and explore the distribution of their total.' : 'Flip coins and explore the distribution of the number of heads.'}</p></div></section>
  <section class="lab-top"><form id="experiment-settings" class="lab-settings" novalidate><h2>Experiment settings</h2><label for="trial-count">${kind === 'dice' ? 'Dice' : 'Coins'} per trial <input id="trial-count" type="number" min="1" max="${kind === 'dice' ? 6 : 100}" step="1" value="${initial.count}" required></label>${kind === 'dice' ? '<label for="die-sides">Sides per die<input id="die-sides" type="number" min="2" max="20" step="1" value="6" required></label><div class="die-presets" aria-label="Common dice">'+[4,6,8,10,12,20].map(n=>`<button type="button" data-sides="${n}">d${n}</button>`).join('')+'</div>' : '<label for="heads-p">Heads probability <input id="heads-p" type="number" min="0" max="1" step="0.01" value="0.5" required></label><input id="heads-slider" type="range" min="0" max="1" step=".01" value=".5" aria-label="Heads probability slider"><div class="coin-odds" id="coin-odds"></div>'}<label for="experiment-seed">Seed <span class="optional">optional</span><input id="experiment-seed" type="text" maxlength="100" placeholder="A repeatable experiment"></label><p class="lab-hint">Changing settings starts a new experiment. A seed repeats the sequence after reset.</p><p id="settings-error" class="error" role="alert"></p></form>
  <div class="roll-stage"><div class="stage-label">ONE TRIAL</div><div id="trial-definition"></div><div id="trial-items" class="trial-items"></div><div id="trial-result" aria-live="polite">No trial generated.</div><button type="button" id="single-trial" class="primary">${kind === 'dice' ? 'Roll dice' : 'Flip coin'}</button><p class="lab-hint">Each result adds one trial to your empirical distribution.</p></div></section>
  <section class="lab-simulation"><div class="lab-section-heading"><div><h2>Empirical distribution</h2></div><button type="button" id="reset-experiment" class="quiet-button">↺ Reset experiment</button></div><form id="simulation-form"><label for="simulation-n">Additional trials, N<input id="simulation-n" type="number" min="1" max="${MAX_TRIALS}" step="1" value="1000" required></label><div class="trial-presets" aria-label="Simulation sizes">${[100,1000,10000].map(n=>`<button type="button" data-trials="${n}">${n.toLocaleString()}</button>`).join('')}</div><button type="submit" class="primary" id="simulate">Add N trials</button><button type="button" id="cancel-simulation" class="quiet-button" hidden>Stop</button></form><div class="simulation-status-row"><p id="simulation-status" role="status">No trials recorded.</p><button type="button" id="export-experiment" class="quiet-button" disabled>↓ Frequency CSV</button></div><p id="simulation-error" class="error" role="alert"></p><div id="experiment-stats" class="experiment-stats"></div><div class="empirical-legend"><span><i class="observed-key"></i>Observed proportion</span><span><i class="expected-key"></i>Theoretical probability</span></div><div class="empirical-scroll"><div id="empirical-chart"></div></div><p class="lab-hint">Bar height = observed count ÷ completed trials. Gold markers show the exact probability of each outcome.</p><div class="theory-note"><span class="theory-icon" aria-hidden="true">∿</span><div><h3 id="theory-name"></h3><p id="theory-relation"></p><a id="theory-link"></a></div></div><details class="frequency-details"><summary>View frequency table</summary><div class="frequency-scroll"><table><caption>Observed and theoretical outcome frequencies</caption><thead><tr><th scope="col">Outcome</th><th scope="col">Observed count</th><th scope="col">Observed %</th><th scope="col">Expected count</th><th scope="col">Theoretical %</th></tr></thead><tbody id="frequency-rows"></tbody></table></div></details><p class="lab-footnote">Up to ${MAX_TRIALS.toLocaleString()} trials per experiment. Variance uses divisor N. All trials run locally using the browser RNG, or a seeded pseudorandom generator when a seed is supplied.</p></section>${footer}`;

  function readSettings() { return kind === 'dice' ? { count: $('#trial-count').valueAsNumber, sides: $('#die-sides').valueAsNumber } : { count: $('#trial-count').valueAsNumber, p: $('#heads-p').valueAsNumber }; }
  function settingsChanged() {
    const settings = readSettings(), error = validateExperiment(kind, settings);
    $('#settings-error').textContent = error;
    $('#single-trial').disabled = !!error; $('#simulate').disabled = !!error;
    if (error) { $('#settings-error').textContent += ' The results below retain the last valid settings.'; return; }
    experiment = createExperiment(kind, settings, $('#experiment-seed').value);
    $('#simulation-error').textContent = '';
    $('#simulation-status').textContent = 'Experiment reset. No trials recorded.';
    renderResults();
  }
  function setBusy(value) {
    busy = value;
    document.querySelectorAll('#experiment-settings input, #experiment-settings button, #simulation-form input, [data-trials]').forEach(el => { el.disabled = value; });
    $('#single-trial').disabled = value; $('#simulate').disabled = value; $('#reset-experiment').disabled = value;
    $('#cancel-simulation').hidden = !value; $('#export-experiment').disabled = value || !experiment.total;
  }
  function renderResults() {
    const { theory, total, frequencies, settings, last } = experiment, summary = experimentSummary(experiment);
    const label = x => kind === 'coins' && settings.count === 1 ? x ? 'Heads (1)' : 'Tails (0)' : String(x);
    $('#trial-definition').textContent = kind === 'dice' ? `${settings.count} × d${settings.sides} · record the sum` : `${settings.count} ${settings.count === 1 ? 'coin' : 'coins'} · record the number of heads`;
    $('#single-trial').textContent = kind === 'dice' ? `Roll ${settings.count === 1 ? 'die' : 'dice'}` : `Flip ${settings.count === 1 ? 'coin' : 'coins'}`;
    $('#trial-items').innerHTML = (last || Array.from({ length: Math.min(settings.count, 12) }, () => null)).slice(0, 12).map(v => kind === 'dice' ? `<span class="die-face" aria-label="${v === null ? 'Unrolled die' : 'Die showing '+v}">${v === null ? '?' : settings.sides === 6 ? ['⚀','⚁','⚂','⚃','⚄','⚅'][v-1] : v}</span>` : `<span class="coin-face ${v === 0 ? 'tails' : ''}" aria-label="${v === null ? 'Unflipped coin' : v ? 'Heads' : 'Tails'}">${v === null ? '?' : v ? 'H' : 'T'}</span>`).join('') + (settings.count > 12 ? `<span class="more-coins">+ ${settings.count-12} coins</span>` : '');
    $('#trial-result').textContent = last ? `${kind === 'dice' ? 'Total' : 'Heads'}: ${last.reduce((s,v)=>s+v,0)}${kind === 'coins' ? ` / ${settings.count}` : ''}` : 'No trial generated.';
    if(kind === 'coins') { $('#heads-slider').value = settings.p; $('#coin-odds').textContent = `${percent(settings.p)} heads · ${percent(1-settings.p)} tails`; }
    $('#experiment-stats').innerHTML = [['Completed trials',total.toLocaleString()],['Observed mean',number(summary.mean)],['Theoretical mean',number(theory.mean)],['Observed variance',number(summary.variance)],['Theoretical variance',number(theory.variance)],['Total variation distance',summary.distance === null ? '—' : percent(summary.distance)]].map(([k,v])=>`<div><span>${k}</span><strong>${v}</strong></div>`).join('');
    $('#experiment-stats').lastElementChild.title = 'Half the sum of absolute differences between observed and theoretical probabilities. Zero means they match exactly.';
    $('#empirical-chart').innerHTML = empiricalChart(theory, frequencies, total, label, kind === 'dice' ? 'Sum of dice' : 'Number of heads');
    $('#theory-name').textContent = theory.name; $('#theory-relation').textContent = theory.relation;
    $('#theory-link').href = theory.href; $('#theory-link').textContent = theory.linkText;
    $('#frequency-rows').innerHTML = theory.outcomes.map((x,i)=>`<tr><th scope="row">${label(x)}</th><td>${frequencies[i].toLocaleString()}</td><td>${total ? percent(frequencies[i]/total) : '—'}</td><td>${number(total*theory.probabilities[i])}</td><td>${percent(theory.probabilities[i])}</td></tr>`).join('');
    $('#export-experiment').disabled = busy || !total;
  }
  $('#experiment-settings').addEventListener('submit', e=>e.preventDefault());
  $('#experiment-settings').addEventListener('input', e=>{ if(e.target.id==='heads-slider') $('#heads-p').value=e.target.value; settingsChanged(); });
  document.querySelectorAll('[data-sides]').forEach(b=>b.addEventListener('click',()=>{ $('#die-sides').value=b.dataset.sides; settingsChanged(); }));
  document.querySelectorAll('[data-trials]').forEach(b=>b.addEventListener('click',()=>{ $('#simulation-n').value=b.dataset.trials; }));
  $('#single-trial').addEventListener('click',()=>{
    try { addTrials(experiment,1); $('#simulation-error').textContent=''; $('#simulation-status').textContent=`One trial added · ${experiment.total.toLocaleString()} completed.`; renderResults(); }
    catch(error) { $('#simulation-error').textContent=error.message; }
  });
  $('#reset-experiment').addEventListener('click',settingsChanged);
  let stop = false;
  $('#cancel-simulation').addEventListener('click',()=>{stop=true;});
  $('#simulation-form').addEventListener('submit',async e=>{
    e.preventDefault();
    if (busy || validateExperiment(kind, readSettings())) return;
    const n=$('#simulation-n').valueAsNumber;
    if (!Number.isInteger(n)||n<1||experiment.total+n>MAX_TRIALS) { $('#simulation-error').textContent=experiment.total === MAX_TRIALS ? 'This experiment has reached 100,000 trials. Reset to start another.' : `Choose 1–${(MAX_TRIALS-experiment.total).toLocaleString()} additional trials, or reset the experiment.`; return; }
    $('#simulation-error').textContent=''; stop=false; setBusy(true);
    let done=0;
    try {
      while(done<n&&!stop) {
        const batch=Math.min(1000,n-done);addTrials(experiment,batch);done+=batch;
        $('#simulation-status').textContent=`Simulating ${done.toLocaleString()} / ${n.toLocaleString()} · ${experiment.total.toLocaleString()} completed in total.`;
        renderResults();
        await new Promise(resolve=>setTimeout(resolve,0));
      }
      $('#simulation-status').textContent=`${stop&&done<n?'Stopped. ':''}${done.toLocaleString()} trials added · ${experiment.total.toLocaleString()} completed in total.`;
    } catch(error) { $('#simulation-error').textContent=error.message; }
    finally {setBusy(false);}
  });
  $('#export-experiment').addEventListener('click',()=>{
    const url=URL.createObjectURL(new Blob([experimentCsv(experiment)],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`jmath-${kind}-${experiment.total}-frequencies.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  renderResults();
}
function empiricalChart(theory, frequencies, total, label, axisLabel) {
  const w=Math.max(720,theory.outcomes.length*16+70),h=290,left=50,right=w-18,top=20,bottom=245;
  const max=Math.min(1, Math.max(...theory.probabilities,...frequencies.map(n=>total?n/total:0)) * 1.15);
  const Y=p=>bottom-(bottom-top)*p/max,step=(right-left)/theory.outcomes.length,bw=step*.62;
  let elements='';
  for(let i=0;i<=4;i++){const p=max*i/4;elements+=`<line class="grid-line" x1="${left}" y1="${Y(p)}" x2="${right}" y2="${Y(p)}"/><text x="${left-8}" y="${Y(p)+4}" text-anchor="end">${(100*p).toFixed(1)}%</text>`;}
  const every=Math.max(1,Math.ceil(theory.outcomes.length/22));
  theory.outcomes.forEach((outcome,i)=>{
    const x=left+(i+.5)*step,p=total?frequencies[i]/total:0,expected=theory.probabilities[i];
    elements+=`<rect x="${x-bw/2}" y="${Y(p)}" width="${bw}" height="${bottom-Y(p)}" rx="2" fill="#8272d2"><title>${label(outcome)}: ${frequencies[i]} observed (${percent(p)}); theoretical ${percent(expected)}</title></rect><line x1="${x-bw*.65}" y1="${Y(expected)}" x2="${x+bw*.65}" y2="${Y(expected)}" stroke="#bc8c3d" stroke-width="3"/>`;
    if(i%every===0||i===theory.outcomes.length-1)elements+=`<text x="${x}" y="${bottom+19}" text-anchor="middle">${label(outcome)}</text>`;
  });
  return `<svg viewBox="0 0 ${w} ${h}" style="min-width:${Math.max(300,theory.outcomes.length*16+70)}px" role="img" aria-label="Observed proportions and theoretical probabilities by outcome. ${total.toLocaleString()} completed trials. Exact values are available in the frequency table.">${elements}<text x="${(left+right)/2}" y="${h-3}" text-anchor="middle">${axisLabel}</text></svg>`;
}
