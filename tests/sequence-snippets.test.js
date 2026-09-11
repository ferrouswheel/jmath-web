import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { sequences, sequenceTerm } from '../src/sequences.js';
import { sequenceSnippet, cSequenceLimit } from '../src/sequence-snippets.js';
function run(source,language){
  if(language==='js'){
    const values=[];runInNewContext(source,{console:{log:v=>values.push(String(v))}},{timeout:10000});return values;
  }
  const dir=mkdtempSync(join(tmpdir(),'jmath-sequence-'));
  try{
    const file=join(dir,language==='c'?'sequence.c':'sequence.py');writeFileSync(file,source);
    if(language==='python')return execFileSync('python3',[file],{encoding:'utf8',timeout:10000}).trim().split('\n');
    const binary=join(dir,'sequence');execFileSync('cc',['-std=c99','-Wall','-Wextra','-Werror',file,'-o',binary],{timeout:10000});
    return execFileSync(binary,[],{encoding:'utf8',timeout:10000}).trim().split('\n');
  }finally{rmSync(dir,{recursive:true,force:true});}
}
for(const language of ['js','python','c']){
  const executable=language==='python'?'python3':'cc';
  const available=language==='js'||spawnSync(executable,['--version']).status===0;
  test(`${language} sequence snippets return exact terms at range boundaries`,{skip:available?false:`${executable} unavailable`},()=>{
    for(const s of sequences){
      assert.deepEqual(run(sequenceSnippet(s,language,s.initial),language),[String(sequenceTerm(s,s.initial))]);
      const values=[s.min,5,25,language==='c'?cSequenceLimit(s):1000],name='nth_'+s.id.replaceAll('-','_');
      let source=sequenceSnippet(s,language,s.initial,{example:false});
      if(language==='c')source+='\nint main(void) { uint64_t result;\n';
      for(const n of values){
        if(language==='js')source+=`console.log(${name}(${n}).toString());\n`;
        else if(language==='python')source+=`print(${name}(${n}))\n`;
        else source+=`if (!${name}(${n}, &result)) return 2;\nprintf("%" PRIu64 "\\n", result);\n`;
      }
      if(language==='c')source+=`if (${name}(${cSequenceLimit(s)+1}, &result)) return 3;\nif (${name}(${s.min}, NULL)) return 4;\nreturn 0;\n}\n`;
      assert.deepEqual(run(source,language),values.map(n=>String(sequenceTerm(s,n))),s.id);
    }
  });
}
