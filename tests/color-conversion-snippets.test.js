import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {colorSpaces,toLinear,fromLinear} from '../src/color-math.js';
import {conversionAlgorithm,conversionExample} from '../src/color-conversion-snippets.js';
const close=(a,b)=>assert.ok(Math.abs(a-b)<2e-6,`${a} != ${b}`);
const cases=[];
const rgbs=[[0,0,0],[1,1,1],[1,0,0],[0,1,0],[0,0,1],[.18,.18,.18],[.043735,.223228,.921582],[.9,.1,.04]];
for(const source of colorSpaces){
 const values=rgbs.map(rgb=>fromLinear(source.id,rgb).map((v,i)=>Math.max(source.bounds[i][0],Math.min(source.bounds[i][1],v))));
 if(source.id==='hsl'||source.id==='hsv')values.push([360,100,50]);
 if(source.id==='oklab')values.push([.7,.4,.3]);
 if(source.id==='lab')values.push([50,120,-120]);
 if(source.id==='xyz')values.push([0,1,0]);
 for(const value of values)for(const target of colorSpaces)cases.push({source:source.id,target:target.id,values:value,expected:fromLinear(target.id,toLinear(source.id,value))});
}
for(const language of ['js','python','c'])test(`${language} generic converter handles every space pair and domain cases`,()=>{
 const dir=mkdtempSync(join(tmpdir(),'jmath-convert-'));try{
  const algorithm=conversionAlgorithm(language);let output;
  if(language==='js'){
   const context=vm.createContext({cases});vm.runInContext(algorithm,context);output=vm.runInContext('cases.map(c=>convertColor(c.values,c.source,c.target))',context);
   for(const code of ['convertColor([0,0,0],"missing","lab")','convertColor([NaN,0,0],"srgb","lab")','convertColor([256,0,0],"srgb","lab")','convertColor([0,0],"srgb","lab")','convertColor([0,0,0],"srgb","constructor")'])assert.throws(()=>vm.runInContext(code,context));
  }
  if(language==='python'){
   const file=join(dir,'convert.py');writeFileSync(file,algorithm+`\nimport json\ncases = json.loads(${JSON.stringify(JSON.stringify(cases))})\nprint(json.dumps([convert_color(c['values'], c['source'], c['target']) for c in cases]))\nfor values, source, target in [([0,0,0], 'missing', 'lab'), ([float('nan'),0,0], 'srgb','lab'), ([256,0,0], 'srgb','lab'), ([0,0], 'srgb','lab')]:\n    try: convert_color(values, source, target)\n    except ValueError: pass\n    else: raise AssertionError('Invalid input accepted')\n`);output=JSON.parse(execFileSync('python3',[file],{encoding:'utf8'}));
  }
  if(language==='c'){
   const file=join(dir,'convert.c'),binary=join(dir,'convert');writeFileSync(file,algorithm+`\nint main(void) {\n    double values[3], out[3] = {7,8,9}; int source, target;\n    if (convert_color(NULL, SRGB, LAB, out) != COLOR_INVALID) return 2;\n    if (out[0] != 7) return 3;\n    double invalid[3] = {NAN,0,0};\n    if (convert_color(invalid, SRGB, LAB, out) != COLOR_INVALID) return 4;\n    invalid[0] = 256;\n    if (convert_color(invalid, SRGB, LAB, out) != COLOR_INVALID) return 5;\n    invalid[0] = 0;\n    if (convert_color(invalid, (ColorSpace)-1, LAB, out) != COLOR_INVALID) return 6;\n    double wide[3] = {0.7,0.4,0.3};\n    if (convert_color(wide, OKLAB, HSL, out) != COLOR_OUT_OF_GAMUT || out[0] != 7) return 7;\n    while (scanf("%d %d %lf %lf %lf", &source, &target, &values[0], &values[1], &values[2]) == 5) {\n        ColorStatus status = convert_color(values, (ColorSpace)source, (ColorSpace)target, values);\n        if (status == COLOR_OUT_OF_GAMUT) puts("null");\n        else if (status != COLOR_OK) return 8;\n        else printf("[%.17g,%.17g,%.17g]\\n",values[0],values[1],values[2]);\n    }\n    return 0;\n}\n`);execFileSync('cc',['-std=c99','-Wall','-Wextra','-Werror',file,'-lm','-o',binary]);
   const ids=colorSpaces.map(s=>s.id);output=execFileSync(binary,[],{input:cases.map(c=>[ids.indexOf(c.source),ids.indexOf(c.target),...c.values].join(' ')).join('\n'),encoding:'utf8'}).trim().split('\n').map(JSON.parse);
  }
  assert.equal(output.length,cases.length);cases.forEach((c,i)=>{if(c.expected===null)assert.equal(output[i],null);else c.expected.forEach((v,j)=>close(output[i][j],v));});
 }finally{rmSync(dir,{recursive:true,force:true});}
});
test('usage examples supply source, target and coordinates separately',()=>{
 for(const language of ['js','python','c']){
  const first=conversionExample(language,{source:'srgb',target:'lab',values:[59,130,246]});
  const next=conversionExample(language,{source:'hsl',target:'oklab',values:[180,50,50]});
  assert.notEqual(first,next);assert.ok(first.includes(language==='c'?'SRGB':'srgb'));assert.ok(next.includes(language==='c'?'OKLAB':'oklab'));
  assert.throws(()=>conversionExample(language,{source:'srgb',target:'xyz',values:[NaN,0,0]}));
 }
});
