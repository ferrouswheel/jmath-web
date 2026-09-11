import { sequenceTerm, fibonacci, fibonacciTiles, polygonDots, isPrime } from './sequences.js';
const gold='#c39b54', purple='#8c7bd0', pale='#e6e1f3';
export function sequenceGeometry(sequence,n,mini=false) {
  const k=Math.min(n,sequence.visualMax), w=560,h=290;
  let drawing='',caption='';
  const circle=(x,y,r,highlight)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${highlight?gold:purple}"/>`;
  if(['squares','triangular','pentagonal','hexagonal'].includes(sequence.id)){
    const sides={triangular:3,pentagonal:5,hexagonal:6}[sequence.id];
    const dots=sequence.id==='squares'?Array.from({length:k*k},(_,i)=>({x:i%k,y:Math.floor(i/k),new:i%k===k-1||Math.floor(i/k)===k-1})):polygonDots(sides,k);
    if(dots.length){
      const xs=dots.map(p=>p.x),ys=dots.map(p=>p.y),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
      const scale=Math.min(380/Math.max(1,maxX-minX),210/Math.max(1,maxY-minY));
      const radius=Math.min(9,scale*.15);
      drawing=dots.map(p=>circle(w/2+(p.x-(minX+maxX)/2)*scale,h/2+(p.y-(minY+maxY)/2)*scale,radius,p.new)).join('');
    }
    caption=`${sequenceTerm(sequence,k)} dots form the n = ${k} pattern. ${k?'Gold dots are the new outer layer.':'The zero term has no dots.'}`;
  }else if(sequence.id==='cubes'){
    const columns=Math.min(3,Math.max(1,k)),rows=Math.ceil(k/columns),panelW=w/columns,panelH=(h-12)/Math.max(1,rows),unit=Math.min(24,(panelW-35)/(2*Math.max(1,k)),(panelH-30)/(Math.max(1,k)+1));
    const poly=(points,fill)=>`<polygon points="${points.map(p=>p.join(',')).join(' ')}" fill="${fill}" stroke="white" stroke-width=".65"/>`;
    for(let layer=0;layer<k;layer++){
      const center=(layer%columns+.5)*panelW,top=Math.floor(layer/columns)*panelH+6+(panelH-(k+.8)*unit-20)/2;
      for(let row=0;row<k;row++)for(let col=0;col<k;col++){
        const x=center+(col-row)*unit,y=top+(col+row)*unit*.5,newCube=layer===k-1||row===k-1||col===k-1;
        drawing+=`<g data-unit-cube="true">${poly([[x,y],[x+unit,y+unit*.5],[x,y+unit],[x-unit,y+unit*.5]],newCube?'#dfbf84':'#b6a9df')}${poly([[x-unit,y+unit*.5],[x,y+unit],[x,y+unit*1.7],[x-unit,y+unit*1.2]],newCube?'#c49a50':'#8e7bc9')}${poly([[x,y+unit],[x+unit,y+unit*.5],[x+unit,y+unit*1.2],[x,y+unit*1.7]],newCube?'#ad823a':'#7563b1')}</g>`;
      }
      drawing+=`<text x="${center}" y="${top+(k+.8)*unit+13}" text-anchor="middle">Layer ${layer+1} · ${k}² cubes</text>`;
    }
    caption=`${k} layers × ${k} rows × ${k} unit cubes = ${sequenceTerm(sequence,k)}. Layers are spread apart so you can see them; gold marks the cubes added since n = ${Math.max(0,k-1)}.`;
  }else if(sequence.id==='fibonacci'){
    const tiles=fibonacciTiles(k);
    if(tiles.length){
      const left=Math.min(...tiles.map(t=>t.x)),top=Math.min(...tiles.map(t=>t.y)),right=Math.max(...tiles.map(t=>t.x+t.size)),bottom=Math.max(...tiles.map(t=>t.y+t.size));
      const scale=Math.min(430/(right-left),230/(bottom-top));
      tiles.forEach(t=>{const x=w/2+(t.x-(left+right)/2)*scale,y=h/2+(t.y-(top+bottom)/2)*scale,size=t.size*scale;
        drawing+=`<rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${t.index===k?'#ead4a9':pale}" stroke="white" stroke-width="2"/><text x="${x+size/2}" y="${y+size/2+4}" text-anchor="middle" style="font-size:${Math.min(18,Math.max(7,size/3))}px;fill:#78608b">${t.size}</text>`;
      });
    }
    caption=k?`Square labels are side lengths. The newest side is F${k} = ${fibonacci(k)}. The whole rectangle has sides ${fibonacci(k)} and ${fibonacci(k+1)}, with area ${fibonacci(k)*fibonacci(k+1)}.`:'F₀ = 0. Square tiling begins with F₁ = 1.';
  }else if(sequence.id==='powers-of-two'){
    for(let depth=0;depth<=k;depth++)for(let i=0;i<2**depth;i++){
      const x=30+(i+.5)*500/2**depth,y=35+depth*210/Math.max(1,k);
      if(depth){const px=30+(Math.floor(i/2)+.5)*500/2**(depth-1),py=35+(depth-1)*210/Math.max(1,k);drawing+=`<line x1="${px}" y1="${py}" x2="${x}" y2="${y}" stroke="#dad4e9" stroke-width="1.3"/>`;}
      drawing+=circle(x,y,Math.min(7,180/2**depth),depth===k);
    }
    caption=`After ${k} binary choices, the tree has ${2**k} gold leaves. There are ${2**(k+1)-1} nodes overall; aₙ counts only the leaves.`;
  }else{
    const prime=Number(sequenceTerm(sequence,k)),columns=10,rows=Math.ceil(prime/columns),size=Math.min(40,220/rows),left=(w-columns*size)/2,top=(h-rows*size)/2;
    for(let v=1;v<=prime;v++){
      const x=left+(v-1)%columns*size,y=top+Math.floor((v-1)/columns)*size;
      drawing+=`<rect x="${x+2}" y="${y+2}" width="${size-4}" height="${size-4}" rx="5" fill="${v===prime?'#ead4a9':isPrime(v)?pale:'#f2f3f6'}"/><text x="${x+size/2}" y="${y+size/2+4}" text-anchor="middle" style="font-size:12px;fill:${isPrime(v)?'#756389':'#a8adb7'};${v>1&&!isPrime(v)?'text-decoration:line-through;':''}">${v}</text>`;
    }
    caption=`A sieve up to ${prime} leaves ${k} primes. The selected prime ${prime} is gold, earlier primes are purple, and composites are crossed out. 1 is neither prime nor composite.`;
  }
  if(!drawing)drawing='<text x="280" y="145" text-anchor="middle" style="font-size:18px">0 · the empty pattern</text>';
  return {index:k,caption,svg:`<svg viewBox="0 0 ${w} ${h}" ${mini?'aria-hidden="true"':`role="img" aria-label="${sequence.name}, geometric interpretation at n = ${k}. ${caption}"`}>${drawing}</svg>`};
}
