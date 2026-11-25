# Lantern Tide — NOTES

An original browser cooking game: a night kitchen on a floating market raft. The tide
rises and falls; at high tide a drifting bridge joins the two piers, at low tide a narrow
plank does, and at mid tide there is no crossing, so each order is a route-planning problem.

## Controls

- **WASD / arrow keys** — walk (hold to keep moving)
- **E** — use the station you are standing at (pick up, chop, fry, steam, plate, serve, trash)
- **Space** — also use / work
- **Mouse click a station or crate** — walk there (tide-aware route) and use it
- **P / Esc** — pause
- **Enter** — start, continue, retry
- **Click the SOUND panel** (bottom right) — mute / unmute

Loop: crate → chopping board (raw→chopped) → pan (→fried) or steamer (→steamed) → plating
counter → serving hatch. Ingredients may be plated in any order. A pan or steamer left too
long burns; the trash bin clears mistakes. The order board shows four paper tickets with a
dish picture, name, ingredient + state glyphs, a patience bar (green→yellow→orange→red) and
a price. The lantern clock turns red under 15 s. Five shifts grow the menu (4→8 recipes),
shorten the shift and patience, and raise the number of orders needed.

## Source map (one job per file)

- `layout.js` — the single layout table: piers, channel, HUD panels, crates, stations, stands,
  ticket geometry, and box helpers shared by drawing and `overlap.mjs`.
- `recipes.js` — 8 ingredients, 8 original recipes, state transitions.
- `orders.js` — deterministic order generation, patience, exact recipe matching, scoring.
- `stations.js` — station state and interactions (crate/chop/stove/steamer/plate/serve/trash),
  cook and burn timers.
- `tide.js` — deterministic tide level and which crossing is open.
- `pathing.js` — tide-aware route planning and water clamping.
- `player.js` — cook position, waypoint queue, carried ingredient.
- `assembly.js` — plate multiset helpers: signatures, exact recipe match, add/remove/clear.
- `game.js` — state, shifts, serving, scoring, update loop.
- `drawKitchen.js` — scene composition, spotlight, vignette.
- `drawWater.js`, `drawPiers.js`, `drawCrates.js`, `drawCookware.js`, `drawService.js`,
  `drawChef.js`, `drawFood.js`, `drawTickets.js`, `drawClock.js`, `drawResult.js` — drawing.
- `hud.js` — score/tide/held/help/mute/combo/toast and the title, pause, win, lose cards.
- `audio.js` — WebAudio-synthesised effects, Node-safe.
- `input.js` — keyboard/mouse state.
- `particles.js` — steam, smoke, chop flecks, sparkles (seeded).
- `rng.js` — Mulberry32 seeded random.
- `shots.js` — frozen states for `?shot=1..4`.
- `selftest.js` — keyboard-driven browser smoke test for `?test=1`.
- `main.js` — bootstrap, frame loop, capture and test hooks.

## What was tested (true results)

- `node overlap.mjs` → **OK**: 67 HUD/ticket/clock/crate/station/prop boxes, no
  intersections, all inside 1280×800 (the four new floor props are in the table too).
- `node test.mjs` → **20 passed, 0 failed**:
  - one served order for each of the 8 recipes through the real `serve()` path;
  - pan fries then burns (raw fish → fried → burned);
  - an order fails by patience and `failedThisShift` increments;
  - shift pass, shift-5 win, shift-5 lose;
  - high tide = bridge, low tide = plank, mid tide = blocked;
  - 8 ingredients, 8 distinct recipes;
  - **real headless Chromium** (`?test=1`) cooks a Tide Rice from crate → steamer → plate →
    hatch using only synthetic keyboard events, with **no console error**.
- Screenshots captured from the real game at 1280×800 with `chromium --headless=new`:
  `1-kitchen.png` (198,628 B), `2-rush.png` (196,947 B), `3-plating.png` (217,744 B),
  `4-result.png` (152,346 B). All are PNG, 1280×800, under 256 KiB.
- Pixel statistics (code, not visual): mean luminance 71 / 71 / 72 / 46, so no shot is blank
  or black; the kitchen is now evenly lit (round 4: the night overlay was cut to alpha 0.12
  and the wood lightened ~35%, so the floor, crates, stations and labels all read — shot 3's
  left pier mean 78, right pier mean 73, 0% dark pixels in both, no longer only the chef lit).
- Partial plates are rejected: serving with only half the required steps returns `null` and
  leaves `servedThisShift` at 0 (asserted for every recipe in `test.mjs`).

## Round 4 polish (this pass)

- Lighting: the spotlight is now a warm (255,190,110) light pool and the vignette is capped
  at alpha 0.12; pier/crate wood base colours are ~35% lighter; station and crate labels are
  full-strength cream `#FFF3D6`.
- Rice (raw and steamed) is warm white `#FFF6E5` with soft grey grain marks (no more lilac).
- Empty floor filled: plank seams between the crates and CHOP and between the right-pier
  stations, plus a spice shelf, two hanging utensil racks and a lantern post (all in the
  layout table, clear of every hit area and label).
- Tickets: ingredient icons 40px, dish picture 64px.
- Shot 3 shows food in the pan and steamer with progress rings, a cleaver mid-chop with
  flying pieces, and the chef at the side of the board.

## Still weak / honest caveats

- I cannot look at images; layout was verified by `overlap.mjs` and by reasoning over the
  shared layout table, not by eye. A human/editor pass on the PNGs is still worthwhile.
- Balance is unproven by play: shift 1 needs 3 orders in 62 s, shift 5 needs 7 in 38 s, and
  the mid-tide no-crossing window can strand a run. It may be too tight or too loose.
- Audio was not listened to; the effects are synthesised but their mix is unverified.
- The result card is intentionally dark-warm; it measured mean luminance 46 (not black).
- No touch/mobile layout; the canvas is fixed at 1280×800 and scales down.
- `assembly.js` is real (plate signatures and add/remove), but there is no separate
  assembler animation; plating is instant.