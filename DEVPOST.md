# Devpost submission: paste-ready

**Category:** Category 3: Event Mini Game

**Project name:** Skyline Stack

**Tagline (≤ 200 chars):** A 60-second, one-button tower game for the Cloud9 booth: tap to drop, slice, stack through nine sky layers to Cloud Nine. Kiosk-ready, duel mode, built with JetBrains Junie.

**Links**
- Live demo: https://song11071696.github.io/cloud9-minigame/
- Kiosk link for booths: https://song11071696.github.io/cloud9-minigame/?kiosk=1&event=booth
- Code (MIT): https://github.com/song11071696/cloud9-minigame
- AI workflow story (bonus prize): https://github.com/song11071696/cloud9-minigame/blob/main/AI_SHOWCASE.md
- Video: *(YouTube link — to be added after upload)*

---

## Inspiration

At an esports booth the game isn't the main event. It's what people do while they wait, while they decide whether to stay, and while their friends watch. Someone holding a drink has to understand it in three seconds and finish it in about a minute, and it has to be good enough that they come back to beat a friend's score. Most booth games miss on at least one of those: too many controls, rounds that run too long, or no reason to return.

We wanted the simplest possible verb, *press*, attached to a clear goal that fits the event: **the sky's the limit, so climb to Cloud Nine.**

## What it does

Skyline Stack is a one-button arcade tower game:

- A block slides across the top of your tower. **Press to drop it.** Whatever overhangs the block below is sliced off, so your tower narrows.
- Land within a hair of perfect for a **PERFECT**: the block snaps into place and your combo grows, and **three perfects in a row grow the block back**.
- Every six floors you break into a new **sky layer**. There are nine (Rooftops → Low Haze → … → Starline → High Aurora → **Cloud Nine**). Each is faster, crosswinds start at layer 4, and the sky goes from dusk city to stars and aurora.
- **60-second rounds** with a big timer ring. A complete miss ends the run right away.
- **Arcade initials** on a local **top-10 leaderboard**, entered with the same single button (tap = next letter, hold = confirm).
- **Two-player duel** on one screen: same seeded tower and wind, left vs right half of a touchscreen, A vs L, or two gamepads.
- **Attract mode**: when idle, a demo bot builds a tower behind rotating cards (title, today's top 10, how to play).
- **Kiosk mode** (`?kiosk=1`): no cursor, no zoom or selection, fullscreen, screen wake-lock, auto-reset to attract, per-event leaderboards (`?event=day1`) and a hidden operator panel (hold O for 3 s) to clear boards or toggle sound and duel.
- **Inputs:** keyboard, touchscreen, any gamepad, or a USB arcade button (they send Space/Enter).
- **Accessible:** readable from 3 m, PERFECT shown as shape + text rather than colour alone, and `prefers-reduced-motion` respected.
- **No assets, no backend:** every visual is drawn on a canvas and every sound (SFX and procedural music) is synthesised with Web Audio. No server, no API keys, and it works offline once loaded.

## How we built it with JetBrains

The game was built with **JetBrains Junie CLI**, JetBrains' coding agent, running **headless on a Linux arm64 machine** and signed in with a JetBrains Account on the free Junie Lite tier.

1. **`.junie/guidelines.md` as the contract.** It holds the product brief, the hard rules (original IP only, no backend, no asset files, a pure deterministic `src/core/`), the module architecture, the booth requirements and the definition of done (`npm test` + `npm run build`). Junie loads it in every session.
2. **Eight headless tasks plus a review** (`junie --task "TASK N …"`): scaffold + pure core + tests → playable game (input, audio, renderer, screens) → booth features (kiosk, events, duel, operator panel) → polish → bug fix → arcade-button initials → result-screen layout → then `junie --review` audited all of it, and a final task fixed the three issues the review found. In each one Junie read the code, planned, edited, ran the tests and the production build, and fixed its own failures before reporting.
3. **Playtest-driven prompts.** Between tasks, the production build was played in headless Chromium using a `?test=1` state hook that Junie itself added. Screenshots and state logs became the next prompt, written as observed symptoms.
4. **Evidence is in the repo.** Every prompt and Junie's verbatim transcript are in `.junie/sessions/`, and every Junie milestone is its own git commit.

Stack: TypeScript (strict), Vite, Vitest, HTML5 Canvas 2D, Web Audio API, Gamepad API, Screen Wake Lock API, GitHub Pages.

## Methodology write-up

**Problem.** Booth games have three users: the **player** (needs it instantly clear, short and fair), the **crowd** (needs it readable and exciting from a distance) and the **booth staff** (need it to run unattended all day). We designed for all three.

**Approach.**
- *Player:* one verb (press), one goal (height), and one escalating twist per sky layer, so the rules are learned in the first drop. Rounds are capped at 60 s, plus a 3 s countdown, so the queue moves. Deterministic seeds keep duels fair, and the PERFECT grow-back mechanic rewards skill so good players have a reason to come back.
- *Crowd:* giant HUD text sized from the viewport, sky colours that change dramatically as the tower climbs (spectators can tell how well someone is doing at a glance), layer-break banners, a Cloud Nine celebration, and an attract mode that keeps the screen alive between players.
- *Staff:* kiosk lockdown, idle reset, wake-lock, per-event leaderboards in local storage (no network needed), an operator panel, input lockout on result screens so mashers don't skip the score, and initials that auto-save if a player walks away.

**Engineering.** All rules live in `src/core/` as pure, deterministic functions with no DOM, randomness or clock. That made the game fully unit-testable (stack and slice math, layers, scoring, round and screen flow, duel outcomes, leaderboard, initials, kiosk idle, lockouts, and a 60 s simulated demo-bot round) and let the Junie agent prove its own changes. Rendering, audio and input are thin layers on top, and the app uses a fixed 1/120 s timestep.

## Challenges we ran into

- **A freeze that every unit test missed.** After a complete miss the game sat on the play screen forever. A headless smoke test caught it. The cause was an edge-triggered screen transition that never fired when the miss happened inside the input handler. Junie verified the cause and replaced it with a pure, level-triggered flow function plus regression tests.
- **Real hardware isn't a desk keyboard.** Arcade buttons arrive as Space/Enter from a USB encoder, so one-button initials needed keydown/keyup hold timing that ignores auto-repeat.
- **Button-mashers.** Excited players skipped their own result screens, so we added a short input lockout with a visible progress line.
- **The agent can't see pixels.** Junie works in a headless shell, so visual polish relied on screenshots taken outside the agent and turned into precise written findings.
- **No IP to lean on.** No Riot or team art, so the identity had to come from code-drawn skies, layer names and synthesised sound.

## Accomplishments that we're proud of

- A complete booth product, not just a prototype: attract → play → initials → leaderboard → attract, plus duel, kiosk and operator tooling.
- 56 unit tests over a fully deterministic core, and a demo bot whose quality is asserted by a test.
- Zero assets and zero backend: the whole game is a few hundred KB of static files that runs offline.
- Junie reviewed its own code (`junie --review`), found a crash on a crafted event name plus two input edge cases, and then fixed them with regression tests.
- A transparent AI workflow. Every Junie prompt and transcript is committed, so judges can trace each feature to the agent run that produced it.

## What we learned

- Put invariants in agent guidelines and keep task prompts about the change. The rules never drifted across eight tasks.
- Give the agent symptoms plus a request to verify, not line-level instructions. Fixes came out more general.
- Determinism is what makes AI-written game code verifiable.
- For booth games, the operator experience (idle reset, lockouts, per-event boards) matters as much as the gameplay.

## What's next for Skyline Stack

- Optional QR "claim your score" export and a booth-wide daily board synced from several kiosks (opt-in, still no accounts).
- Seasonal sky themes and a "tournament seed of the day" for community challenges.
- Optional GRID data hooks, for example a block colour palette or a bonus layer unlocked during live matches.
- Trying the same Junie workflow from inside a JetBrains IDE (WebStorm or Rider) with visual previews in the loop.

## Built with

`typescript` `vite` `vitest` `html5-canvas` `web-audio-api` `gamepad-api` `jetbrains-junie` `junie-cli` `github-pages` `playwright`

## Testing instructions

1. Open https://song11071696.github.io/cloud9-minigame/ in Chrome, Edge, Firefox or Safari (desktop or mobile). Click or tap once to enable sound.
2. **Play:** press Space or Enter (or tap, or press a gamepad button) to start. After the countdown, press to drop each block, lining it up with the one below. Rounds last 60 s.
3. **Leaderboard:** after a round, enter initials. Tap or short-press Space for the next letter, hold 0.6 s to confirm, or just type three letters.
4. **Duel:** open `?duel=1` (or press D on the title screen). P1 uses A, P2 uses L (or the left and right halves of a touchscreen).
5. **Kiosk:** open `?kiosk=1&event=judge`. Leave it idle for 20 s on any result screen to see it reset to attract. Hold **O** for 3 s to open the operator panel.
6. **Fixed tower:** add `&seed=9` to get the same tower and wind every time.
7. **Run from source:** `git clone https://github.com/song11071696/cloud9-minigame && cd cloud9-minigame && npm install && npm test && npm run dev`.

No login, no API keys and no backend are needed.
