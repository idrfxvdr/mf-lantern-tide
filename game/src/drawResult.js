// drawResult.js - Shift result warm card
import { RECIPES } from './recipes.js';

export function drawResult(ctx, W, H, state) {
  const cx=W/2, cy=H*0.46;
  const cw=480, ch=380;
  const passed=state.shiftPassed;

  // Dim background but keep kitchen visible
  ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(0,0,W,H);

  // Card
  ctx.save();
  const cardGrad=ctx.createLinearGradient(cx-cw/2,cy-ch/2,cx+cw/2,cy+ch/2);
  cardGrad.addColorStop(0,passed?'#1a3a1a':'#3a1a1a');
  cardGrad.addColorStop(1,passed?'#0d2010':'#200a0a');
  ctx.beginPath(); ctx.roundRect(cx-cw/2,cy-ch/2,cw,ch,16); ctx.fillStyle=cardGrad; ctx.fill();
  ctx.strokeStyle=passed?'#44cc66':'#ff4444'; ctx.lineWidth=3; ctx.stroke();

  // Stars
  const stars=passed?3:1;
  for(let i=0;i<3;i++){
    const sx=cx-60+i*60, sy=cy-ch/2+55;
    ctx.fillStyle=i<stars?'#ffd700':'#444';
    ctx.font='40px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText('★',sx,sy);
  }

  // Title
  ctx.fillStyle=passed?'#44cc66':'#ff4444';
  ctx.font='bold 28px sans-serif';
  ctx.fillText(passed?`SHIFT ${state.currentShift} COMPLETE!`:`SHIFT ${state.currentShift} FAILED`,cx,cy-ch/2+115);

  // Stats
  const stats=[
    ['Shift Score',String(state.shiftScore||0)],
    ['Total Score',String(state.score||0)],
    ['Best Combo',`x${Math.max(1,state.combo||0)}`],
  ];
  ctx.font='16px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
  stats.forEach(([label,val],i)=>{
    const ly=cy-ch/2+155+i*36;
    ctx.fillStyle='#a08050'; ctx.fillText(label,cx-160,ly);
    ctx.fillStyle='#ffd27d'; ctx.font='bold 16px sans-serif'; ctx.fillText(val,cx+20,ly);
    ctx.font='16px sans-serif'; ctx.fillStyle='#a08050';
  });

  // Orders served
  const orders=state.orders||[];
  const served=orders.filter(o=>o.served).length;
  const failed=orders.filter(o=>o.failed).length;
  const missed=orders.filter(o=>!o.served&&!o.failed).length;
  ctx.fillStyle='#a08050'; ctx.font='13px sans-serif';
  ctx.fillText(`Orders: ${served} served  |  ${failed} failed  |  ${missed} missed`,cx,cy-ch/2+270);

  // Action prompt
  ctx.fillStyle='rgba(255,210,125,0.7)'; ctx.font='14px sans-serif'; ctx.textAlign='center';
  if(passed&&state.currentShift>=5) ctx.fillText('All shifts done! Press ENTER',cx,cy+ch/2-30);
  else if(passed) ctx.fillText('Press ENTER for next shift',cx,cy+ch/2-30);
  else ctx.fillText('Press ENTER to retry',cx,cy+ch/2-30);

  ctx.restore();
}
