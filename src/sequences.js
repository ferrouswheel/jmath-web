export const MAX_SEQUENCE_INDEX = 1000;
export function fibonacci(n) {
  let a = 0n, b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}
export function isPrime(value) {
  if (!Number.isInteger(value) || value < 2) return false;
  for (let d = 2; d * d <= value; d++) if (value % d === 0) return false;
  return true;
}
const primeCache = [2];
export function nthPrime(n) {
  for (let candidate = primeCache.at(-1) + 1; primeCache.length < n; candidate++) if (isPrime(candidate)) primeCache.push(candidate);
  return BigInt(primeCache[n - 1]);
}
const display = n => n.toLocaleString('en');
export const sequences = [
  {
    id:'squares', name:'Square numbers', short:'Squares', category:'Figurate', color:'#7968cc', min:0, initial:5, visualMax:12, oeis:'A000290',
    description:'n² dots arranged in an n × n square. Consecutive terms differ by successive odd numbers.', formula:'aₙ = n²', recurrence:'a₀ = 0; aₙ = aₙ₋₁ + 2n − 1 for n ≥ 1',
    nth:n=>BigInt(n)**2n,
    explain:n=>[`${n} rows, with ${n} dots in each row.`,`${n} × ${n} = ${display(BigInt(n)**2n)}.`,n?`The new border has 2 × ${n} − 1 = ${2*n-1} dots.`:'At n = 0, the square is empty.'],
    insight:'The first n odd numbers sum to n². Two consecutive triangular numbers also make a square: Tₙ + Tₙ₋₁ = n² for n ≥ 1.', related:['triangular','cubes'],
  },
  {
    id:'cubes',name:'Cube numbers',short:'Cubes',category:'Figurate',color:'#558f9e',min:0,initial:3,visualMax:6,oeis:'A000578',
    description:'n³ unit cubes arranged in n square layers.',formula:'aₙ = n³',recurrence:'a₀ = 0; aₙ = aₙ₋₁ + 3n² − 3n + 1 for n ≥ 1',
    nth:n=>BigInt(n)**3n,
    explain:n=>[`${n} layers, each containing ${n} × ${n} unit cubes.`,`${n} × ${n} × ${n} = ${display(BigInt(n)**3n)}.`,n?`Growing from side ${n-1} to ${n} adds ${3*n*n-3*n+1} unit cubes.`:'At n = 0, there are no layers.'],
    insight:'The sum of the first n cubes is a square: 1³ + 2³ + ⋯ + n³ = [n(n + 1)/2]² = Tₙ².',related:['squares','triangular'],
  },
  {
    id:'fibonacci',name:'Fibonacci numbers',short:'Fibonacci',category:'Recursive',color:'#a18445',min:0,initial:7,visualMax:9,oeis:'A000045',
    description:'Start with 0 and 1. Every term is the sum of the two before it.',formula:'F₀ = 0, F₁ = 1; Fₙ = Fₙ₋₁ + Fₙ₋₂',recurrence:'For n ≥ 2, add the previous two terms.',nth:fibonacci,
    explain:n=>n<2?[`F${n} = ${n} is a starting value.`,`The sequence is indexed from F₀ = 0, followed by F₁ = 1.`]:[`Start with F₀ = 0 and F₁ = 1, then repeatedly add the previous pair.`,`F${n} = F${n-1} + F${n-2}.`,`${display(fibonacci(n-1))} + ${display(fibonacci(n-2))} = ${display(fibonacci(n))}.`],
    insight:'For n ≥ 1, squares with sides F₁ through Fₙ tile a rectangle with sides Fₙ and Fₙ₊₁. Thus F₁² + ⋯ + Fₙ² = FₙFₙ₊₁. Ratios of consecutive positive terms approach the golden ratio.',related:['squares','powers-of-two'],
  },
  {
    id:'triangular',name:'Triangular numbers',short:'Triangular',category:'Figurate',color:'#6a9a7f',min:0,initial:5,visualMax:12,oeis:'A000217',
    description:'Arrange 1, then 2, then 3 dots in rows to grow a triangle.',formula:'Tₙ = n(n + 1) / 2',recurrence:'T₀ = 0; Tₙ = Tₙ₋₁ + n for n ≥ 1',nth:n=>BigInt(n)*BigInt(n+1)/2n,
    explain:n=>[`Add the rows 1 through ${n}${n===0?' (an empty sum)':''}.`,`Two copies form a rectangle with ${n} × ${n+1} dots.`,`Divide by 2: ${n} × ${n+1} / 2 = ${display(BigInt(n)*BigInt(n+1)/2n)}.`],
    insight:'Tₙ counts unordered pairs chosen from n + 1 objects. It is also the number of handshakes when each of n + 1 people shakes hands once with everyone else.',related:['squares','hexagonal','pentagonal'],
  },
  {
    id:'pentagonal',name:'Pentagonal numbers',short:'Pentagonal',category:'Figurate',color:'#ab7196',min:0,initial:4,visualMax:8,oeis:'A000326',
    description:'Grow a five-sided dot pattern from one vertex, adding a wider outer layer each time.',formula:'Pₙ = n(3n − 1) / 2',recurrence:'P₀ = 0; Pₙ = Pₙ₋₁ + 3n − 2 for n ≥ 1',nth:n=>BigInt(n)*BigInt(3*n-1)/2n,
    explain:n=>[`Compute 3n − 1 = ${3*n-1}.`,`${n} × ${3*n-1} / 2 = ${display(BigInt(n)*BigInt(3*n-1)/2n)}.`,n?`The newest layer adds 3 × ${n} − 2 = ${3*n-2} dots.`:'At n = 0, the pattern is empty.'],
    insight:'For n ≥ 1, Pₙ = n + 3Tₙ₋₁. These are ordinary pentagonal numbers, with growth anchored at a vertex; centered pentagonal numbers form a different sequence.',related:['triangular','hexagonal'],
  },
  {
    id:'hexagonal',name:'Hexagonal numbers',short:'Hexagonal',category:'Figurate',color:'#b68852',min:0,initial:4,visualMax:8,oeis:'A000384',
    description:'A six-sided dot pattern whose totals are also triangular numbers.',formula:'Hₙ = n(2n − 1)',recurrence:'H₀ = 0; Hₙ = Hₙ₋₁ + 4n − 3 for n ≥ 1',nth:n=>BigInt(n)*BigInt(2*n-1),
    explain:n=>[`Compute 2n − 1 = ${2*n-1}.`,`${n} × ${2*n-1} = ${display(BigInt(n)*BigInt(2*n-1))}.`,n?`The newest layer adds 4 × ${n} − 3 = ${4*n-3} dots.`:'At n = 0, the pattern is empty.'],
    insight:'Every hexagonal number is triangular: Hₙ = T₂ₙ₋₁ for n ≥ 1. These are ordinary hexagonal numbers; the centered honeycomb sequence begins 1, 7, 19 instead.',related:['triangular','pentagonal'],
  },
  {
    id:'powers-of-two',name:'Powers of two',short:'Powers of two',category:'Exponential',color:'#768fc0',min:0,initial:4,visualMax:6,oeis:'A000079',
    description:'Each term doubles the preceding term and counts the outcomes of n binary choices.',formula:'aₙ = 2ⁿ',recurrence:'a₀ = 1; aₙ = 2aₙ₋₁ for n ≥ 1',nth:n=>2n**BigInt(n),
    explain:n=>[n?`Begin at 1 and double ${n} times.`:'Begin at 1. With zero binary choices, there is one empty outcome.',`2^${n} = ${display(2n**BigInt(n))}.`,`${n} independent binary choices produce ${display(2n**BigInt(n))} possible outcome strings.`],
    insight:'A binary tree of depth n has 2ⁿ leaves and 2ⁿ⁺¹ − 1 nodes in total. The sequence counts the leaves: the possible outcomes after n binary choices.',related:['fibonacci','squares'],
  },
  {
    id:'primes',name:'Prime numbers',short:'Primes',category:'Number theory',color:'#9d7ab4',min:1,initial:10,visualMax:12,oeis:'A000040',
    description:'Whole numbers greater than 1 with exactly two positive divisors: 1 and themselves.',formula:'pₙ = the nth prime; p₁ = 2',recurrence:'pₙ₊₁ is the smallest prime greater than pₙ.',nth:nthPrime,
    explain:n=>[`Test integers starting at 2 and keep those with no divisor from 2 through their square root.`,`Count ${n} primes: p${n} = ${display(nthPrime(n))}.`,`For ${nthPrime(n)}, trial division only needs possible divisors up to ${Math.floor(Math.sqrt(Number(nthPrime(n))))}.`],
    insight:'A prime number of tiles has only a 1 × p rectangular factor arrangement. In the sieve, crossing out multiples leaves the primes. Here nth-prime calculation uses exact trial division, rather than an approximation.',related:['squares','triangular'],
  },
];
export function validateIndex(sequence, n) {
  return !Number.isInteger(n)||n<sequence.min||n>MAX_SEQUENCE_INDEX ? `n must be a whole number from ${sequence.min} to ${MAX_SEQUENCE_INDEX}.` : '';
}
export function sequenceTerm(sequence,n) {
  const error=validateIndex(sequence,n);if(error)throw new RangeError(error);
  return sequence.nth(n);
}
export const sequenceUrl = sequence => `/sequences/${sequence.id}`;
export function sequenceAtPath(pathname) {
  const path=pathname.replace(/\/$/,'');
  if(path==='/sequences')return {sequence:null};
  const sequence=sequences.find(s=>sequenceUrl(s)===path);
  return sequence ? {sequence} : null;
}

// Triangulate a regular polygon from one vertex and place lattice points in
// each triangle. Shared radial edges are deduplicated, producing P_s(n).
export function polygonDots(sides,n) {
  if(n===0)return [];
  if(n===1)return [{x:0,y:0,new:true}];
  const vertices=Array.from({length:sides},(_,i)=>({x:Math.cos(-Math.PI/2+2*Math.PI*i/sides),y:Math.sin(-Math.PI/2+2*Math.PI*i/sides)}));
  const origin=vertices[0], vectors=vertices.map(v=>({x:v.x-origin.x,y:v.y-origin.y}));
  const points=new Map();
  for(let t=1;t<sides-1;t++)for(let i=0;i<n;i++)for(let j=0;j<n-i;j++){
    const x=i*vectors[t].x+j*vectors[t+1].x,y=i*vectors[t].y+j*vectors[t+1].y;
    const key=`${x.toFixed(6)},${y.toFixed(6)}`;
    points.set(key,{x,y,new:i+j===n-1});
  }
  return [...points.values()];
}
export function fibonacciTiles(n) {
  if(!n)return [];
  const tiles=[{x:0,y:0,size:1,index:1}];let left=0,top=0,right=1,bottom=1;
  for(let i=2;i<=n;i++){
    const size=Number(fibonacci(i));let x,y;
    switch((i-2)%4){
      case 0:x=right;y=top;right+=size;break;
      case 1:x=left;y=bottom;bottom+=size;break;
      case 2:x=left-size;y=top;left-=size;break;
      case 3:x=left;y=top-size;top-=size;break;
    }
    tiles.push({x,y,size,index:i});
  }
  return tiles;
}
