import test from 'node:test';
import assert from 'node:assert/strict';
import { MAX_TRIALS, experimentDefaults, validateExperiment, theoreticalExperiment, createExperiment, addTrials, experimentSummary, experimentCsv } from '../src/experiments.js';
const near = (a,b,tolerance=1e-10) => assert.ok(Math.abs(a-b)<=tolerance,`${a} != ${b}`);

test('fair dice sums use exact convolution and correct moments',()=>{
  const one=theoreticalExperiment('dice',{count:1,sides:6});
  assert.deepEqual(one.outcomes,[1,2,3,4,5,6]);one.probabilities.forEach(p=>near(p,1/6));
  const two=theoreticalExperiment('dice',{count:2,sides:6});
  assert.deepEqual(two.outcomes,[2,3,4,5,6,7,8,9,10,11,12]);
  two.probabilities.forEach((p,i)=>near(p,[1,2,3,4,5,6,5,4,3,2,1][i]/36));
  near(two.mean,7);near(two.variance,35/6);
  assert.match(two.name,/Sum/);assert.match(two.relation,/convolution/);
  for(const sides of [2,6,20])for(const count of [1,2,6]){
    const t=theoreticalExperiment('dice',{count,sides});
    near(t.probabilities.reduce((s,p)=>s+p,0),1);
    near(t.probabilities.reduce((s,p,i)=>s+p*t.outcomes[i],0),t.mean);
    near(t.probabilities.reduce((s,p,i)=>s+p*(t.outcomes[i]-t.mean)**2,0),t.variance);
    t.probabilities.forEach((p,i)=>near(p,t.probabilities.at(-i-1)));
  }
});
test('coin head counts match Bernoulli and Binomial, including bias endpoints',()=>{
  const one=theoreticalExperiment('coins',{count:1,p:.7});
  near(one.probabilities[0],.3);near(one.probabilities[1],.7);
  assert.equal(one.href,'/distributions/bernoulli?p=0.7');
  const two=theoreticalExperiment('coins',{count:2,p:.5});
  two.probabilities.forEach((p,i)=>near(p,[.25,.5,.25][i]));
  assert.equal(two.href,'/distributions/binomial?n=2&p=0.5');
  for(const p of [0,.7,1]){
    const t=theoreticalExperiment('coins',{count:100,p});
    near(t.probabilities.reduce((s,p)=>s+p,0),1);
    near(t.mean,100*p);near(t.variance,100*p*(1-p));
  }
});
test('seeded batches reproduce the same sequence as single trials',()=>{
  for(const kind of ['dice','coins']){
    const settings=experimentDefaults(kind),a=createExperiment(kind,settings,'same'),b=createExperiment(kind,settings,'same');
    addTrials(a,1000);for(let i=0;i<1000;i++)addTrials(b,1);
    assert.deepEqual(a.samples,b.samples);assert.deepEqual(a.frequencies,b.frequencies);
    assert.equal(a.total,1000);assert.equal(a.frequencies.reduce((s,n)=>s+n,0),a.total);
    const summary=experimentSummary(a),mean=a.samples.reduce((s,v)=>s+v,0)/a.total;
    near(summary.mean,mean);near(summary.variance,a.samples.reduce((s,v)=>s+(v-mean)**2,0)/a.total);
    assert.ok(summary.distance>=0&&summary.distance<=1);
  }
});
test('large samples approximate theory and deterministic coins stay deterministic',()=>{
  for(const [kind,settings] of [['dice',{count:2,sides:6}],['coins',{count:10,p:.7}]]){
    const e=createExperiment(kind,settings,'convergence');addTrials(e,50000);
    const summary=experimentSummary(e);assert.ok(summary.distance<.02);
    near(summary.mean,e.theory.mean,.04);near(summary.variance,e.theory.variance,.08);
  }
  for(const p of [0,1]){
    const e=createExperiment('coins',{count:100,p},'endpoint');addTrials(e,100);
    assert.ok(e.samples.every(x=>x===100*p));assert.equal(experimentSummary(e).distance,0);
  }
});
test('invalid settings and batches cannot corrupt an experiment',()=>{
  for(const [kind,p] of [['dice',{count:0,sides:6}],['dice',{count:1.5,sides:6}],['dice',{count:1,sides:21}],['coins',{count:1,p:NaN}],['coins',{count:101,p:.5}]]){
    assert.ok(validateExperiment(kind,p));assert.throws(()=>createExperiment(kind,p));
  }
  const e=createExperiment('dice',{count:1,sides:2},'capacity');
  for(const n of [0,-1,1.5,NaN,MAX_TRIALS+1])assert.throws(()=>addTrials(e,n));
  assert.equal(e.total,0);assert.equal(experimentSummary(e).mean,null);
  addTrials(e,MAX_TRIALS);assert.throws(()=>addTrials(e,1));assert.equal(e.total,MAX_TRIALS);
});
test('CSV preserves counts, probabilities and experiment settings',()=>{
  const e=createExperiment('coins',{count:1,p:1},'csv');addTrials(e,7);
  const rows=experimentCsv(e).split('\n').map(line=>line.split(','));
  assert.equal(rows.length,3);assert.deepEqual(rows[2],['1','7','1','1','7','7','coins','1','','1']);
  assert.equal(rows[1][1],'0');
});
