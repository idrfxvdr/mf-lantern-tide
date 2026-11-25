// Kitchen rendering - the full game scene
import { drawFoodItem, drawPlate } from './drawFood.js';
import { INGREDIENTS } from './recipes.js';
import { ST } from './stations.js';

const C = {
  water:'#0d2b3a',waterLight:'#1a4a5a',
  pier:'#3d2510',pierLight:'#5a3820',pierTop:'#7a5030',
  lantern:'#ff8c20',sky:'#0a1520',horizon:'#1a2830',
  text:'#ffd27d',textDim:'#a08050',white:'#f5e8d0',
  red:'#ff4444',green:'#44cc66',orange:'#ff9944',
};

export function drawKitchen(ctx,W,H,state){
  drawBackground(ctx,W,H,state);
  drawLanterns(ctx,W,H,state);
  drawPiers(ctx,W,H,state);
  drawBridge(ctx,W,H,state);
  drawWater(ctx,W,H,state);
  drawStations(ctx,state);
  drawPlayer(ctx,state);
  if(state.particles) state.particles.draw(ctx);
}

function drawBackground(ctx,W,H,state){
  const sky=ctx.createLinearGradient(0,0,0,H*0.4);
  sky.addColorStop(0,'#050a10');sky.addColorStop(1,C.sky);
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  const glow=ctx.createLinearGradient(0,H*0.3,0,H*0.55);
  glow.addColorStop(0,'transparent');
  glow.addColorStop(0.5,'rgba(255,160,60,0.08)');
  glow.addColorStop(1,'transparent');
  ctx.fillStyle=glow;ctx.fillRect(0,H*0.3,W,H*0.25);
  ctx.fillStyle='rgba(255,255,200,0.35)';
  const r=(n)=>0.5*n;
  for(let i=0;i<30;i++){
    ctx.beginPath();
    ctx.arc(r(W),r(H*0.3),r(1.2)+0.3,0,Math.PI*2);
    ctx.fill();
  }
  const water=ctx.createLinearGradient(0,H*0.45,0,H);
  water.addColorStop(0,C.horizon);
  water.addColorStop(0.4,C.water);
  water.addColorStop(1,'#060f18');
  ctx.fillStyle=water;ctx.fillRect(0,H*0.45,W,H*0.55);
}

function drawLanterns(ctx,W,H,state){
  const lanterns=[[140,170],[420,160],[700,175],[980,170],[1160,160]];
  for(const[lx,ly]of lanterns){
    ctx.save();
    const grad=ctx.createRadialGradient(lx,ly,2,lx,ly,80);
    grad.addColorStop(0,'rgba(255,140,32,0.25)');
    grad.addColorStop(1,'transparent');
    ctx.fillStyle=grad;ctx.fillRect(lx-80,ly-80,160,160);
    ctx.fillStyle=C.lantern;
    ctx.beginPath();
    ctx.ellipse(lx,ly,6,8,0,0,Math.PI*2);
    ctx.fill();
    ctx.strokeStyle='#ffaa40';ctx.lineWidth=1.5;
    ctx.stroke();
    // String
    ctx.beginPath();
    ctx.moveTo(lx,ly-8);ctx.lineTo(lx,ly-20);
    ctx.strokeStyle='#5a3820';ctx.lineWidth=1.5;ctx.stroke();
    ctx.restore();
  }
}

function drawPiers(ctx,W,H,state){
  const piers=[
    {x1:20,x2:380,y1:165,y2:400},
    {x1:400,x2:760,y1:185,y2:400},
    {x1:760,x2:1200,y1:165,y2:400},
  ];
  for(const p of piers){
    // Pier shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.fillRect(p.x1+4,p.y1+4,p.x2-p.x1,p.y2-p.y1);
    // Pier body
    const pb=ctx.createLinearGradient(0,p.y1,0,p.y2);
    pb.addColorStop(0,C.pierTop);pb.addColorStop(0.15,C.pierLight);pb.addColorStop(1,C.pier);
    ctx.fillStyle=pb;ctx.fillRect(p.x1,p.y1,p.x2-p.x1,p.y2-p.y1);
    // Wood planks
    ctx.strokeStyle='rgba(0,0,0,0.2)';ctx.lineWidth=1;
    for(let y=p.y1+15;y<p.y2;y+=15){
      ctx.beginPath();ctx.moveTo(p.x1,y);ctx.lineTo(p.x2,y);ctx.stroke();
    }
    // Pier edge
    ctx.strokeStyle=C.pierLight;ctx.lineWidth=2;
    ctx.strokeRect(p.x1,p.y1,p.x2-p.x1,p.y2-p.y1);
  }
}

function drawBridge(ctx,W,H,state){
  const bx=380,by=285,bs=2;
  const cx=760;
  // Bridge planks
  ctx.fillStyle='#4a3020';
  ctx.fillRect(bx,by-3,bs,90);
  ctx.fillRect(cx,by-3,bs,90);
  // Connecting beam (bridge)
  const tide=state.tide;
  const wobble=tide&&tide.isHighTide?Math.sin(state.time*3)*3:0;
  ctx.save();
  ctx.translate(bx+bs/2+wobble,by+20);
  ctx.fillStyle='#5a3820';
  ctx.fillRect(0,0,cx-bx-bs,8);
  // Railings
  ctx.fillStyle='#7a5030';
  ctx.fillRect(0,-25,cx-bx-bs,3);
  ctx.fillRect(0,12,cx-bx-bs,3);
  for(let x=30;x<cx-bx-bs;x+=40){
    ctx.fillRect(x,0,2,12);
    ctx.fillRect(x,-25,2,28);
  }
  ctx.restore();
  // Label
  ctx.fillStyle='rgba(255,200,100,0.4)';
  ctx.font='10px monospace';
  ctx.textAlign='center';
  ctx.fillText(tide&&tide.isHighTide?'BRIDGE':'BRIDGE',bx+5,by+5);
}

function drawWater(ctx,W,H,state){
  // Animated water ripples
  const t=state.time||0;
  ctx.save();
  for(let i=0;i<6;i++){
    const wy=H*0.5+i*60;
    ctx.strokeStyle=`rgba(30,100,130,${0.2-i*0.02})`;
    ctx.lineWidth=1;
    ctx.beginPath();
    for(let x=0;x<W;x+=8){
      const wave=Math.sin(x*0.02+t*(1+i*0.2))*4;
      if(x===0) ctx.moveTo(x,wy+wave);
      else ctx.lineTo(x,wy+wave);
    }
    ctx.stroke();
  }
  // Lantern reflections
  const lanterns=[[140,360],[420,370],[700,365],[980,370],[1160,360]];
  for(const[lx,ly]of lanterns){
    ctx.save();
    const rg=ctx.createRadialGradient(lx,ly,0,lx,ly,40);
    rg.addColorStop(0,'rgba(255,140,32,0.2)');
    rg.addColorStop(1,'transparent');
    ctx.fillStyle=rg;ctx.fillRect(lx-40,ly-20,80,40);
    ctx.restore();
  }
}

function drawStations(ctx,state){
  const stations=state.stations||[];
  const player=state.player;
  const hover=state.hoverStation;

  for(const s of stations){
    const isHover=hover&&hover.id===s.id;
    const isNear=player&&Math.hypot(s.x-player.x,s.y-player.y)<60;

    // Station shadow
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath();ctx.arc(s.x+3,s.y+3,s.radius,0,Math.PI*2);ctx.fill();

    // Station body
    ctx.save();
    if(isHover||isNear){
      ctx.shadowColor=C.lantern;ctx.shadowBlur=15;
    }

    if(s.type===ST.CRATE){
      ctx.fillStyle=s.color||'#888';
      ctx.fillRect(s.x-s.radius,s.y-s.radius,s.radius*2,s.radius*2);
      ctx.strokeStyle='#5a3820';ctx.lineWidth=2;ctx.strokeRect(s.x-s.radius,s.y-s.radius,s.radius*2,s.radius*2);
      ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.strokeRect(s.x-s.radius+4,s.y-s.radius+4,s.radius*2,s.radius*2);
    } else if(s.type===ST.CHOP||s.type===ST.STOVE||s.type===ST.STEAMER){
      // Work station
      ctx.fillStyle='#6a5030';
      ctx.beginPath();ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#8a6040';ctx.lineWidth=2;ctx.stroke();
      // Surface texture
      ctx.fillStyle='#7a5540';
      ctx.beginPath();ctx.arc(s.x,s.y,s.radius*0.7,0,Math.PI*2);ctx.fill();
      // Progress ring
      if(s.contents&&s.progress>0){
        ctx.strokeStyle=s.burning?'#ff3300':'#44ff88';
        ctx.lineWidth=4;
        ctx.beginPath();
        ctx.arc(s.x,s.y,s.radius*1.2,-Math.PI/2,-Math.PI/2+s.progress*Math.PI*2);
        ctx.stroke();
      }
      if(s.burning){
        ctx.fillStyle='rgba(255,80,0,0.3)';
        ctx.beginPath();ctx.arc(s.x,s.y,s.radius*1.3,0,Math.PI*2);ctx.fill();
      }
    } else if(s.type===ST.PLATE){
      drawPlate(ctx,s.x,s.y,s.contents||[],s.radius*1.5);
    } else if(s.type===ST.SERVE){
      ctx.fillStyle='#5a8a50';
      ctx.beginPath();ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle='#7aaa70';ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle=C.white;
      ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillText('OUT',s.x,s.y);
    } else if(s.type===ST.TRASH){
      ctx.fillStyle='#4a3030';
      ctx.beginPath();ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#6a4040';
      ctx.beginPath();ctx.arc(s.x,s.y,s.radius*0.7,0,Math.PI*2);ctx.fill();
      ctx.font='10px monospace';ctx.textAlign='center';ctx.textBaseline='middle';
      ctx.fillStyle='#cc6666';
      ctx.fillText('X',s.x,s.y);
    }

    ctx.restore();

    // Draw contents
    if(s.contents&&(s.type===ST.CHOP||s.type===ST.STOVE||s.type===ST.STEAMER)){
      drawFoodItem(ctx,s.x,s.y,s.contents.ing,s.contents.state,22);
    }

    // Label
    ctx.fillStyle=isNear||isHover?C.text:'rgba(255,210,120,0.7)';
    ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.textBaseline='bottom';
    ctx.fillText(s.label,s.x,s.y+s.radius+12);

    // Steam effect for steamer
    if(s.type===ST.STEAMER&&s.contents){
      const t2=state.time||0;
      for(let i=0;i<3;i++){
        const sx=s.x+(Math.sin(t2*2+i*2)*8);
        const sy=s.y-10-i*8-(t2*20%20);
        const alpha=1-(i/3);
        ctx.fillStyle=`rgba(200,220,240,${alpha*0.4})`;
        ctx.beginPath();ctx.arc(sx,sy,5+i*2,0,Math.PI*2);ctx.fill();
      }
    }
  }
}

function drawPlayer(ctx,state){
  const player=state.player;
  if(!player) return;
  const px=player.getX(),py=player.getY();

  ctx.save();
  // Shadow
  ctx.fillStyle='rgba(0,0,0,0.3)';
  ctx.beginPath();ctx.ellipse(px+2,py+20,10,4,0,0,Math.PI*2);ctx.fill();

  // Body (chef outfit)
  ctx.fillStyle='#f5e8d0';
  ctx.beginPath();ctx.ellipse(px,py,12,14,0,0,Math.PI*2);ctx.fill();
  // Apron
  ctx.fillStyle='#c85050';
  ctx.fillRect(px-8,py-5,16,16);
  // Head
  ctx.fillStyle='#f0d0a0';
  ctx.beginPath();ctx.arc(px,py-18,9,0,Math.PI*2);ctx.fill();
  // Chef hat
  ctx.fillStyle='#ffffff';
  ctx.fillRect(px-7,py-30,14,10);
  ctx.beginPath();ctx.arc(px,py-30,7,Math.PI,0);ctx.fill();
  // Hat band
  ctx.fillStyle='#c85050';
  ctx.fillRect(px-7,py-22,14,3);
  // Eyes
  ctx.fillStyle='#333';
  ctx.beginPath();ctx.arc(px-3,py-18,1.5,0,Math.PI*2);ctx.arc(px+3,py-18,1.5,0,Math.PI*2);ctx.fill();
  // Arm holding item
  const facing=player.facing||1;
  if(player.carrying){
    const ax=px+facing*10,ay=py-5;
    ctx.fillStyle='#f0d0a0';
    ctx.fillRect(px,py-5,facing*10,4);
    // Item being carried
    drawFoodItem(ctx,px+facing*14,ay-5,player.carrying.ing,player.carrying.state,18,0);
  }

  ctx.restore();
}

export { C };
