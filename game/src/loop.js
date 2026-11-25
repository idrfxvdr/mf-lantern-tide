// loop.js - a small fixed-step update helper (time, tide, hooks, particles).
// main.js drives its own requestAnimationFrame loop; this is kept as a reusable step.
export function step(state, dt, hooks) {
  state.time += dt;
  if (state.tide) state.tide.update(dt);
  if (hooks && hooks.update) hooks.update(dt);
  if (state.particles) state.particles.update(dt);
}