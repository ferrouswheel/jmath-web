import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { colorSpaces, toLinear, fromLinear, colorHex, parseHex, inGamut, decodeSRGB, encodeSRGB, adjustmentDefaults, adjustmentLut, adjustPixels, colorAtPath } from '../src/color-math.js';
import { colorSnippet, colorAlgorithm, colorExample } from '../src/color-snippets.js';
const close=(a,b,t=2e-6)=>assert.ok(Math.abs(a-b)<t,`${a} != ${b}`);
test('color transfer functions, reference whites and primary coordinates',()=>{
 close(decodeSRGB(.5),.21404114048223255,1e-12);close(encodeSRGB(.18),.46135612950044164,1e-12);
 for(const c of [-.5,0,.003,.04045,.5,1,1.5])close(encodeSRGB(decodeSRGB(c)),c,1e-7);
 const white=fromLinear('xyz',[1,1,1]);white.forEach((v,i)=>close(v,[.950455927,1,1.089057751][i],1e-8));
 const lab=fromLinear('lab',[1,1,1]);lab.forEach((v,i)=>close(v,[100,0,0][i],1e-5));
 fromLinear('oklab',[1,0,0]).forEach((v,i)=>close(v,[.62795536,.22486306,.1258463][i],1e-7));
 fromLinear('hsl',[1,0,0]).forEach((v,i)=>close(v,[0,100,50][i]));fromLinear('hsv',[0,1,0]).forEach((v,i)=>close(v,[120,100,100][i]));
 assert.equal(colorHex(toLinear('srgb',[59,130,246])),'#3b82f6');assert.deepEqual(parseHex('#3b82f6'),[59,130,246]);
});
test('all seven color spaces round trip without quantising intermediate values',()=>{
 const fixtures=[[0,0,0],[1,1,1],[1,0,0],[0,1,0],[0,0,1],[.18,.18,.18]];
 for(let i=0;i<100;i++)fixtures.push([(i*17%101)/101,(i*31%103)/103,(i*47%107)/107]);
 for(const rgb of fixtures)for(const space of colorSpaces){const coords=fromLinear(space.id,rgb);const bounded=coords.map((v,i)=>Math.max(space.bounds[i][0],Math.min(space.bounds[i][1],v)));toLinear(space.id,bounded).forEach((v,i)=>close(v,rgb[i]));}
 const wide=toLinear('oklab',[.7,.4,.3]);assert.equal(inGamut(wide),false);assert.equal(fromLinear('hsl',wide),null);assert.ok(fromLinear('srgb',wide).some(v=>v<0||v>255));assert.match(colorHex(wide),/^#[a-f0-9]{6}$/);
 for(const bad of [[],[NaN,0,0],[-1,0,0],[256,0,0]])assert.throws(()=>toLinear('srgb',bad));assert.throws(()=>parseHex('oops'));assert.equal(colorAtPath('/color-math/image/').page,'image');assert.equal(colorAtPath('/color-math/no'),null);
});
test('neutral image adjustment preserves every byte and alpha without accumulating edits',()=>{
 const pixels=new Uint8ClampedArray(256*4);for(let i=0;i<256;i++)pixels.set([i,255-i,i,i],i*4);const original=pixels.slice();
 for(const space of ['linear','srgb']){const result=adjustPixels(pixels,{...adjustmentDefaults,space});assert.deepEqual(result.data,pixels);assert.equal(result.visible,255);assert.equal(result.low,0);assert.equal(result.high,0);assert.equal(result.histogram.reduce((a,b)=>a+b,0),255);}
 const adjusted=adjustPixels(pixels,{...adjustmentDefaults,gain:2});for(let i=3;i<pixels.length;i+=4)assert.equal(adjusted.data[i],pixels[i]);assert.deepEqual(pixels,original);
 assert.deepEqual(adjustPixels(pixels,adjustmentDefaults).data,original);
});
test('image operation conventions, clipping and linear versus encoded gain',()=>{
 const linear=adjustmentLut({...adjustmentDefaults,gain:2}),encoded=adjustmentLut({...adjustmentDefaults,gain:2,space:'srgb'});
 assert.equal(linear.values[128],176);assert.equal(encoded.values[128],255);
 const gain=adjustmentLut({...adjustmentDefaults,gain:2}),exposure=adjustmentLut({...adjustmentDefaults,exposure:1});assert.deepEqual(gain.values,exposure.values);
 assert.equal(adjustmentLut({...adjustmentDefaults,contrast:0}).values[0],118);assert.equal(adjustmentLut({...adjustmentDefaults,contrast:0,space:'srgb'}).values[255],128);
 const result=adjustPixels(new Uint8ClampedArray([0,0,0,255,255,255,255,255,255,0,0,0]),{...adjustmentDefaults,brightness:.5});assert.equal(result.high,1);assert.equal(result.low,0);assert.equal(result.visible,2);
 assert.throws(()=>adjustmentLut({...adjustmentDefaults,gamma:0}));assert.throws(()=>adjustPixels(new Uint8ClampedArray(3),adjustmentDefaults));
});
for(const language of ['js','python','c'])test(`${language} color examples match transfer and pixel calculations`,()=>{
 const dir=mkdtempSync(join(tmpdir(),'jmath-color-'));try{
  for(const settings of [null,adjustmentDefaults,{...adjustmentDefaults,gain:1.8,exposure:-.5,contrast:1.2,brightness:.1,gamma:.8},{...adjustmentDefaults,space:'srgb',gain:.7,contrast:1.5,brightness:-.1,gamma:1.8}]){
   const source=colorSnippet(language,settings);let output;
   if(language==='js'){output=[];vm.runInNewContext(source,{console:{log:v=>output.push(v)}});}
   if(language==='python')output=execFileSync('python3',['-c',source],{encoding:'utf8'}).trim().split('\n').map(Number);
   if(language==='c'){const file=join(dir,'color.c'),binary=join(dir,'color');writeFileSync(file,source);execFileSync('cc',['-std=c99','-Wall','-Wextra','-Werror',file,'-lm','-o',binary]);output=execFileSync(binary,[],{encoding:'utf8'}).trim().split('\n').map(Number);}
   if(settings)assert.equal(output[0],adjustmentLut(settings).values[128]);else{close(output[0],decodeSRGB(.5),1e-10);close(output[1],.5,1e-10);}
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('one reusable image algorithm accepts changing settings for all byte values',()=>{
 const algorithm=colorAlgorithm('js',true),context=vm.createContext({});vm.runInContext(algorithm,context);
 for(const space of ['linear','srgb'])for(const gain of [0,.7,2,4]){
  const settings={...adjustmentDefaults,space,gain,contrast:1.2,brightness:.03,gamma:.8};context.settings=settings;
  const actual=vm.runInContext('Array.from({length:256}, (_, byte) => adjustByte(byte, settings))',context);
  assert.deepEqual(Array.from(actual),Array.from(adjustmentLut(settings).values));
  assert.equal(colorSnippet('js',settings),algorithm+'\n'+colorExample('js',settings));
 }
});
