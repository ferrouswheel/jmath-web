// Original procedural reference images, rendered locally without asset requests.
export function drawColorExample(canvas,kind='scene'){
 canvas.width=960;canvas.height=600;const c=canvas.getContext('2d',{colorSpace:'srgb'});
 if(kind==='chart'){
  c.fillStyle='#242631';c.fillRect(0,0,960,600);
  const colors=['#fff','#aaa','#555','#111','#f22','#fc0','#2c6','#0bf','#35f','#c3e','#f9b','#986'];
  colors.forEach((color,i)=>{c.fillStyle=color;c.fillRect(25+(i%6)*155,25+Math.floor(i/6)*150,140,130);});
  for(let x=0;x<910;x++){const v=Math.round(x*255/909);c.fillStyle=`rgb(${v} ${v} ${v})`;c.fillRect(25+x,345,1,100);c.fillStyle=`hsl(${x*360/909} 100% 50%)`;c.fillRect(25+x,470,1,100);}return;
 }
 const background=c.createLinearGradient(0,0,960,600);background.addColorStop(0,'#b2cfdf');background.addColorStop(.6,'#ecd9be');background.addColorStop(1,'#8b6961');c.fillStyle=background;c.fillRect(0,0,960,600);
 // Window and a landscape provide highlights, shadows and blue/green detail.
 c.fillStyle='#f7efe0';c.fillRect(52,40,365,335);const sky=c.createLinearGradient(0,55,0,345);sky.addColorStop(0,'#3686b7');sky.addColorStop(.7,'#abd9de');sky.addColorStop(1,'#e7e5c6');c.fillStyle=sky;c.fillRect(67,55,335,305);
 c.fillStyle='#d8eff2';c.beginPath();c.ellipse(190,117,81,18,-.07,0,Math.PI*2);c.ellipse(300,162,60,13,0,0,Math.PI*2);c.fill();
 c.fillStyle='#51867c';c.beginPath();c.moveTo(67,280);c.lineTo(135,240);c.lineTo(213,274);c.lineTo(298,218);c.lineTo(402,285);c.lineTo(402,360);c.lineTo(67,360);c.fill();c.fillStyle='#315b54';c.beginPath();c.moveTo(67,317);c.quadraticCurveTo(225,238,402,325);c.lineTo(402,360);c.lineTo(67,360);c.fill();
 c.fillStyle='#f7efe0';c.fillRect(225,55,12,305);c.fillRect(67,203,335,12);
 const table=c.createLinearGradient(0,378,0,600);table.addColorStop(0,'#b4845a');table.addColorStop(1,'#5c3d30');c.fillStyle=table;c.fillRect(0,378,960,222);
 c.strokeStyle='#805539';c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(0,397+i*25);c.bezierCurveTo(260,387+i*25,730,415+i*25,960,398+i*25);c.stroke();}
 const ball=(x,y,r,light,mid,dark)=>{c.fillStyle='rgba(20,15,25,.22)';c.beginPath();c.ellipse(x+r*.2,y+r*.8,r*1.2,r*.28,0,0,Math.PI*2);c.fill();const g=c.createRadialGradient(x-r*.4,y-r*.45,r*.02,x,y,r);g.addColorStop(0,light);g.addColorStop(.45,mid);g.addColorStop(1,dark);c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
 ball(373,434,74,'#fff1ad','#eab445','#855221');ball(487,469,64,'#ffdab5','#e35e37','#782537');ball(282,494,43,'#efc9db','#9c5171','#4f274f');
 // Matte blue vessel.
 c.fillStyle='rgba(10,20,25,.25)';c.beginPath();c.ellipse(714,511,97,25,0,0,Math.PI*2);c.fill();const vase=c.createLinearGradient(635,0,775,0);vase.addColorStop(0,'#183b58');vase.addColorStop(.4,'#6db9cb');vase.addColorStop(.65,'#3886a1');vase.addColorStop(1,'#122f4f');c.fillStyle=vase;c.beginPath();c.moveTo(681,309);c.bezierCurveTo(685,361,638,379,646,465);c.bezierCurveTo(650,525,770,525,775,465);c.bezierCurveTo(783,384,732,360,737,309);c.closePath();c.fill();
 c.strokeStyle='#3e5742';c.lineWidth=5;for(const [x,y] of [[632,142],[779,124],[704,96],[827,230]]){c.beginPath();c.moveTo(710,321);c.quadraticCurveTo(700,y+60,x,y);c.stroke();c.save();c.translate(x,y);c.rotate((x-710)/140);const leaf=c.createLinearGradient(-20,0,35,0);leaf.addColorStop(0,'#244d42');leaf.addColorStop(1,'#92ae57');c.fillStyle=leaf;c.beginPath();c.ellipse(0,0,23,56,.4,0,Math.PI*2);c.fill();c.restore();}
 // Neutral swatches retain useful reference levels inside the scene.
 ['#15191f','#555a60','#a6a5a0','#eeeee8'].forEach((color,i)=>{c.fillStyle=color;c.fillRect(52+i*45,550,40,25);});
}
