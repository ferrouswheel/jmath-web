import { renderTheorems } from './theorem-view.js';
import { sequences, sequenceTerm, validateIndex, sequenceUrl, MAX_SEQUENCE_INDEX } from './sequences.js';
import { sequenceTheorems } from './sequence-theorems.js';
import { sequenceGeometry } from './sequence-visuals.js';
import { sequenceLanguages, sequenceSnippet, cSequenceLimit } from './sequence-snippets.js';
const $=s=>document.querySelector(s);
const compact=value=>{const text=String(value);return text.length>16?text.slice(0,8)+'…'+text.slice(-5):text;};

export function renderSequencePage(sequence){
  const main=$('main'),footer=$('footer').outerHTML;
  main.id='sequences-page';
  document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='/sequences'));
  if(!sequence){
    document.title='Number sequences · jmath';
    $('meta[name="description"]').content='Integer sequences with exact nth-term calculations, geometric interpretations, formulas, and implementations.';
    main.innerHTML=`<div class="breadcrumb">Toolkit <span>/</span> Number sequences</div><section class="intro"><div><h1>Number sequences</h1><p>Exact terms, defining formulas, geometric interpretations, related theorems, and implementations.</p></div></section><div class="sequence-toolbar"><span>${sequences.length} sequences</span><label class="search"><input id="sequence-search" type="search" placeholder="Search sequences" aria-label="Search sequences"></label></div><section id="sequence-cards" class="sequence-cards" aria-label="Number sequences"></section><p id="sequence-search-status" class="catalogue-status" role="status"></p>${footer}`;
    function renderCards(){
      const query=$('#sequence-search').value.trim().toLowerCase(),visible=sequences.filter(s=>`${s.name} ${s.category} ${s.description}`.toLowerCase().includes(query));
      $('#sequence-cards').innerHTML=visible.map(s=>`<a class="sequence-card" href="${sequenceUrl(s)}" style="--accent:${s.color}"><div class="sequence-card-top"><span>${s.category}</span><span>↗</span></div>${sequenceGeometry(s,Math.min(s.initial,5),true).svg}<h2>${s.name}</h2><div class="sequence-preview">${Array.from({length:7},(_,i)=>String(sequenceTerm(s,s.min+i))).join(', ')}, …</div><p>${s.description}</p><div class="sequence-card-formula">${s.formula}</div></a>`).join('')||'<p class="empty-state">No matching sequences.</p>';
      $('#sequence-search-status').textContent=`${visible.length} of ${sequences.length} sequences`;
    }
    $('#sequence-search').addEventListener('input',renderCards);renderCards();return;
  }
  document.title=`${sequence.name} · jmath`;$('meta[name="description"]').content=sequence.description;
  const requested=new URLSearchParams(location.search).get('n');
  let n=requested!==null&&requested.trim()!==''&&!validateIndex(sequence,Number(requested))?Number(requested):sequence.initial,language='js';
  main.innerHTML=`<div class="breadcrumb"><a href="/sequences">← Number sequences</a><span>/</span><span aria-current="page">${sequence.name}</span></div><section class="intro sequence-intro"><div><div class="eyebrow">${sequence.category.toUpperCase()}</div><h1>${sequence.name}</h1><p>${sequence.description}</p></div><a class="quiet-button" href="https://oeis.org/${sequence.oeis}" target="_blank" rel="noreferrer">${sequence.oeis} · OEIS ↗</a></section>
  <section class="sequence-calculator" aria-label="Nth-term calculator"><div class="sequence-n-controls"><h2>Nth-term calculator</h2><label for="sequence-n">Index n <span>(${sequence.min}–${MAX_SEQUENCE_INDEX})</span></label><div class="sequence-stepper"><button type="button" id="previous-n" class="quiet-button" aria-label="Previous index">−</button><input id="sequence-n" type="number" min="${sequence.min}" max="${MAX_SEQUENCE_INDEX}" step="1" value="${n}"><button type="button" id="next-n" class="quiet-button" aria-label="Next index">+</button></div><label class="small-n-label" for="sequence-slider">Visual range: n = ${sequence.min}–${sequence.visualMax}</label><input id="sequence-slider" type="range" min="${sequence.min}" max="${sequence.visualMax}" step="1" value="${Math.min(n,sequence.visualMax)}"><p id="sequence-error" class="error" role="alert"></p><p class="sequence-index-note">${sequence.id==='primes'?'Indexing starts at p₁ = 2.':sequence.id==='fibonacci'?'Indexing starts at F₀ = 0, F₁ = 1.':`Indexing starts at a₀ = ${sequenceTerm(sequence,0)}.`}</p></div><div class="sequence-answer"><div class="sequence-answer-heading"><span id="nth-label"></span><button type="button" id="copy-term" class="quiet-button">Copy value</button></div><output id="nth-value" aria-live="polite"></output><div class="sequence-formula">${sequence.formula}</div><div id="sequence-neighbors"></div><p id="term-copy-status" role="status"></p></div></section>
  <section class="sequence-term-section"><h2>Terms near the selected index</h2><div id="sequence-terms" class="sequence-terms"></div></section>
  <section class="sequence-interpretation"><div class="sequence-geometry"><div class="sequence-section-heading"><h2>Geometric interpretation</h2><span id="geometry-index"></span></div><div id="sequence-figure"></div><p id="geometry-caption"></p><p id="geometry-limit" class="geometry-limit"></p></div><div class="sequence-method"><h2>Calculating the term</h2><ol id="sequence-steps"></ol><h3>Recurrence</h3><p class="recurrence">${sequence.recurrence}</p><h3>Identities and relationships</h3><p>${sequence.insight}</p><div class="sequence-related">${sequence.related.map(id=>{const s=sequences.find(s=>s.id===id);return `<a href="${sequenceUrl(s)}">${s.name} →</a>`;}).join('')}</div></div></section>
  ${renderTheorems(sequenceTheorems[sequence.id], sequences, sequenceUrl)}
  <section class="sequence-code code-section"><div class="code-heading"><div><h2>Implementation</h2><p>Direct arithmetic and algorithms, without external libraries.</p></div><button type="button" id="copy-sequence-code" class="quiet-button">Copy code</button></div><div class="code-languages" aria-label="Implementation language">${Object.entries(sequenceLanguages).map(([key,name])=>`<button type="button" data-sequence-language="${key}" aria-pressed="${key===language}" class="${key===language?'selected':''}">${name}</button>`).join('')}</div><p id="sequence-code-note"></p><pre class="code-source" tabindex="0" aria-label="Sequence implementation"><code id="sequence-code"></code></pre><p id="sequence-code-status" role="status"></p></section>${footer}`;
  main.style.setProperty('--accent',sequence.color);
  function renderCode(){
    $('#sequence-code').textContent=sequenceSnippet(sequence,language,n);
    $('#sequence-code-note').textContent=language==='c'?`C uses uint64_t and accepts n = ${sequence.min}–${cSequenceLimit(sequence)}.${n>cSequenceLimit(sequence)?' The selected index exceeds that range; this example returns an error. JavaScript and Python support the selected term exactly.':''}`:'JavaScript uses BigInt; Python uses arbitrary-precision integers. Terms are exact throughout the supported range.';
    document.querySelectorAll('[data-sequence-language]').forEach(b=>{const active=b.dataset.sequenceLanguage===language;b.classList.toggle('selected',active);b.setAttribute('aria-pressed',active);});
    $('#sequence-code-status').textContent='';
  }
  function update(){
    const value=sequenceTerm(sequence,n),geometry=sequenceGeometry(sequence,n);
    $('#nth-label').textContent=`${sequence.id==='fibonacci'?'F':sequence.id==='primes'?'p':'a'}(${n}) · exact integer`;
    $('#nth-value').textContent=value.toString();
    const previous=n>sequence.min?sequenceTerm(sequence,n-1):null,next=n<MAX_SEQUENCE_INDEX?sequenceTerm(sequence,n+1):null;
    $('#sequence-neighbors').textContent=`${String(value).length} decimal digit${String(value).length===1?'':'s'}${previous!==null?` · Previous: ${compact(previous)}`:''}${next!==null?` · Next: ${compact(next)}`:''}`;
    $('#previous-n').disabled=n<=sequence.min;$('#next-n').disabled=n>=MAX_SEQUENCE_INDEX;
    $('#sequence-slider').value=Math.min(n,sequence.visualMax);
    const start=Math.max(sequence.min,Math.min(n-5,MAX_SEQUENCE_INDEX-11));
    $('#sequence-terms').innerHTML=Array.from({length:12},(_,i)=>start+i).map(i=>`<button type="button" data-sequence-index="${i}" aria-pressed="${i===n}" class="${i===n?'selected':''}" title="a(${i}) = ${sequenceTerm(sequence,i)}"><span>n = ${i}</span><strong>${compact(sequenceTerm(sequence,i))}</strong></button>`).join('');
    document.querySelectorAll('[data-sequence-index]').forEach(b=>b.addEventListener('click',()=>select(Number(b.dataset.sequenceIndex))));
    $('#sequence-figure').innerHTML=geometry.svg;$('#geometry-index').textContent=`n = ${geometry.index}`;$('#geometry-caption').textContent=geometry.caption;
    $('#geometry-limit').textContent=n!==geometry.index?`The diagram is limited to n = ${geometry.index}. The calculator and code example use the selected n = ${n}.`:'';
    $('#sequence-steps').replaceChildren(...sequence.explain(n).map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
    $('#term-copy-status').textContent='';renderCode();
  }
  function select(value){
    const error=validateIndex(sequence,value);$('#sequence-error').textContent=error;
    if(error){$('#sequence-error').textContent+=' Results retain the last valid index.';return;}
    n=value;$('#sequence-n').value=n;
    const url=new URL(location.href);url.searchParams.set('n',n);history.replaceState(null,'',url);update();
  }
  $('#sequence-n').addEventListener('input',e=>select(e.target.valueAsNumber));
  $('#sequence-slider').addEventListener('input',e=>select(Number(e.target.value)));
  $('#previous-n').addEventListener('click',()=>select(n-1));$('#next-n').addEventListener('click',()=>select(n+1));
  document.querySelectorAll('[data-sequence-language]').forEach(b=>b.addEventListener('click',()=>{language=b.dataset.sequenceLanguage;renderCode();}));
  $('#copy-term').addEventListener('click',()=>copyText($('#nth-value'),$('#term-copy-status')));
  $('#copy-sequence-code').addEventListener('click',()=>copyText($('#sequence-code'),$('#sequence-code-status')));
  update();
  // The content is inserted after initial navigation, so resolve deep links now.
  if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
async function copyText(element,status){
  try{await navigator.clipboard.writeText(element.textContent);status.textContent='Copied.';}
  catch{const range=document.createRange();range.selectNodeContents(element);const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);status.textContent='Text selected. Press Ctrl+C or ⌘C to copy.';}
}
