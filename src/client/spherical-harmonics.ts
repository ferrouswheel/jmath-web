const TAU = Math.PI * 2;
import { updateCode } from '../code-highlight.ts';
import { shSnippet } from '../spherical-harmonics-snippets.ts';

// Real SH basis, ordered by band: 1 + 3 + 5 + 7 coefficients.
function basis(x: number, y: number, z: number) {
  return [
    0.282095,
    0.488603 * y, 0.488603 * z, 0.488603 * x,
    1.092548 * x * y, 1.092548 * y * z,
    0.315392 * (3 * z * z - 1), 1.092548 * x * z,
    0.546274 * (x * x - y * y),
    0.590044 * y * (3 * x * x - y * y),
    2.890611 * x * y * z, 0.457046 * y * (5 * z * z - 1),
    0.373176 * z * (5 * z * z - 3), 0.457046 * x * (5 * z * z - 1),
    1.445306 * z * (x * x - y * y), 0.590044 * x * (x * x - 3 * y * y),
  ];
}

const coeffs = [
  [1.9, 1.75, 1.82], // SH0: constant base RGB
  [-0.24, 0.31, 0.72], [0.5, 0.18, -0.08], [0.7, -0.18, -0.42],
  [0.1, -0.32, 0.18], [-0.36, 0.14, 0.18], [0.08, 0.18, -0.34], [0.32, -0.08, 0.22], [-0.16, 0.28, 0.05],
  [0.09, -0.05, 0.12], [-0.09, 0.16, -0.04], [0.16, -0.1, 0.07], [-0.08, 0.04, 0.13], [0.12, 0.06, -0.15], [-0.11, 0.13, 0.04], [0.15, -0.08, 0.1],
];
const defaultCoeffs = coeffs.map((coefficient) => [...coefficient]);

const limits = [1, 4, 9, 16];
function signal(x: number, y: number, z: number, band: number) {
  const b = basis(x, y, z);
  const rgb = [0, 0, 0];
  for (let i = 0; i < limits[band]; i++) {
    for (let c = 0; c < 3; c++) rgb[c] += b[i] * coeffs[i][c];
  }
  return rgb.map((v) => Math.max(0, Math.min(1, v)));
}

function rotate(x: number, y: number, z: number, yaw: number, pitch: number) {
  const cp = Math.cos(pitch), sp = Math.sin(pitch);
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const y1 = y * cp + z * sp, z1 = -y * sp + z * cp;
  return [x * cy - z1 * sy, y1, x * sy + z1 * cy];
}

function cameraFrame(yaw: number, pitch: number) {
  const right = rotate(1, 0, 0, yaw, pitch);
  const up = rotate(0, 1, 0, yaw, pitch);
  const forward = rotate(0, 0, 1, yaw, pitch);
  return { right, up, forward };
}

function dot(a: number[], b: number[]) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

const sphere = document.querySelector<HTMLCanvasElement>('#sh-sphere');
const direction = document.querySelector<HTMLOutputElement>('#sh-direction');
const auto = document.querySelector<HTMLInputElement>('#sh-auto');
const colourList = document.querySelector<HTMLElement>('#sh-coefficient-colours');
const rasterCanvas = document.createElement('canvas');
let band = 3, yaw = -0.44, pitch = 0.18, dragging = false, lastX = 0, lastY = 0;
let animation = 0, lastTime = 0, renderRequest = 0;

function updateDirection() {
  const view = cameraFrame(yaw, pitch).forward;
  if (direction) direction.textContent = `x ${view[0].toFixed(2)}   y ${view[1].toFixed(2)}   z ${view[2].toFixed(2)}`;
}

function requestRender() {
  if (renderRequest) return;
  renderRequest = requestAnimationFrame(() => {
    renderRequest = 0;
    renderSphere();
  });
}

function componentHex(value: number) {
  return Math.round(Math.max(0, Math.min(1, value)) * 255).toString(16).padStart(2, '0');
}

function coefficientColour(index: number) {
  const values = coeffs[index];
  const scale = index === 0 ? 2 : Math.max(.001, ...values.map(Math.abs));
  return `#${values.map((value) => componentHex(Math.abs(value) / scale)).join('')}`;
}

function updateCoefficientVisibility() {
  document.querySelectorAll<HTMLElement>('.sh-colour-row').forEach((row) => {
    row.classList.toggle('hidden', Number(row.dataset.coefficient) >= limits[band]);
  });
}

function redrawMaps() {
  document.querySelectorAll<HTMLCanvasElement>('[data-sh-map]').forEach(drawMap);
}

function redrawBases() {
  document.querySelector<HTMLElement>('#sh-sign-explainer')?.style.setProperty('--example-colour', coefficientColour(3));
  document.querySelectorAll<HTMLCanvasElement>('[data-basis-index]').forEach((canvas) => {
    drawBasis(canvas, Number(canvas.dataset.basisIndex));
  });
}

const signSvg = document.querySelector<SVGSVGElement>('.sh-sign-visual svg');
const directionDot = document.querySelector<SVGCircleElement>('#sh-direction-dot');
const directionRay = document.querySelector<SVGPathElement>('#sh-direction-ray');
const sampleDirection = document.querySelector<HTMLOutputElement>('#sh-sample-direction');
const sampleValue = document.querySelector<HTMLOutputElement>('#sh-sample-value');
const sampleOperation = document.querySelector<HTMLElement>('#sh-sample-operation');
let draggingDirection = false;

function updateSampleDirection(clientX: number, clientY: number) {
  if (!signSvg || !directionDot || !directionRay) return;
  const point = signSvg.createSVGPoint(); point.x = clientX; point.y = clientY;
  const local = point.matrixTransform(signSvg.getScreenCTM()!.inverse());
  const angle = Math.atan2(-(local.y - 75), local.x - 195);
  const nx = Math.cos(angle), ny = Math.sin(angle), x = 195 + nx * 57, y = 75 - ny * 57;
  directionDot.setAttribute('cx', x.toFixed(2)); directionDot.setAttribute('cy', y.toFixed(2));
  directionRay.setAttribute('d', `M195 75L${x.toFixed(2)} ${y.toFixed(2)}`);
  const value = .488603 * nx;
  if (sampleDirection) sampleDirection.textContent = `(${nx >= 0 ? '+' : ''}${nx.toFixed(2)}, ${ny >= 0 ? '+' : ''}${ny.toFixed(2)})`;
  if (sampleValue) sampleValue.textContent = `${value >= 0 ? '+' : ''}${value.toFixed(3)}`;
  if (sampleOperation) sampleOperation.textContent = Math.abs(value) < .015 ? 'zero contribution' : value > 0 ? 'adds RGB' : 'subtracts RGB';
}

signSvg?.addEventListener('pointerdown', (event) => { draggingDirection = true; signSvg.setPointerCapture(event.pointerId); updateSampleDirection(event.clientX, event.clientY); });
signSvg?.addEventListener('pointermove', (event) => { if (draggingDirection) updateSampleDirection(event.clientX, event.clientY); });
signSvg?.addEventListener('pointerup', () => draggingDirection = false);

if (colourList) {
  for (let index = 0; index < coeffs.length; index++) {
    const row = document.createElement('div'); row.className = 'sh-colour-row'; row.dataset.coefficient = String(index);
    const label = document.createElement('label'); label.htmlFor = `sh-colour-${index}`;
    label.innerHTML = `${basisLabel(index)} <small>${index === 0 ? 'base' : `c${index}`}</small>`;
    const input = document.createElement('input'); input.type = 'color'; input.id = `sh-colour-${index}`; input.value = coefficientColour(index);
    input.setAttribute('aria-label', `Colour for ${basisLabel(index)}`);
    input.addEventListener('input', () => {
      const rgb = [1, 3, 5].map((offset) => parseInt(input.value.slice(offset, offset + 2), 16) / 255);
      const magnitude = index === 0 ? 2 : .58;
      coeffs[index] = rgb.map((value) => value * magnitude);
      requestRender(); redrawMaps(); redrawBases();
    });
    row.append(label, input); colourList.append(row);
  }
}

document.querySelector('#sh-reset-colours')?.addEventListener('click', () => {
  defaultCoeffs.forEach((coefficient, index) => coeffs[index] = [...coefficient]);
  document.querySelectorAll<HTMLInputElement>('.sh-colour-row input').forEach((input, index) => input.value = coefficientColour(index));
  requestRender(); redrawMaps(); redrawBases();
});

function renderSphere() {
  if (!sphere) return;
  const box = sphere.getBoundingClientRect();
  // One raster pixel per CSS pixel is ample here and keeps orbiting responsive.
  const dpr = 1;
  const w = Math.max(320, Math.round(box.width * dpr));
  const h = Math.max(320, Math.round(box.height * dpr));
  if (sphere.width !== w || sphere.height !== h) { sphere.width = w; sphere.height = h; }
  const ctx = sphere.getContext('2d')!;
  ctx.clearRect(0, 0, w, h);
  const radius = Math.min(w, h) * .345, cx = w * .5, cy = h * .49;
  const frame = cameraFrame(yaw, pitch);

  // A world-space equatorial orbit gives the camera motion an external frame.
  ctx.save();
  ctx.strokeStyle = '#aaa5c955'; ctx.lineWidth = dpr; ctx.setLineDash([4*dpr, 5*dpr]);
  ctx.beginPath();
  for (let i=0;i<=180;i++) {
    const a=TAU*i/180, p=[Math.cos(a),0,Math.sin(a)];
    const px=cx+dot(p,frame.right)*radius*1.34, py=cy-dot(p,frame.up)*radius*1.34;
    if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
  }
  ctx.stroke();ctx.restore();
  ctx.save();
  ctx.shadowColor = '#34304f2b'; ctx.shadowBlur = 35 * dpr; ctx.shadowOffsetY = 18 * dpr;
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.fillStyle = '#fff'; ctx.fill(); ctx.restore();
  const size = Math.ceil(radius * 2), image = ctx.createImageData(size, size);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const sx = (px - size / 2) / radius, sy = -(py - size / 2) / radius;
    const rr = sx * sx + sy * sy;
    if (rr > 1) continue;
    const sz = Math.sqrt(1 - rr);
    const n = rotate(sx, sy, sz, yaw, pitch);
    const rgb = signal(n[0], n[1], n[2], band);
    const light = .68 + .32 * Math.max(0, sx * -.3 + sy * .45 + sz * .78);
    const edge = Math.min(1, sz * 5);
    const i = (py * size + px) * 4;
    image.data[i] = Math.round((rgb[0] * light * edge + .93 * (1-edge)) * 255);
    image.data[i+1] = Math.round((rgb[1] * light * edge + .93 * (1-edge)) * 255);
    image.data[i+2] = Math.round((rgb[2] * light * edge + .95 * (1-edge)) * 255);
    image.data[i+3] = 255;
  }
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, radius, 0, TAU); ctx.clip();
  rasterCanvas.width = size; rasterCanvas.height = size;
  rasterCanvas.getContext('2d')!.putImageData(image, 0, 0);
  // drawImage respects the circular clip; putImageData does not.
  ctx.drawImage(rasterCanvas, Math.round(cx - size / 2), Math.round(cy - size / 2));
  const shine = ctx.createRadialGradient(cx-radius*.38,cy-radius*.4,0,cx-radius*.3,cy-radius*.34,radius*.75);
  shine.addColorStop(0,'#ffffff55'); shine.addColorStop(1,'#ffffff00'); ctx.fillStyle=shine;ctx.fillRect(cx-radius,cy-radius,radius*2,radius*2);ctx.restore();
  ctx.strokeStyle='#ffffff88';ctx.lineWidth=dpr;ctx.beginPath();ctx.arc(cx,cy,radius-.5*dpr,0,TAU);ctx.stroke();

  // Project fixed world latitude/longitude curves onto the visible hemisphere.
  function worldCurve(points:number[][], color:string, width=1) {
    ctx.save();ctx.strokeStyle=color;ctx.lineWidth=width*dpr;ctx.setLineDash([]);ctx.beginPath();
    let drawing=false;
    for(const p of points){
      const visible=dot(p,frame.forward)>.015;
      const px=cx+dot(p,frame.right)*radius,py=cy-dot(p,frame.up)*radius;
      if(visible){if(!drawing)ctx.moveTo(px,py);else ctx.lineTo(px,py);drawing=true}else drawing=false;
    }
    ctx.stroke();ctx.restore();
  }
  for(const lat of [-Math.PI/3,-Math.PI/6,0,Math.PI/6,Math.PI/3]){
    const pts=[];for(let i=0;i<=240;i++){const a=TAU*i/240,c=Math.cos(lat);pts.push([c*Math.sin(a),Math.sin(lat),c*Math.cos(a)])}
    worldCurve(pts,lat===0?'#ffffff88':'#ffffff4d',lat===0?1.15:0.75);
  }
  for(let lon=0;lon<TAU;lon+=Math.PI/4){
    const pts=[];for(let i=0;i<=160;i++){const lat=-Math.PI/2+Math.PI*i/160,c=Math.cos(lat);pts.push([c*Math.sin(lon),Math.sin(lat),c*Math.cos(lon)])}
    worldCurve(pts,'#ffffff4d',.75);
  }

  // Fixed world axes and labels. Their screen projection changes as the camera orbits.
  const axes=[{v:[1,0,0],label:'+X',color:'#d86664'},{v:[0,1,0],label:'+Y',color:'#52a879'},{v:[0,0,1],label:'+Z',color:'#587ac7'}];
  ctx.font=`600 ${10*dpr}px DM Sans, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  for(const axis of axes){
    const facing=Math.abs(dot(axis.v,frame.forward)),alpha=Math.max(0,Math.min(1,(0.95-facing)/.2));
    if(!alpha)continue;
    const ex=cx+dot(axis.v,frame.right)*radius*1.18,ey=cy-dot(axis.v,frame.up)*radius*1.18;
    const sx=cx+dot(axis.v,frame.right)*radius*1.02,sy=cy-dot(axis.v,frame.up)*radius*1.02;
    ctx.globalAlpha=alpha;
    ctx.strokeStyle=axis.color;ctx.lineWidth=1.5*dpr;ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.fillStyle=axis.color;ctx.fillText(axis.label,ex,ey-9*dpr);
    ctx.globalAlpha=1;
  }
  updateDirection();
}

sphere?.addEventListener('pointerdown', (e) => { dragging=true; lastX=e.clientX;lastY=e.clientY;sphere.setPointerCapture(e.pointerId); });
sphere?.addEventListener('pointermove', (e) => { if(!dragging)return;yaw+=(e.clientX-lastX)*.008;pitch=Math.max(-1.35,Math.min(1.35,pitch-(e.clientY-lastY)*.008));lastX=e.clientX;lastY=e.clientY;updateDirection();requestRender(); });
sphere?.addEventListener('pointerup', () => dragging=false);
document.querySelectorAll<HTMLButtonElement>('[data-band]').forEach(btn => btn.addEventListener('click',()=>{band=Number(btn.dataset.band);document.querySelectorAll('[data-band]').forEach(b=>b.classList.toggle('selected',b===btn));updateCoefficientVisibility();requestRender();}));
document.querySelector('#sh-reset')?.addEventListener('click',()=>{yaw=-.44;pitch=.18;updateDirection();requestRender();});
function tick(time:number){if(auto?.checked&&!dragging){yaw+=(time-lastTime)*.00025;updateDirection();requestRender();}lastTime=time;animation=requestAnimationFrame(tick)}
animation=requestAnimationFrame(tick);

function basisLabel(index:number){ let l=0; while((l+1)*(l+1)<=index)l++; const m=index-l*l-l; return `Y${l}${m<0?'−'+Math.abs(m):m}`; }
document.querySelectorAll<HTMLElement>('[data-basis-start]').forEach(row=>{
  const start=Number(row.dataset.basisStart), count=start===0?1:start===1?3:start===4?5:7;
  for(let k=0;k<count;k++){
    const index=start+k, item=document.createElement('div');item.className='sh-basis-item';
    const canvas=document.createElement('canvas');canvas.width=184;canvas.height=176;canvas.dataset.basisIndex=String(index);item.append(canvas);
    const label=document.createElement('span');label.textContent=basisLabel(index);item.append(label);
    if(equatorMax(index)<1e-9)item.title=`${basisLabel(index)} is zero everywhere on the z = 0 equator`;
    row.append(item);
    drawBasis(canvas,index);
  }
});

function equatorMax(index:number){let m=0;for(let i=0;i<64;i++){const a=TAU*i/64;m=Math.max(m,Math.abs(basis(Math.cos(a),Math.sin(a),0)[index]))}return m}

function drawBasis(canvas:HTMLCanvasElement,index:number){
  const ctx=canvas.getContext('2d')!,cx=canvas.width/2,cy=canvas.height/2;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  if(equatorMax(index)<1e-9){
    // The slice z = 0 vanishes identically; mark the tile instead of leaving it blank.
    ctx.strokeStyle='#e4e3eb';ctx.lineWidth=1;ctx.setLineDash([4,4]);ctx.beginPath();ctx.arc(cx,cy,52,0,TAU);ctx.stroke();ctx.setLineDash([]);
    ctx.fillStyle='#b9bdc9';ctx.font='italic 26px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('≡ 0',cx,cy);return;
  }
  ctx.strokeStyle='#e4e3eb';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,52,0,TAU);ctx.stroke();
  for(let side=0;side<2;side++){
    ctx.beginPath();
    for(let i=0;i<=160;i++){
      const a=TAU*i/160,x=Math.cos(a),y=Math.sin(a),v=basis(x,y,0)[index];
      if((v>=0?0:1)!==side)continue;
      const r=Math.abs(v)*130,px=cx+x*r,py=cy-y*r;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.closePath();ctx.fillStyle=side?'#7378874d':`${coefficientColour(index)}b8`;ctx.fill();
  }
  ctx.fillStyle='#fff';ctx.strokeStyle='#bbb8ca';ctx.beginPath();ctx.arc(cx,cy,3,0,TAU);ctx.fill();ctx.stroke();
}

function drawMap(canvas: HTMLCanvasElement) {
  const ctx=canvas.getContext('2d')!, b=Number(canvas.dataset.shMap), img=ctx.createImageData(canvas.width,canvas.height);
  for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){
    // Longitude zero sits on +X and rises toward +Z, matching the 3D basis explorer.
    const lon=(x/canvas.width-.5)*TAU,lat=(.5-y/canvas.height)*Math.PI,c=Math.cos(lat);
    const rgb=signal(c*Math.cos(lon),Math.sin(lat),c*Math.sin(lon),b),i=(y*canvas.width+x)*4;
    img.data[i]=rgb[0]*255;img.data[i+1]=rgb[1]*255;img.data[i+2]=rgb[2]*255;img.data[i+3]=255;
  }
  ctx.putImageData(img,0,0);ctx.strokeStyle='#ffffff33';ctx.setLineDash([3,4]);
  for(let i=1;i<4;i++){ctx.beginPath();ctx.moveTo(canvas.width*i/4,0);ctx.lineTo(canvas.width*i/4,canvas.height);ctx.stroke()}
  ctx.beginPath();ctx.moveTo(0,canvas.height/2);ctx.lineTo(canvas.width,canvas.height/2);ctx.stroke();
  ctx.setLineDash([]);ctx.fillStyle='#ffffffc4';ctx.font='600 9px DM Sans, sans-serif';ctx.textAlign='center';
  ctx.shadowColor='#00000059';ctx.shadowBlur=2;
  ctx.fillText('−Z',canvas.width*.25,canvas.height-5);ctx.fillText('+X',canvas.width*.5,canvas.height-5);ctx.fillText('+Z',canvas.width*.75,canvas.height-5);
  ctx.shadowColor='transparent';ctx.shadowBlur=0;
}
document.querySelectorAll<HTMLCanvasElement>('[data-sh-map]').forEach(drawMap);

new ResizeObserver(requestRender).observe(sphere!);
updateDirection();
updateCoefficientVisibility();
redrawBases();
requestRender();
document.fonts.ready.then(requestRender);

const codeElement = document.querySelector<HTMLElement>('#sh-code');
document.querySelectorAll<HTMLButtonElement>('[data-sh-language]').forEach((button) => button.addEventListener('click', () => {
  const language = button.dataset.shLanguage!;
  document.querySelectorAll('[data-sh-language]').forEach((b) => b.classList.toggle('selected', b === button));
  if (codeElement) updateCode(codeElement, shSnippet(language), language);
}));
document.querySelector('#sh-copy-code')?.addEventListener('click', async () => {
  const status = document.querySelector('#sh-copy-status');
  try {
    await navigator.clipboard.writeText(codeElement?.textContent ?? '');
    if (status) status.textContent = 'Copied.';
  } catch {
    if (status) status.textContent = 'Code selected. Press Ctrl+C or ⌘C to copy.';
  }
});
window.addEventListener('beforeunload',()=>{cancelAnimationFrame(animation);cancelAnimationFrame(renderRequest)});
