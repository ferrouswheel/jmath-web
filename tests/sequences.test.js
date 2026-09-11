import test from 'node:test';
import assert from 'node:assert/strict';
import { sequences, sequenceTerm, fibonacci, fibonacciTiles, polygonDots, isPrime } from '../src/sequences.js';
import { sequenceGeometry } from '../src/sequence-visuals.js';
const get=id=>sequences.find(s=>s.id===id);
const fixtures={squares:[0,1,4,9,16,25,36],cubes:[0,1,8,27,64,125,216],fibonacci:[0,1,1,2,3,5,8],triangular:[0,1,3,6,10,15,21],pentagonal:[0,1,5,12,22,35,51],hexagonal:[0,1,6,15,28,45,66],'powers-of-two':[1,2,4,8,16,32,64],primes:[2,3,5,7,11,13,17]};
test('sequence definitions agree with known terms and large exact values',()=>{
  assert.equal(sequences.length,8);
  for(const s of sequences)fixtures[s.id].forEach((v,i)=>assert.equal(sequenceTerm(s,s.min+i),BigInt(v),s.id));
  assert.equal(sequenceTerm(get('fibonacci'),100),354224848179261915075n);
  assert.equal(String(sequenceTerm(get('fibonacci'),1000)).length,209);
  assert.equal(sequenceTerm(get('powers-of-two'),100),1267650600228229401496703205376n);
  assert.equal(sequenceTerm(get('primes'),1000),7919n);
  assert.equal(sequenceTerm(get('cubes'),1000),1000000000n);
  for(const s of sequences)for(const n of [-1,1001,1.5,NaN,Infinity])assert.throws(()=>sequenceTerm(s,n));
  assert.throws(()=>sequenceTerm(get('primes'),0));
});
test('figurate identities hold across the supported range',()=>{
  for(let n=1;n<=1000;n++){
    assert.equal(sequenceTerm(get('squares'),n),sequenceTerm(get('triangular'),n)+sequenceTerm(get('triangular'),n-1));
    assert.equal(sequenceTerm(get('pentagonal'),n),BigInt(n)+3n*sequenceTerm(get('triangular'),n-1));
    if(2*n-1<=1000)assert.equal(sequenceTerm(get('hexagonal'),n),sequenceTerm(get('triangular'),2*n-1));
  }
});
test('polygon dot counts and added layers agree with formulas',()=>{
  for(const [id,sides] of [['triangular',3],['pentagonal',5],['hexagonal',6]]){
    const s=get(id);
    for(let n=0;n<=s.visualMax;n++){
      const points=polygonDots(sides,n);
      assert.equal(BigInt(points.length),sequenceTerm(s,n),`${id} at ${n}`);
      if(n)assert.equal(BigInt(points.filter(p=>p.new).length),sequenceTerm(s,n)-sequenceTerm(s,n-1),`${id} added layer at ${n}`);
    }
  }
});
test('Fibonacci tiles form a non-overlapping rectangle with the stated area',()=>{
  for(let n=1;n<=9;n++){
    const tiles=fibonacciTiles(n);
    assert.equal(tiles.length,n);
    const area=tiles.reduce((s,t)=>s+BigInt(t.size)**2n,0n);assert.equal(area,fibonacci(n)*fibonacci(n+1));
    const left=Math.min(...tiles.map(t=>t.x)),top=Math.min(...tiles.map(t=>t.y)),right=Math.max(...tiles.map(t=>t.x+t.size)),bottom=Math.max(...tiles.map(t=>t.y+t.size));
    assert.equal(BigInt((right-left)*(bottom-top)),area);
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      const a=tiles[i],b=tiles[j];assert.ok(a.x+a.size<=b.x||b.x+b.size<=a.x||a.y+a.size<=b.y||b.y+b.size<=a.y);
    }
  }
});
test('geometry is finite, capped explicitly, and represents the correct objects',()=>{
  for(const s of sequences)for(const n of [s.min,s.initial,s.visualMax,1000]){
    const g=sequenceGeometry(s,n);assert.equal(g.index,Math.min(n,s.visualMax));assert.ok(!/NaN|Infinity/.test(g.svg));assert.ok(g.caption.length>20);
  }
  for(let n=1;n<=6;n++){
    assert.equal((sequenceGeometry(get('cubes'),n).svg.match(/data-unit-cube/g)||[]).length,n**3);
    assert.equal((sequenceGeometry(get('powers-of-two'),n).svg.match(/<circle /g)||[]).length,2**(n+1)-1);
  }
  assert.equal(isPrime(1),false);assert.equal(isPrime(49),false);assert.equal(isPrime(7919),true);
});
