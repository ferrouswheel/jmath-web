import { trigFunctions, trigUrl, evaluateTrig } from './trigonometry.js';
import { PI } from './trig-math.js';
import { trigGraph, unitCircle, trigFormat } from './trig-visuals.js';
import { trigLanguages, trigSnippet } from './trig-snippets.js';
import { renderTheorems } from './theorem-view.js';
const $=s=>document.querySelector(s);
export function renderTrigPage(item){
 const main=$('main'),footer=$('footer').outerHTML;main.id='trigonometry-page';main.style.setProperty('--accent','#8270c7');
 document.querySelectorAll('.nav-item').forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='/trigonometry'));
 if(!item){
  document.title='Trigonometric functions · jmath';$('meta[name="description"]').content='Sine, cosine, tangent and their inverses: calculators, graphs, unit circles, identities and direct numerical implementations.';
  main.innerHTML=`<div class="breadcrumb">Toolkit <span>/</span> Trigonometry</div><section class="intro"><div><h1>Trigonometric functions</h1><p>Sine, cosine, tangent, and their principal inverses. Explore angles, coordinates, graphs, and identities.</p></div></section><section class="trig-catalogue sequence-cards" aria-label="Trigonometric functions">${trigFunctions.map(f=>`<a class="sequence-card" href="${trigUrl(f)}"><div class="sequence-card-top"><span>${f.inverse?'Inverse function':'Trigonometric function'}</span><span>↗</span></div>${trigGraph(f,null,'radians',true)}<h2>${f.name}</h2><div class="sequence-preview">${f.notation}</div><p>${f.description}</p><div class="sequence-card-formula">Range: ${f.range}</div></a>`).join('')}</section><section class="trig-reference"><h2>Angles and inverse functions</h2><p>A full turn is 2π radians or 360°. Convert degrees to radians by multiplying by π/180.</p><p>Arcsin, arccos, and arctan return one principal angle. They are inverse functions, not reciprocals: arcsin(x) is different from 1/sin(x).</p></section>${footer}`;return;
 }
 document.title=`${item.name} · jmath`;$('meta[name="description"]').content=item.description;
 const query=new URLSearchParams(location.search);let unit=query.get('unit')==='degrees'?'degrees':'radians',language='js';
 let input=query.has('x')&&query.get('x').trim()!==''?Number(query.get('x')):item.initial*(item.inverse||unit==='radians'?1:180/PI);
 if(!Number.isFinite(input))input=item.initial*(item.inverse||unit==='radians'?1:180/PI);
 let codeInput=item.initial;
 main.innerHTML=`<div class="breadcrumb"><a href="/trigonometry">← Trigonometry</a><span>/</span><span aria-current="page">${item.name}</span></div><section class="intro"><div><h1>${item.name}</h1><p>${item.description}</p></div><a href="#theorems" class="quiet-button">Related identities ↓</a></section><nav class="trig-function-nav" aria-label="Trigonometric functions">${trigFunctions.map(f=>`<a href="${trigUrl(f)}" ${f.id===item.id?'aria-current="page"':''}>${f.id}</a>`).join('')}</nav>
 <section class="trig-calculator"><div class="trig-controls"><h2>Calculator</h2><label for="trig-unit">${item.inverse?'Output angle unit':'Angle unit'}</label><select id="trig-unit"><option value="radians">Radians</option><option value="degrees">Degrees</option></select><label for="trig-input" id="trig-input-label"></label><input type="number" step="any" id="trig-input"><label for="trig-slider" id="trig-slider-label"></label><input id="trig-slider" type="range" step="any"><div id="trig-presets" class="trig-presets"></div><p id="trig-error" class="error" role="alert"></p><span id="trig-result-label"></span><output id="trig-result" aria-live="polite"></output><div id="trig-conversion" class="trig-conversion"></div><p class="trig-note">${item.inverse?'Inverse results use the principal range stated below.':'The numerical calculator accepts angles within ±10000 radians. Tangent is flagged when |cos θ| < 10⁻¹².'} Values are floating-point approximations.</p></div><div class="trig-plot"><h2>Function graph</h2><div id="trig-graph"></div><p id="trig-graph-caption"></p><p id="trig-offscreen" role="status"></p></div></section>
 <section class="trig-details"><div class="trig-circle"><h2>Unit circle</h2><div id="trig-circle"></div><p>${item.explanation}</p><p id="trig-angle-note"></p></div><div class="trig-properties"><h2>Properties</h2><dl>${Object.entries({Domain:item.domain,Range:item.range,Period:item.period,Symmetry:item.parity,'Derivative (radians)':item.derivative}).map(([key,val])=>`<dt>${key}</dt><dd>${val}</dd>`).join('')}</dl><p class="trig-definition">${item.formula}</p>${item.inverse?'<p>Inverse notation such as sin⁻¹ means arcsine here, not a reciprocal.</p>':''}<div class="theorem-related">${item.related.map(id=>{const f=trigFunctions.find(f=>f.id===id);return `<a href="${trigUrl(f)}">${f.name} →</a>`;}).join('')}</div></div></section>
 ${exactTable(item)}${renderTheorems(item.theorems,trigFunctions,trigUrl)}
 <section class="code-section trig-code"><div class="code-heading"><div><h2>Implementation</h2><p>Arithmetic series and range reduction; no built-in trigonometric calls.</p></div><button id="trig-copy" type="button" class="quiet-button">Copy code</button></div><div class="code-languages">${Object.entries(trigLanguages).map(([key,name])=>`<button type="button" data-trig-language="${key}">${name}</button>`).join('')}</div><p id="trig-code-note">All code inputs and angle outputs use radians. Sine and cosine use Taylor series after angle reduction; arctangent uses an alternating series after reciprocal and half-angle reductions. Arcsine and arccosine use arctangent and square roots. These are educational approximations, not correctly rounded library replacements.</p><pre class="code-source" tabindex="0"><code id="trig-code"></code></pre><p id="trig-copy-status" role="status"></p></section>${footer}`;
 function renderCode(){
  $('#trig-code').textContent=trigSnippet(item,language,codeInput);
  document.querySelectorAll('[data-trig-language]').forEach(b=>{const active=b.dataset.trigLanguage===language;b.setAttribute('aria-pressed',active);b.classList.toggle('selected',active);});$('#trig-copy-status').textContent='';
 }
 function update(save=true){
  const degrees=unit==='degrees',factor=degrees?180/PI:1;
  $('#trig-unit').value=unit;if(document.activeElement!==$('#trig-input'))$('#trig-input').value=Number.isFinite(input)?input:'';
  $('#trig-input-label').textContent=item.inverse?'Input x (dimensionless)':`Angle θ (${unit})`;
  $('#trig-result-label').textContent=item.inverse?`${item.id}(x) · ${unit}`:`${item.id}(θ)`;
  const min=item.graph[0]*(item.inverse?1:factor),max=item.graph[1]*(item.inverse?1:factor);
  $('#trig-slider').min=min;$('#trig-slider').max=max;$('#trig-slider').value=Math.max(min,Math.min(max,Number.isFinite(input)?input:0));
  $('#trig-slider-label').textContent=`Graph range: ${trigFormat(min)} to ${trigFormat(max)}${item.inverse?'':degrees?'°':' rad'}`;
  const presets=item.inverse?[-1,-.5,0,.5,1]:[0,PI/6,PI/4,PI/3,PI/2,PI];
  const labels=item.inverse?presets.map(String):degrees?['0°','30°','45°','60°','90°','180°']:['0','π/6','π/4','π/3','π/2','π'];
  $('#trig-presets').innerHTML=presets.map((v,i)=>`<button type="button" data-trig-value="${v*(item.inverse?1:factor)}">${labels[i]}</button>`).join('');
  document.querySelectorAll('[data-trig-value]').forEach(b=>b.addEventListener('click',()=>{input=Number(b.dataset.trigValue);update();}));
  let graphInput=null,result;
  try{
   result=evaluateTrig(item,input,unit);graphInput=item.inverse?input:input/factor;codeInput=graphInput;
   $('#trig-error').textContent='';$('#trig-result').textContent=trigFormat(result)+(item.inverse&&degrees?'°':'');
   const angle=item.inverse?item.fn(input):graphInput;
   $('#trig-conversion').innerHTML=`<span>Radians</span><span>${trigFormat(angle)}</span><span>Degrees</span><span>${trigFormat(angle*180/PI)}°</span>`;
   $('#trig-circle').innerHTML=unitCircle(angle);$('#trig-angle-note').textContent=item.inverse?'The circle shows the principal angle.':'The circle shows the angle modulo one full turn; the calculator uses the entered angle.';
   const y=item.fn(graphInput);$('#trig-offscreen').textContent=graphInput<item.graph[0]||graphInput>item.graph[1]||y<item.graph[2]||y>item.graph[3]?'The selected point is outside the displayed graph window.':'';
   $('#trig-copy').disabled=false;renderCode();
  }catch(error){
   $('#trig-error').textContent=Number.isFinite(input)?error.message:'Enter a finite number.';$('#trig-result').textContent='Unavailable';$('#trig-conversion').textContent='';$('#trig-circle').innerHTML='<p>Enter a valid input to show the unit-circle point.</p>';$('#trig-angle-note').textContent='';$('#trig-offscreen').textContent='';$('#trig-code').textContent='Enter a valid input to generate a runnable example.';$('#trig-copy').disabled=true;
  }
  $('#trig-graph').innerHTML=trigGraph(item,graphInput,unit);
  $('#trig-graph-caption').textContent=item.inverse?`Horizontal axis: input x. Vertical axis: principal angle in ${unit}.${item.id==='arctan'?' Dashed lines are the limiting angles ±π/2.':''}`:`Horizontal axis: angle in ${unit}. Vertical axis: ${item.id}(θ).${item.id==='tan'?' Dashed lines are vertical asymptotes; branches are drawn separately.':''}`;
  if(save&&Number.isFinite(input)){const url=new URL(location.href);url.searchParams.set('x',String(input));url.searchParams.set('unit',unit);history.replaceState(null,'',url);}
 }
 $('#trig-input').addEventListener('input',e=>{input=e.target.valueAsNumber;update();});
 $('#trig-slider').addEventListener('input',e=>{input=Math.max(Number(e.target.min),Math.min(Number(e.target.max),Number(e.target.value)));update();});
 $('#trig-unit').addEventListener('change',e=>{const next=e.target.value;if(!item.inverse)input*=next==='degrees'?180/PI:PI/180;unit=next;update();});
 document.querySelectorAll('[data-trig-language]').forEach(b=>b.addEventListener('click',()=>{language=b.dataset.trigLanguage;update(false);}));
 $('#trig-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#trig-code').textContent);$('#trig-copy-status').textContent='Copied.';}catch{const range=document.createRange();range.selectNodeContents($('#trig-code'));const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);$('#trig-copy-status').textContent='Code selected. Press Ctrl+C or ⌘C to copy.';}});
 update(false);if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
function exactTable(item){
 const direct=[['0','0°','0','1','0'],['π/6','30°','1/2','√3/2','√3/3'],['π/4','45°','√2/2','√2/2','1'],['π/3','60°','√3/2','1/2','√3'],['π/2','90°','1','0','Undefined'],['π','180°','0','−1','0']];
 const inverse={arcsin:[['−1','−π/2','−90°'],['−1/2','−π/6','−30°'],['0','0','0°'],['1/2','π/6','30°'],['1','π/2','90°']],arccos:[['−1','π','180°'],['−1/2','2π/3','120°'],['0','π/2','90°'],['1/2','π/3','60°'],['1','0','0°']],arctan:[['−√3','−π/3','−60°'],['−1','−π/4','−45°'],['0','0','0°'],['1','π/4','45°'],['√3','π/3','60°']]};
 const headings=item.inverse?['Input x','Angle (radians)','Angle (degrees)']:['Radians','Degrees','sin','cos','tan'],rows=item.inverse?inverse[item.id]:direct;
 return `<section class="trig-reference"><h2>Exact reference values</h2><div class="trig-table-wrap"><table><thead><tr>${headings.map(s=>`<th scope="col">${s}</th>`).join('')}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(s=>`<td>${s}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section>`;
}
