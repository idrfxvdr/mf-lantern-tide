// drawClock.js - Lantern clock timer display
export function drawClock(ctx, W, H, state) {
  const cx = W/2, cy = 48, r = 42;
  const shift = state.currentShift||1;
  const timer = state.shiftTimer||0;
  const dur = state.shiftDuration||60;
  const rem = Math.max(0, dur - timer);
  const frac = rem / dur;
  const mins = Math.floor(rem/60);
  const secs = Math.floor(rem%60);
  const urgent = rem < 15;

  // Glow
  ctx.save();
  const gc = urgent ? 'rgba(255,80,20,0.25)' : 'rgba(255,160,50,0.18)';
  const gg = ctx.createRadialGradient(cx,cy,20,cx,cy,r*1.8);
  gg.addColorStop(0,gc); gg.addColorStop(1,'transparent');
  ctx.fillStyle=gg; ctx.fillRect(cx-r*2,cy-r*2,r*4,r*4);

  // Outer ring
  ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2);
  ctx.fillStyle='#1a1208'; ctx.fill();
  ctx.strokeStyle=urgent?'#ff6622':'#ff8c20'; ctx.lineWidth=3; ctx.stroke();

  // Tick marks
  for(let i=0;i<12;i++){
    const a=(i/12)*Math.PI*2-Math.PI/2;
    const x1=cx+Math.cos(a)*(r-5), y1=cy+Math.sin(a)*(r-5);
    const x2=cx+Math.cos(a)*(r-2), y2=cy+Math.sin(a)*(r-2);
    ctx.strokeStyle=urgent?'#ff8844':'#cc7030'; ctx.lineWidth=i%3===0?2:1;
    ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
  }

  // Progress arc
  ctx.beginPath(); ctx.arc(cx,cy,r-4,-Math.PI/2,-Math.PI/2+frac*Math.PI*2);
  ctx.strokeStyle=urgent?'#ff3300':'#44cc66'; ctx.lineWidth=6; ctx.lineCap='round'; ctx.stroke();
  ctx.lineCap='butt';

  // Inner face
  ctx.beginPath(); ctx.arc(cx,cy,r-12,0,Math.PI*2);
  const fg=ctx.createRadialGradient(cx,cy,0,cx,cy,r-12);
  fg.addColorStop(0,'#2a1808'); fg.addColorStop(1,'#1a0e04');
  ctx.fillStyle=fg; ctx.fill();

  // Clock hands
  const secFrac=((timer%1)%1);
  // Minute hand
  const minAngle=(mins/60)*Math.PI*2-Math.PI/2;
  ctx.strokeStyle=urgent?'#ff6633':'#ffa020'; ctx.lineWidth=2.5; ctx.lineCap='round';
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(minAngle)*24,cy+Math.sin(minAngle)*24); ctx.stroke();
  // Second hand
  const secAngle=(secFrac)*Math.PI*2-Math.PI/2;
  ctx.strokeStyle=urgent?'#ff0000':'#cc8830'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(secAngle)*30,cy+Math.sin(secAngle)*30); ctx.stroke();
  ctx.lineCap='butt';

  // Center dot
  ctx.beginPath(); ctx.arc(cx,cy,3,0,Math.PI*2);
  ctx.fillStyle='#ff8c20'; ctx.fill();

  // Time text
  ctx.fillStyle=urgent?'#ff6633':'#ffd27d';
  ctx.font=`bold 13px sans-serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(`${mins}:${String(secs).padStart(2,'0')}`,cx,cy+2);

  // Shift label
  ctx.fillStyle='rgba(255,200,100,0.6)';
  ctx.font='10px sans-serif';
  ctx.fillText(`SHIFT ${shift}/5`,cx,cy+r+10);

  ctx.restore();
}
