// drawStations.js - Detailed station visuals
import { ST } from './stations.js';
import { drawFoodItem } from './drawFood.js';

const SC = {
  text:'#ffd27d',dim:'rgba(255,210,120,0.65)',white:'#f5e8d0',
  green:'#44cc66',orange:'#ff9944',red:'#ff4444',
  wood:'#6b4422',woodD:'#4a2e14',woodL:'#9a6a38',
  stone:'#5a5040',shadow:'rgba(0,0,0,0.35)',lantern:'#ff8c20',
};

export function drawStations(ctx, state) {
  const stations = state.stations||[];
  const player = state.player||{x:0,y:0};
  const hover = state.hoverStation ? state.hoverStation.id : null;
  const t = state.time||0;
  for(const s of stations){
    const isH = hover===s.id;
    const d=Math.sqrt((s.x-player.x)**2+(s.y-player.y)**2);
    const isN=d<90;
    ctx.save();
    if(isH||isN){ctx.shadowColor=SC.lantern;ctx.shadowBlur=24;}
    switch(s.type){
      case ST.CRATE: drawCrate(ctx,s,isH,t); break;
      case ST.CHOP: drawChop(ctx,s,isH,t); break;
      case ST.STOVE: drawStove(ctx,s,isH,t); break;
      case ST.STEAMER: drawSteamer(ctx,s,isH,t); break;
      case ST.PLATE: drawPlate(ctx,s,isH); break;
      case ST.SERVE: drawServe(ctx,s,isH); break;
      case ST.TRASH: drawTrash(ctx,s,isH); break;
    }
    ctx.restore();
  }
}


// ============ CRATE ============
function drawCrate(ctx,s,isH,t){
  const x=s.x,y=s.y,w=56,h=50;
  ctx.save();ctx.translate(x,y);
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(-w/2+5,-h/2+5,w,h);
  // Body
  const g=ctx.createLinearGradient(0,-h/2,0,h/2);
  g.addColorStop(0,'#9a6a38');g.addColorStop(0.3,'#6b4422');g.addColorStop(1,'#4a2e14');
  ctx.fillStyle=g;ctx.fillRect(-w/2,-h/2,w,h);
  // Borders
  ctx.strokeStyle='#4a2e14';ctx.lineWidth=2;
  ctx.strokeRect(-w/2,-h/2,w,h);
  ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(-w/2,-h/6);ctx.lineTo(w/2,-h/6);ctx.stroke();
  // Food heaped in crate (3 visible items)
  ctx.save();
  ctx.clipRect && ctx.clipRect(-w/2+4,-h/2+4,w-8,h-8);
  const ing=s.ingredient;
  const fc=s.color||'#888';
  // Draw food mound
  ctx.fillStyle=fc;
  ctx.beginPath();ctx.ellipse(0,-8,20,12,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=s.accent||'#666';
  ctx.beginPath();ctx.ellipse(-6,-4,7,5,0.3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.ellipse(5,-2,7,5,-0.2,0,Math.PI*2);ctx.fill();
  ctx.restore();
  // Label
  ctx.fillStyle=isH?SC.text:SC.dim;
  ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText(s.label,x,y+h/2+14);
  ctx.restore();
}

// ============ CHOP BOARD ============
function drawChop(ctx,s,isH,t){
  const x=s.x,y=s.y;
  // Base board 80x60
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x-38+4,y-28+4,76,56);
  const bg=ctx.createLinearGradient(x-40,y-30,x+40,y+30);
  bg.addColorStop(0,'#8a6040');bg.addColorStop(1,'#5a3820');
  ctx.fillStyle=bg;ctx.fillRect(x-40,y-30,80,60);
  ctx.strokeStyle='#4a2810';ctx.lineWidth=2;ctx.strokeRect(x-40,y-30,80,60);
  // Wood grain
  ctx.strokeStyle='rgba(0,0,0,0.12)';ctx.lineWidth=1;
  for(let gy=y-25;gy<y+28;gy+=8){
    ctx.beginPath();ctx.moveTo(x-37,gy);ctx.lineTo(x+37,gy);ctx.stroke();
  }
  // Knife (diagonal)
  ctx.save();ctx.translate(x+15,y-15);ctx.rotate(-0.5);
  ctx.fillStyle='#c0c0c0';ctx.fillRect(-2,-25,4,25);
  ctx.fillStyle='#888';ctx.fillRect(-6,-25,12,6);
  ctx.restore();
  // Food on board
  if(s.contents){drawFoodItem(ctx,x,y,s.contents.ing,s.contents.state,28);}
  // Progress ring
  if(s.contents&&s.progress>0){
    ctx.strokeStyle=s.burning?SC.red:SC.green;ctx.lineWidth=4;
    ctx.beginPath();
    ctx.arc(x,y,s.progress>=1?48:42,-Math.PI/2,-Math.PI/2+s.progress*Math.PI*2);
    ctx.stroke();
  }
  // Label
  ctx.fillStyle=isH?SC.text:SC.dim;
  ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('CHOP',x,y+40);
}

// ============ STOVE / WOK ============
function drawStove(ctx,s,isH,t){
  const x=s.x,y=s.y;
  // Stove base (stone/brick)
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.arc(x+4,y+4,38,0,Math.PI*2);ctx.fill();
  const sg=ctx.createRadialGradient(x,y,0,x,y,36);
  sg.addColorStop(0,'#5a5040');sg.addColorStop(1,'#3a3020');
  ctx.fillStyle=sg;ctx.beginPath();ctx.arc(x,y,36,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2a2010';ctx.lineWidth=2;ctx.stroke();
  // Stove ring top
  ctx.fillStyle='#4a4030';ctx.beginPath();ctx.arc(x,y,28,0,Math.PI*2);ctx.fill();
  // Burner flame effect
  if(s.contents||isH){
    const flicker=Math.sin(t*8)*2;
    ctx.fillStyle='rgba(255,120,20,0.3)';
    ctx.beginPath();ctx.arc(x,y+flicker,22,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(255,80,10,0.2)';
    ctx.beginPath();ctx.arc(x,y+flicker,16,0,Math.PI*2);ctx.fill();
    // Flame tips
    for(let i=0;i<6;i++){
      const angle=(i/6)*Math.PI*2+t*2;
      const fx=x+Math.cos(angle)*15,fy=y+Math.sin(angle)*12+flicker;
      ctx.fillStyle='rgba(255,140,30,0.5)';
      ctx.beginPath();ctx.ellipse(fx,fy,4,7,angle,0,Math.PI*2);ctx.fill();
    }
  }
  // Food
  if(s.contents){drawFoodItem(ctx,x,y,s.contents.ing,s.contents.state,30);}
  // Progress
  if(s.contents&&s.progress>0){
    ctx.strokeStyle=s.burning?SC.red:SC.green;ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(x,y,s.progress>=1?44:40,-Math.PI/2,-Math.PI/2+s.progress*Math.PI*2);ctx.stroke();
  }
  // Label
  ctx.fillStyle=isH?SC.text:SC.dim;
  ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('PAN',x,y+44);
}

// ============ STEAMER ============
function drawSteamer(ctx,s,isH,t){
  const x=s.x,y=s.y;
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.arc(x+4,y+4,36,0,Math.PI*2);ctx.fill();
  // Bamboo basket
  const bg=ctx.createRadialGradient(x,y,0,x,y,34);
  bg.addColorStop(0,'#c8a060');bg.addColorStop(1,'#8a6030');
  ctx.fillStyle=bg;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#6a4020';ctx.lineWidth=2;ctx.stroke();
  // Bamboo rings
  ctx.strokeStyle='#8a6030';ctx.lineWidth=1.5;
  ctx.beginPath();ctx.arc(x,y,28,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,20,0,Math.PI*2);ctx.stroke();
  ctx.beginPath();ctx.arc(x,y,12,0,Math.PI*2);ctx.stroke();
  // Lid handle
  ctx.fillStyle='#6a4020';
  ctx.fillRect(x-8,y-38,16,8);
  ctx.fillStyle='#8a6040';
  ctx.fillRect(x-4,y-42,8,6);
  // Steam holes
  ctx.fillStyle='#a08050';
  for(let i=0;i<6;i++){
    const a=(i/6)*Math.PI*2;
    ctx.beginPath();ctx.arc(x+Math.cos(a)*22,y+Math.sin(a)*18,3,0,Math.PI*2);ctx.fill();
  }
  // Food
  if(s.contents){drawFoodItem(ctx,x,y,s.contents.ing,s.contents.state,26);}
  // Progress
  if(s.contents&&s.progress>0){
    ctx.strokeStyle=s.burning?SC.red:SC.green;ctx.lineWidth=5;
    ctx.beginPath();ctx.arc(x,y,s.progress>=1?42:38,-Math.PI/2,-Math.PI/2+s.progress*Math.PI*2);ctx.stroke();
  }
  // Label
  ctx.fillStyle=isH?SC.text:SC.dim;
  ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('STEAM',x,y+44);
}

// ============ PLATE COUNTER ============
function drawPlate(ctx,s,isH){
  const x=s.x,y=s.y;
  // Wooden counter (120x70)
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.fillRect(x-58+4,y-33+4,116,66);
  const wg=ctx.createLinearGradient(x-60,y-35,x+60,y+35);
  wg.addColorStop(0,'#8a5a30');wg.addColorStop(1,'#5a3820');
  ctx.fillStyle=wg;ctx.fillRect(x-60,y-35,120,70);
  ctx.strokeStyle='#3d2010';ctx.lineWidth=2;ctx.strokeRect(x-60,y-35,120,70);
  // Wood grain
  ctx.strokeStyle='rgba(0,0,0,0.1)';ctx.lineWidth=1;
  for(let py=y-28;py<y+32;py+=10){
    ctx.beginPath();ctx.moveTo(x-57,py);ctx.lineTo(x+57,py);ctx.stroke();
  }
  // Plate
  drawPlateGraphic(ctx,x,y-5,80,22);
  // Label
  ctx.fillStyle=isH?SC.text:SC.dim;
  ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='bottom';
  ctx.fillText('PLATE',x,y+44);
}

function drawPlateGraphic(ctx,x,y,w,fontSize){
  ctx.fillStyle='#e8e0d0';ctx.beginPath();ctx.ellipse(x,y,w,fontSize,0,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#c8c0b0';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='#d8d0c0';ctx.lineWidth=1;
  ctx.beginPath();ctx.ellipse(x,y,w*0.7,fontSize*0.65,0,0,Math.PI*2);ctx.stroke();
}

// ============ SERVE WINDOW ============
function drawServe(ctx,s,isH){
  const x=s.x,y=s.y;
  // Serving hatch structure
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.arc(x+4,y+4,44,0,Math.PI*2);ctx.fill();
  // Counter
  const wg=ctx.createLinearGradient(x-44,y-44,x+44,y+44);
  wg.addColorStop(0,'#5a8a40');wg.addColorStop(1,'#3a5a20');
  ctx.fillStyle=wg;ctx.beginPath();ctx.arc(x,y,42,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#2a4010';ctx.lineWidth=2;ctx.stroke();
  // Hatch opening
  ctx.fillStyle='#2a4010';
  ctx.beginPath();ctx.ellipse(x,y+5,28,20,0,0,Math.PI);ctx.fill();
  // Awning
  ctx.fillStyle='#cc4422';
  ctx.beginPath();
  ctx.moveTo(x-50,y-30);ctx.lineTo(x+50,y-30);
  ctx.lineTo(x+55,y-15);ctx.lineTo(x-55,y-15);
  ctx.closePath();ctx.fill();
  ctx.strokeStyle='#aa3311';ctx.lineWidth=1;ctx.stroke();
  // Bell
  ctx.fillStyle='#ffd700';
  ctx.beginPath();ctx.arc(x+38,y-38,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#cc9900';ctx.beginPath();ctx.arc(x+38,y-42,4,Math.PI,0);ctx.fill();
  // Text
  ctx.fillStyle=SC.white;ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('SERVICE',x,y-2);
  ctx.fillStyle=isH?SC.text:SC.dim;ctx.font='bold 11px sans-serif';ctx.textBaseline='bottom';
  ctx.fillText('SERVE',x,y+56);
}

// ============ TRASH ============
function drawTrash(ctx,s,isH){
  const x=s.x,y=s.y;
  ctx.fillStyle='rgba(0,0,0,0.35)';ctx.beginPath();ctx.arc(x+3,y+3,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4a2020';ctx.beginPath();ctx.arc(x,y,22,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6a3030';ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();
  ctx.strokeStyle='#3a1010';ctx.lineWidth=1.5;ctx.stroke();
  ctx.strokeStyle='#5a2020';ctx.lineWidth=1;
  ctx.beginPath();ctx.arc(x,y,19,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle=isH?SC.red:'rgba(180,60,60,0.7)';ctx.font='bold 16px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('X',x,y);
  ctx.fillStyle=isH?SC.text:SC.dim;ctx.font='bold 9px sans-serif';ctx.textBaseline='bottom';
  ctx.fillText('TRASH',x,y+30);
}
