# Junie guidelines — Skyline Stack (Cloud9 x JetBrains "Sky's The Limit" hackathon, Category 3: Event Mini Game)

## Product in one line
A one-button, 60-second arcade tower game for an esports booth: tap to drop a sliding sky-block, stack as high as you can and break through nine sky layers to reach "Cloud Nine". Local initials leaderboard, attract mode, kiosk mode, 2-player duel.

## Hard rules
- Original work only. NO Riot Games names, champions, maps, art, sounds or UI. NO Cloud9 logo or brand art. The word "Cloud9" may appear only as plain text (e.g. "made for the Cloud9 booth"). The phrase "Cloud Nine" (the idiom) is the game's goal name.
- Zero backend, zero API keys, zero network calls at runtime. Everything is static files deployable to GitHub Pages under the sub-path `/cloud9-minigame/` (set Vite `base: './'`).
- No image/audio asset files: all visuals are drawn on <canvas> with code; all audio is synthesised with the Web Audio API in code.
- TypeScript strict mode. No `any` unless unavoidable and commented.

## Architecture
- `src/core/` — PURE game logic, no DOM, no Date.now(), no Math.random(). Deterministic given a seed and a time step. 100% unit-tested with vitest.
  - `rng.ts` seeded PRNG (mulberry32).
  - `stack.ts` block slide + drop + chop math (overlap, perfect-drop tolerance, perfect streak grow-back).
  - `layers.ts` the nine sky layers: height thresholds, speed, wind drift, block-width rules, names and palette ids.
  - `scoring.ts` score = floors*10 + perfect bonus * combo multiplier + layer-break bonus + Cloud Nine bonus + time bonus.
  - `round.ts` round state machine: ready -> countdown(3s) -> playing(60s) -> over (time up, or block missed) ; fixed-step `update(dt)` and `press()`.
  - `leaderboard.ts` top-10 per event key, sort (score desc, then earlier timestamp), initials validation (3 chars A-Z0-9), (de)serialisation, injected storage interface.
  - `initials.ts` one-button initials entry state machine (tap = next letter, hold = confirm letter, also accepts typed keys).
  - `attract.ts` idle timer + demo-bot that plays automatically (bot presses when overlap is near-perfect, with seeded mistakes).
- `src/render/` canvas renderer (sky gradient by layer, parallax clouds, stars above layer 7, particles, big readable HUD sized from viewport min dimension).
- `src/audio/` Web Audio synth: drop thud, perfect chime (pitch rises with combo), layer-break whoosh, countdown beeps, game-over sting, light procedural music loop; global mute.
- `src/input/` unified input: keyboard (Space/Enter, A and L in duel), pointer/touch (whole screen; left/right half in duel), Gamepad API (any face button; pad 0 / pad 1 in duel). Debounce 80 ms.
- `src/main.ts` app shell / screens: ATTRACT -> READY -> PLAY -> INITIALS -> LEADERBOARD -> ATTRACT.

## Booth/kiosk requirements
- URL params: `?kiosk=1` (hide cursor, block context menu/zoom, auto-return to attract after 20 s idle, request fullscreen on first input), `?event=NAME` (separate leaderboard per event day), `?duel=1` start in duel, `?seed=N` fixed tower, `?mute=1`.
- Operator: hold O for 3 s (or long-press top-left corner 3 s) opens operator panel: clear leaderboard, toggle sound, toggle duel, show build info.
- Visuals readable from 3 m: HUD text min 4% of viewport height, high contrast, colour-blind-safe (perfect = shape + text, not only colour).

## Process
- Write/extend vitest tests in `tests/` for every core module before or with the implementation. Run `npm test` and `npm run build` before declaring a task done.
- Keep functions small; comment non-obvious math.
