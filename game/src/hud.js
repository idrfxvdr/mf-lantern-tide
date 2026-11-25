// hud.js - HUD: score, tide, held item, help
import { INGREDIENTS } from './recipes.js';
import { drawFoodItem } from './drawFood.js';
import { C } from './drawKitchen.js';
import { drawTickets } from './drawTickets.js';
import { drawClock } from './drawClock.js';
import { drawResult } from './drawResult.js';

// Rounded rect polyfill
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w/2, h/2);
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
}

export function drawHUD(ctx, W, H, state) {
  // Draw order tickets at top
  drawTickets(ctx, W, H, state);
  // Draw lantern clock at top center
  drawClock(ctx, W, H, state);
  // Score panel top-left (below clock area)
  drawScorePanel(ctx, state);
  // Tide gauge right of center
  drawTideGauge(ctx, W, state);
  // Held item indicator bottom-left
  drawHeldItem(ctx, state);
  // Help text bottom center
  drawHelpText(ctx, W, H, state);
  // Combo indicator
  if ((state.combo||0) > 1) drawCombo(ctx, W, H, state);
}

function drawScorePanel(ctx, state) {
  const x=10, y=100, w=170, h=80;
  ctx.fillStyle='rgba(20,12,5,0.75)';
  rrect(ctx,x,y,w,h,8); ctx.fill();
  ctx.strokeStyle='#7a5030'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#ffd27d'; ctx.font='bold 11px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText('SCORE',x+10,y+8);
  ctx.fillStyle='#ffd700'; ctx.font='bold 24px sans-serif'; ctx.fillText(String(state.score||0).padStart(6,'0'),x+10,y+26);
  ctx.fillStyle='#a08050'; ctx.font='11px sans-serif';
  ctx.fillText(`Shift ${state.currentShift}/5`,x+10,y+60);
  ctx.fillStyle='#88aa66'; ctx.fillText(`+${state.shiftScore||0}`,x+100,y+60);
}

function drawTideGauge(ctx, W, state) {
  const tide=state.tide;
  if(!tide) return;
  const tx=W-160, ty=12, tw=140, th=76;
  ctx.fillStyle='rgba(20,12,5,0.7)';
  rrect(ctx,tx,ty,tw,th,6); ctx.fill();
  ctx.strokeStyle='#4a6a80'; ctx.lineWidth=1.5; ctx.stroke();
  // Tide level bar
  const barX=tx+8, barY=ty+8, barW=12, barH=50;
  ctx.fillStyle='#0a1a24'; ctx.fillRect(barX,barY,barW,barH);
  const level=tide.level;
  ctx.fillStyle=level>0.6?'#4488aa':level<0.4?'#884422':'#446688';
  ctx.fillRect(barX,barY+barH*(1-level),barW,barH*level);
  // Label
  ctx.fillStyle='#ffd27d'; ctx.font='bold 10px sans-serif'; ctx.textAlign='left'; ctx.textBaseline='top';
  ctx.fillText('TIDE',tx+26,ty+8);
  ctx.fillStyle=level>0.6?'#88bbdd':level<0.4?'#dd8844':'#88aacc';
  ctx.font='bold 12px sans-serif';
  ctx.fillText(level>0.6?'HIGH':level<0.4?'LOW':'MID',tx+26,ty+22);
  // Route indicator
  ctx.fillStyle='#a08050'; ctx.font='10px sans-serif';
  ctx.fillText(level>0.6?'Bridge drifting':level<0.4?'Plank OK':'Bridge normal',tx+8,ty+58);
}

function drawHeldItem(ctx, state) {
  const player=state.player;
  if(!player||!player.carrying) return;
  const item=player.carrying;
  const ix=20, iy=H-90;
  ctx.fillStyle='rgba(20,12,5,0.8)';
  rrect(ctx,ix,iy,120,75,8); ctx.fill();
  ctx.strokeStyle='#7a5030'; ctx.lineWidth=1.5; ctx.stroke();
  ctx.fillStyle='#a08050'; ctx.font='10px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='top';
  const info=INGREDIENTS[item.ing];
  ctx.fillText(info?info.name:item.ing,ix+60,iy+6);
  // Item icon
  const ic=item.state==='burned'?'#333':item.state==='fried'?'#c8860a':item.state==='steamed'?'#e8c8d0':'#ffd080';
  ctx.fillStyle=ic;
  ctx.beginPath(); ctx.arc(ix+60,iy+40,28,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='#7a5030'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#a08050'; ctx.font='9px sans-serif';
  ctx.fillText(item.state.toUpperCase(),ix+60,iy+70);
}

function drawHelpText(ctx, W, H, state) {
  if(state.screen!=='play') return;
  ctx.fillStyle='rgba(20,12,5,0.6)';
  ctx.fillRect(W/2-170,H-26,340,22);
  ctx.fillStyle='#a08050'; ctx.font='11px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('WASD move  |  Click station  |  E interact  |  P pause',W/2,H-15);
}

function drawCombo(ctx, W, H, state) {
  const c=state.combo||0;
  if(c<2) return;
  ctx.fillStyle='rgba(20,12,5,0.7)';
  rrect(ctx,W/2-60,H/2-40,120,50,10); ctx.fill();
  ctx.strokeStyle='#ff8c20'; ctx.lineWidth=2; ctx.stroke();
  ctx.fillStyle='#ff8c20'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(`x${c} COMBO!`,W/2,H/2-15);
}

// Screen overlays
export function drawTitleScreen(ctx,W,H){
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#020a18'); bg.addColorStop(1,'#0a1520');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
  const glow=ctx.createRadialGradient(W/2,H*0.3,0,W/2,H*0.3,280);
  glow.addColorStop(0,'rgba(255,140,32,0.15)'); glow.addColorStop(1,'transparent');
  ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffd27d'; ctx.font='bold 52px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('LANTERN TIDE',W/2,H*0.28);
  ctx.fillStyle='#ff8c20'; ctx.font='18px sans-serif';
  ctx.fillText('A Night Kitchen on the Floating Market',W/2,H*0.37);
  ctx.fillStyle='#a08050'; ctx.font='15px sans-serif';
  const lines=['WASD / ARROWS — Move','E — Interact with stations','Click — Walk to station',
               'Collect ingredients, cook, plate, and serve!','Watch the tide — plan your route!','','Press ENTER or click to start'];
  lines.forEach((l,i)=>{
    ctx.fillStyle=l.startsWith('WASD')||l.startsWith('E —')||l.startsWith('Collect')||l.startsWith('Watch')?'#c0a070':'#ffd27d';
    ctx.fillText(l,W/2,H*0.52+i*30);
  });
}

export function drawPauseScreen(ctx,W,H){
  ctx.fillStyle='rgba(0,0,0,0.65)'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffd27d'; ctx.font='bold 36px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('PAUSED',W/2,H*0.45);
  ctx.fillStyle='#a08050'; ctx.font='14px sans-serif';
  ctx.fillText('Press P or ESC to resume',W/2,H*0.56);
}

export function drawShiftResult(ctx,W,H,state){ drawResult(ctx,W,H,state); }

export function drawWinScreen(ctx,W,H,state){
  ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ffd700'; ctx.font='bold 44px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('SHIFTS COMPLETE!',W/2,H*0.3);
  ctx.fillStyle='#ffd27d'; ctx.font='22px sans-serif';
  ctx.fillText('Final Score: '+(state.score||0),W/2,H*0.45);
  ctx.fillStyle='#44cc66'; ctx.font='16px sans-serif';
  ctx.fillText('You conquered the Lantern Tide!',W/2,H*0.55);
  ctx.fillStyle='#a08050'; ctx.font='14px sans-serif';
  ctx.fillText('Press ENTER to play again',W/2,H*0.68);
}

export function drawLoseScreen(ctx,W,H,state){
  ctx.fillStyle='rgba(0,0,0,0.8)'; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ff4444'; ctx.font='bold 38px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText('GAME OVER',W/2,H*0.3);
  ctx.fillStyle='#ffd27d'; ctx.font='20px sans-serif';
  ctx.fillText('Score: '+(state.score||0),W/2,H*0.45);
  ctx.fillStyle='#a08050'; ctx.font='14px sans-serif';
  ctx.fillText('Press ENTER to try again',W/2,H*0.6);
}
