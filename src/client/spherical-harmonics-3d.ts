export {};
const TAU = Math.PI * 2;
type V3 = [number, number, number];

function basis(x:number,y:number,z:number){return[
  .282095,.488603*y,.488603*z,.488603*x,
  1.092548*x*y,1.092548*y*z,.315392*(3*z*z-1),1.092548*x*z,.546274*(x*x-y*y),
  .590044*y*(3*x*x-y*y),2.890611*x*y*z,.457046*y*(5*z*z-1),.373176*z*(5*z*z-3),
  .457046*x*(5*z*z-1),1.445306*z*(x*x-y*y),.590044*x*(x*x-3*y*y),
]}
const meta=[
  [0,0,'constant'],[1,-1,'0.489 y'],[1,0,'0.489 z'],[1,1,'0.489 x'],
  [2,-2,'1.093 xy'],[2,-1,'1.093 yz'],[2,0,'0.315 (3z² − 1)'],[2,1,'1.093 xz'],[2,2,'0.546 (x² − y²)'],
  [3,-3,'0.590 y(3x² − y²)'],[3,-2,'2.891 xyz'],[3,-1,'0.457 y(5z² − 1)'],[3,0,'0.373 z(5z² − 3)'],
  [3,1,'0.457 x(5z² − 1)'],[3,2,'1.445 z(x² − y²)'],[3,3,'0.590 x(x² − 3y²)'],
] as const;
const sub=['₀','₁','₂','₃'], sup:Record<string,string>={'-3':'⁻³','-2':'⁻²','-1':'⁻¹','0':'⁰','1':'¹','2':'²','3':'³'};
const label=(i:number)=>`Y${sub[meta[i][0]]}${sup[String(meta[i][1])]}`;
const dot=(a:V3,b:V3)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
function frame(yaw:number,pitch:number){const cy=Math.cos(yaw),sy=Math.sin(yaw),cp=Math.cos(pitch),sp=Math.sin(pitch);return{right:[cy,0,sy] as V3,up:[sp*sy,cp,-sp*cy] as V3,forward:[-cp*sy,sp,cp*cy] as V3}}

const canvas=document.querySelector<HTMLCanvasElement>('#sh3-canvas')!;
const picker=document.querySelector<HTMLElement>('#sh3-basis-picker')!;
const sphereToggle=document.querySelector<HTMLInputElement>('#sh3-sphere-toggle')!;
const wireToggle=document.querySelector<HTMLInputElement>('#sh3-wire-toggle')!;
const autoToggle=document.querySelector<HTMLInputElement>('#sh3-auto-toggle')!;
const lonInput=document.querySelector<HTMLInputElement>('#sh3-lon')!,latInput=document.querySelector<HTMLInputElement>('#sh3-lat')!;
let selected=0,yaw=-.65,pitch=.38,dragging=false,lastX=0,lastY=0,renderQueued=0,lastTime=0;

for(let i=0;i<16;i++){const button=document.createElement('button');button.type='button';button.textContent=label(i);button.dataset.index=String(i);if(i===0)button.classList.add('selected');button.setAttribute('aria-label',`Select ${label(i)}, ${meta[i][2]}`);button.addEventListener('click',()=>{selected=i;picker.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===button));updateText();queueRender()});picker.append(button)}

function maxFor(index:number){let max=0;for(let a=0;a<50;a++)for(let b=0;b<30;b++){const lon=TAU*a/50,lat=-Math.PI/2+Math.PI*b/29,c=Math.cos(lat);max=Math.max(max,Math.abs(basis(c*Math.cos(lon),Math.sin(lat),c*Math.sin(lon))[index]))}return max}
const maxima=Array.from({length:16},(_,i)=>maxFor(i));
function project(p:V3,f:ReturnType<typeof frame>,cx:number,cy:number,scale:number){return{x:cx+dot(p,f.right)*scale,y:cy-dot(p,f.up)*scale,z:dot(p,f.forward)}}
function unit(lon:number,lat:number):V3{const c=Math.cos(lat);return[c*Math.cos(lon),Math.sin(lat),c*Math.sin(lon)]}

function render(){
  renderQueued=0;const box=canvas.getBoundingClientRect(),w=Math.max(360,Math.round(box.width)),h=Math.max(420,Math.round(box.height));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h}
  const ctx=canvas.getContext('2d')!,cx=w/2,cy=h*.52,scale=Math.min(w,h)*.31,f=frame(yaw,pitch);ctx.clearRect(0,0,w,h);
  // World axes anchor the orbit.
  const axes:[V3,string,string][]=[[[1,0,0],'+X','#d46663'],[[0,1,0],'+Y','#4e9d76'],[[0,0,1],'+Z','#5879c1']];
  ctx.font='600 10px DM Sans';ctx.textAlign='center';for(const [v,name,color] of axes){const a=project([0,0,0],f,cx,cy,scale),b=project([v[0]*1.52,v[1]*1.52,v[2]*1.52],f,cx,cy,scale);ctx.strokeStyle=color;ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.fillStyle=color;ctx.fillText(name,b.x,b.y-7)}
  if(sphereToggle.checked)drawSphereGuide(ctx,f,cx,cy,scale*.72);
  const rows=28,cols=44,vertices:{p:V3;v:number}[][]=[];
  for(let r=0;r<=rows;r++){const lat=-Math.PI/2+Math.PI*r/rows,row:{p:V3;v:number}[]=[];for(let c=0;c<=cols;c++){const n=unit(TAU*c/cols,lat),v=basis(...n)[selected],rad=Math.abs(v)/maxima[selected]*1.28;row.push({p:[n[0]*rad,n[1]*rad,n[2]*rad],v})}vertices.push(row)}
  const tris:{pts:{x:number;y:number;z:number}[];depth:number;value:number;light:number}[]=[];
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const q=[vertices[r][c],vertices[r][c+1],vertices[r+1][c+1],vertices[r+1][c]];for(const ids of [[0,1,2],[0,2,3]]){const vs=ids.map(i=>q[i]);const pts=vs.map(v=>project(v.p,f,cx,cy,scale));tris.push({pts,depth:pts.reduce((s,p)=>s+p.z,0)/3,value:vs.reduce((s,v)=>s+v.v,0)/3,light:.72+.28*Math.max(0,vs.reduce((s,v)=>s+dot(v.p,[.35,.7,.6]),0)/3)})}}
  tris.sort((a,b)=>a.depth-b.depth);for(const tri of tris){const base=tri.value>=0?[117,103,216]:[239,133,113],k=tri.light;ctx.beginPath();ctx.moveTo(tri.pts[0].x,tri.pts[0].y);ctx.lineTo(tri.pts[1].x,tri.pts[1].y);ctx.lineTo(tri.pts[2].x,tri.pts[2].y);ctx.closePath();ctx.fillStyle=`rgb(${base.map(v=>Math.round(v*k)).join(',')})`;ctx.fill();if(wireToggle.checked){ctx.strokeStyle='#ffffff55';ctx.lineWidth=.45;ctx.stroke()}}
  // Sample n lives on the unit-sphere guide, separate from lobe radius.
  const lon=Number(lonInput.value)*Math.PI/180,lat=Number(latInput.value)*Math.PI/180,n=unit(lon,lat),end:V3=[n[0]*.72,n[1]*.72,n[2]*.72],o=project([0,0,0],f,cx,cy,scale),p=project(end,f,cx,cy,scale);
  ctx.strokeStyle='#333846bb';ctx.setLineDash([3,3]);ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fff';ctx.strokeStyle='#2e3340';ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(p.x,p.y,6,0,TAU);ctx.fill();ctx.stroke();ctx.fillStyle='#343846';ctx.font='italic 12px Georgia';ctx.fillText('n',p.x+12,p.y-9);
}
function drawSphereGuide(ctx:CanvasRenderingContext2D,f:ReturnType<typeof frame>,cx:number,cy:number,scale:number){ctx.save();ctx.strokeStyle='#8d91a43b';ctx.lineWidth=.8;ctx.setLineDash([3,4]);for(const lat of [-Math.PI/3,-Math.PI/6,0,Math.PI/6,Math.PI/3]){ctx.beginPath();for(let i=0;i<=100;i++){const p=project(unit(TAU*i/100,lat),f,cx,cy,scale);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke()}for(let lon=0;lon<TAU;lon+=Math.PI/4){ctx.beginPath();for(let i=0;i<=80;i++){const p=project(unit(lon,-Math.PI/2+Math.PI*i/80),f,cx,cy,scale);i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.stroke()}ctx.restore()}
function queueRender(){if(!renderQueued)renderQueued=requestAnimationFrame(render)}
function updateText(){document.querySelector('#sh3-title')!.textContent=label(selected);document.querySelector('#sh3-formula')!.textContent=meta[selected][2];updateSample()}
function updateSample(){const lon=Number(lonInput.value)*Math.PI/180,lat=Number(latInput.value)*Math.PI/180,n=unit(lon,lat),v=basis(...n)[selected];document.querySelector('#sh3-lon-value')!.textContent=`${lonInput.value}°`;document.querySelector('#sh3-lat-value')!.textContent=`${latInput.value}°`;document.querySelector('#sh3-n-value')!.textContent=`(${n.map(x=>x.toFixed(2)).join(', ')})`;document.querySelector('#sh3-y-value')!.textContent=`${v>=0?'+':''}${v.toFixed(3)}`;queueRender()}
canvas.addEventListener('pointerdown',e=>{dragging=true;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!dragging)return;yaw+=(e.clientX-lastX)*.009;pitch=Math.max(-1.45,Math.min(1.45,pitch-(e.clientY-lastY)*.009));lastX=e.clientX;lastY=e.clientY;queueRender()});canvas.addEventListener('pointerup',()=>dragging=false);
[sphereToggle,wireToggle].forEach(el=>el.addEventListener('change',queueRender));[lonInput,latInput].forEach(el=>el.addEventListener('input',updateSample));document.querySelector('#sh3-reset-view')?.addEventListener('click',()=>{yaw=-.65;pitch=.38;queueRender()});
function tick(time:number){if(autoToggle.checked&&!dragging){yaw+=(time-lastTime)*.00022;queueRender()}lastTime=time;requestAnimationFrame(tick)}requestAnimationFrame(tick);new ResizeObserver(queueRender).observe(canvas);updateText();queueRender();
