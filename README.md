# Skyline Stack

**A 60-second, one-button tower game for an esports booth.** Tap to drop a sliding sky-block, line it up with the one below, and climb through nine sky layers to reach **Cloud Nine** before the clock runs out.

Entry for the **Cloud9 x JetBrains "Sky's The Limit" Hackathon 2026, Category 3: Event Mini Game.** Built with **JetBrains Junie CLI** (see [How JetBrains tools were used](#how-jetbrains-tools-were-used) and [AI_SHOWCASE.md](AI_SHOWCASE.md)).

- **Play now:** https://song11071696.github.io/cloud9-minigame/
- **Booth kiosk link:** https://song11071696.github.io/cloud9-minigame/?kiosk=1&event=booth
- **Two-player duel:** https://song11071696.github.io/cloud9-minigame/?duel=1

> Original game. No Riot Games names, art, sounds or UI, and no team logos. Every pixel is drawn on a `<canvas>` by code and every sound is synthesised with the Web Audio API. Zero backend, zero API keys, works offline once loaded.

## Why this game fits a booth

A booth game has to be learned in three seconds by a stranger who is holding a drink, finished in about a minute so the queue keeps moving, and still fun for the person who comes back five times to beat a friend. Skyline Stack is designed around that:

| Booth need | How Skyline Stack handles it |
|---|---|
| Instantly understandable | One button. A block slides; press to drop it. The overhang is sliced off. That's the whole game. |
| Short, fixed rounds | 3 s countdown + 60 s round (ends early if you miss completely). |
| Readable from 3 m | Huge HUD sized from the viewport, high-contrast outlined text, colour-blind-safe feedback (PERFECT is shape + text, not only colour). |
| Draws a crowd while idle | Attract mode: a demo bot builds a tower in the background while cards rotate (title, top-10 board, how to play). |
| Bragging rights | Local top-10 leaderboard with arcade initials, entered with the same single button; separate board per event day. |
| Two friends at once | Side-by-side duel on one screen with the same seeded tower and wind. |
| Unattended kiosk | Kiosk mode: hidden cursor, no zoom/selection/context menu, fullscreen, screen wake-lock, auto-return to attract, operator panel. |
| Mashers | Result screens ignore input briefly so players always see their score. |

## How to play

1. **TAP** (or press Space / Enter / any gamepad face button) to drop the sliding block.
2. Whatever hangs over the edge of the block below is sliced off and falls away, so your tower gets narrower.
3. Drop within 1.5 units of perfect for a **PERFECT**: the block snaps into place and your combo grows. **Three perfects in a row grow the block back.**
4. Every 6 floors you break into a new sky layer: faster blocks, then crosswinds from layer 4, and the sky changes from dusk rooftops to stars and aurora. Floor 48 is **Cloud Nine**.
5. The round ends when the 60 s run out, or immediately if a block misses the tower completely.

**Score** = 10 per floor + perfect bonus (25 × combo) + 100 per layer broken + 500 for reaching Cloud Nine + a small speed bonus for floors placed early.

### The nine layers

| # | Layer | Floors | What changes |
|---|---|---|---|
| 1 | Rooftops | 0–5 | Warm dusk skyline, slow block |
| 2 | Low Haze | 6–11 | Faster |
| 3 | Sunlit Drift | 12–17 | Faster |
| 4 | Cloud Shelf | 18–23 | Seeded crosswind starts |
| 5 | Blue Expanse | 24–29 | Stronger wind |
| 6 | Silver Reach | 30–35 | Stronger wind |
| 7 | Starline | 36–41 | Stars appear |
| 8 | High Aurora | 42–47 | Aurora sky |
| 9 | Cloud Nine | 48+ | Golden summit, celebration, keep stacking |

## Controls

| Input | Single player | Duel |
|---|---|---|
| Keyboard | Space, Enter or ↑ | P1: A or S · P2: L or K |
| Touchscreen / mouse | Tap anywhere | Left half = P1 · Right half = P2 |
| Gamepad | Any face button or Start | Pad 1 = P1 · Pad 2 = P2 |
| Initials | Tap = next letter · hold 0.6 s = confirm · or type letters | — |
| Other | M = mute · D on attract = toggle duel · hold O for 3 s = operator panel | |

USB arcade buttons that send Space/Enter through a keyboard encoder work out of the box.

## Booth / kiosk setup

URL parameters (combine with `&`):

| Parameter | Effect |
|---|---|
| `?kiosk=1` | Hide cursor; block context menu, pinch/double-tap zoom and text selection; go fullscreen on first input; keep the screen awake (Wake Lock API); return to attract after 20 s idle on any non-play screen. |
| `?event=NAME` | Separate leaderboard per event/day (`a-z0-9-`, max 24 chars), shown on the attract and leaderboard screens. |
| `?duel=1` | Start in two-player duel mode. |
| `?seed=N` | Fixed tower and wind pattern (handy for tournaments and recordings). |
| `?mute=1` | Start muted. |
| `?test=1` | Exposes a read-only `window.__skyline` state getter for automated smoke tests. |

**Operator panel:** hold **O** for 3 s, or press and hold the top-left 80×80 px corner for 3 s. Options: clear this event's leaderboard (confirm twice), toggle sound, toggle duel default, close. Shows the build version and event.

Suggested booth hardware: any touchscreen PC or tablet with Chrome/Edge in kiosk mode (`chrome --kiosk "https://song11071696.github.io/cloud9-minigame/?kiosk=1&event=booth"`), or a monitor + one big USB arcade button. Leaderboards live in that browser's `localStorage`, so no network is needed during the event.

## Run it locally

Requirements: Node.js 20+ (built and tested on Node 22).

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # vitest unit tests for all game logic
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build
```

The production build is a static folder (`dist/`) with relative paths, so it can be hosted anywhere (GitHub Pages, itch.io, a USB stick with any static server).

## Architecture

```
src/
  core/        pure, deterministic game logic: no DOM, no Date.now(), no Math.random()
    rng.ts           seeded PRNG (mulberry32)
    stack.ts         slide, drop, chop, perfect snap, grow-back
    layers.ts        nine sky layers: speed, wind, palettes
    scoring.ts       score formula
    round.ts         round state machine (ready → countdown → playing → over)
    flow.ts          app screen flow (level-triggered, idempotent)
    duel.ts          two-player outcome rules
    leaderboard.ts   top-10 per event, validation, safe (de)serialisation
    initials.ts      one-button initials entry
    attract.ts       idle timer + demo bot
    kiosk.ts, screen-lockout.ts, inputmap.ts
  render/renderer.ts   canvas renderer (DPR-aware, portrait + landscape)
  audio/synth.ts       Web Audio synth: SFX + procedural music
  input/input.ts       keyboard, pointer/touch, Gamepad API
  main.ts              app shell, fixed 1/120 s timestep loop
tests/               vitest suites for every core module
.junie/              Junie guidelines + the transcript of every Junie session
```

Keeping all rules in `src/core` as pure functions made the game testable without a browser and let Junie verify its own changes with `npm test` on every task.

## Testing

- `npm test` runs the vitest suite: stack/chop math, perfect snapping and grow-back cap, layer thresholds and wind determinism, scoring, round transitions (countdown, time-up, miss), screen flow regression tests, duel outcomes, leaderboard sorting/per-event keys/corrupt storage, one-button initials, input routing, kiosk idle logic, result-screen lockout, and a full 60 s simulated demo-bot round for five seeds.
- `qa/smoke.mjs` is an end-to-end smoke test in headless Chromium. It plays a real round against any URL using `?test=1`, then checks attract → countdown → play → game over → one-button initials → leaderboard and the saved score. It found a freeze-after-miss bug, which was fixed with a regression test (see `.junie/sessions/task-05-flow-fix.md`). To run it: `npm run build && npx vite preview --port 4173`, then in another terminal `npm i --no-save playwright && npx playwright install chromium && node qa/smoke.mjs http://localhost:4173/`.

## How JetBrains tools were used

The game was built with **JetBrains Junie CLI** (v26.11.3, `linux-aarch64`), JetBrains' coding agent, signed in with a JetBrains Account on the free **Junie Lite** tier. The workflow:

1. **Guidelines first.** `.junie/guidelines.md` holds the product brief, hard rules (original IP only, no backend, no asset files), the module architecture, booth requirements and the definition of done (`npm test` + `npm run build` must pass).
2. **Headless agent tasks.** Each of the 8 milestones was one `junie --task "…"` run in this repository. Junie scaffolded the project, wrote every module and test, ran the test suite and the production build, and fixed its own failures before finishing.
3. **Playtest loop.** After each task the build was played in headless Chromium; screenshots and smoke-test findings were turned into the next Junie task (for example: HUD over the title, muddy colours, button-mashers skipping results, a freeze after a miss, initials not working with arcade buttons).
4. **Self-review.** `junie --review` audited all Junie commits and found three real issues (a crash on `?event=constructor`, initials letters swallowed by shortcuts, and a wake lock that was never re-acquired). A final Junie task fixed them with regression tests.
5. **Evidence.** Every prompt and the verbatim Junie transcript are committed under [`.junie/sessions/`](.junie/sessions/), and each Junie milestone is its own git commit (`git log`).

Full story, numbers and honest limits: [AI_SHOWCASE.md](AI_SHOWCASE.md).

## License

[MIT](LICENSE). Cloud9 is mentioned as plain text only (the event this game was designed for); this project is not affiliated with or endorsed by Cloud9, JetBrains or Riot Games.
