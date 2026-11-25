// loop.js - fixed-step update helper used by main.js.
export function step(state, dt, hooks) {
  state.time += dt;
  if (state.tide) state.tide.update(dt);
  hooks.update(dt);
  if (state.particles) state.particles.update(dt);
}