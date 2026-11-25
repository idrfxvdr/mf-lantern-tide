// Input handling: keyboard (WASD/arrows + E interact + Space chop) + mouse

export const keys = {
  up: false, down: false, left: false, right: false,
  interact: false, action: false,
  pause: false, escape: false, enter: false,
};

export const mouse = { x: 0, y: 0, down: false, clicked: false };

const KEY_MAP = {
  ArrowUp: 'up', KeyW: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', KeyS: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', KeyA: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', KeyD: 'right', d: 'right', D: 'right',
  KeyE: 'interact', e: 'interact', E: 'interact',
  Space: 'action', ' ': 'action',
  Escape: 'escape', esc: 'escape',
  KeyP: 'pause', p: 'pause', P: 'pause',
  Enter: 'enter',
};

let _prevKeys = {};
let _mouseClicked = false;

export function setupInput(canvas) {
  window.addEventListener('keydown', (e) => {
    const k = KEY_MAP[e.code] || KEY_MAP[e.key];
    if (k) { keys[k] = true; e.preventDefault(); }
  });

  window.addEventListener('keyup', (e) => {
    const k = KEY_MAP[e.code] || KEY_MAP[e.key];
    if (k) keys[k] = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  canvas.addEventListener('mousedown', () => { mouse.down = true; });
  canvas.addEventListener('mouseup', () => { mouse.down = false; });
  canvas.addEventListener('click', () => { mouse.clicked = true; });
}

export function wasKeyPressed(key) {
  const pressed = !!keys[key];
  const prev = !!_prevKeys[key];
  return pressed && !prev;
}

export function consumeKeys() {
  _prevKeys = { ...keys };
}
