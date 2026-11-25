# AI Showcase: building a booth game with JetBrains Junie CLI

This is how **Skyline Stack** was built for the Cloud9 x JetBrains "Sky's The Limit" Hackathon 2026 (Category 3, Event Mini Game). It's written for the *Best AI-Powered Workflow Story* bonus prize and sticks to what happened. All the evidence is in this repository.

## TL;DR

- **Tool:** JetBrains **Junie CLI** 26.11.3 (build 4171.6), installed with the official script on a **Linux arm64** cloud sandbox, so no desktop IDE was involved.
- **Sign-in:** a JetBrains Account (Google sign-in) using the browser OAuth flow. Junie ran on the free **Junie Lite** tier. The session summaries report a model cost of `0.0` for every run. No paid licence, API key or credit card was used.
- **Mode:** **headless** (`junie --task "…"`). There were 8 milestone tasks. Each one ran unattended in the repo, and Junie ran `npm test` and `npm run build` itself before it reported back.
- **Output:** 18 TypeScript source files (~2,800 lines) and 14 vitest files (56 tests). Junie wrote all of them, and all of them pass.
- **Evidence:** the prompt for every task and Junie's verbatim transcript are in [`.junie/sessions/`](.junie/sessions/). The standing brief is [`.junie/guidelines.md`](.junie/guidelines.md). Each Junie milestone is a separate git commit whose message starts with `Junie task 0N`.

## Who did what

Here is the division of labour.

| Role | Who | What |
|---|---|---|
| Product & direction | the entrant, working with a general-purpose AI assistant | Chose the concept, wrote `.junie/guidelines.md` (brief, hard IP rules, architecture, booth requirements, definition of done), wrote each task prompt, ran the playtests, decided what to fix next, wrote the docs and this file |
| Implementation | **JetBrains Junie CLI** | Scaffolded the Vite + TypeScript project, wrote every source module and every test, ran tests and builds, fixed its own failures, and diagnosed and fixed the bugs reported to it |
| QA | headless Chromium (Playwright) script, kept in [`qa/smoke.mjs`](qa/smoke.mjs) | Played real rounds against the production build with `?test=1`, took screenshots, and reported state transitions. Their findings became the next Junie prompt |

No game code was hand-edited between Junie tasks. Changes to the game always went through a new Junie task, so the transcripts are the complete history of the code.

## The loop

```
guidelines.md ──► junie --task "TASK N …" ──► Junie: read code → plan → edit → npm test → npm run build → fix → report
      ▲                                                                                             │
      │                                                                                             ▼
 next prompt ◄── findings ◄── headless Chromium playtest (screenshots + window.__skyline state) ◄── git commit "Junie task 0N"
```

1. **Guidelines as the contract.** `.junie/guidelines.md` is loaded automatically in every Junie session. It holds the rules that must never drift: original IP only (no Riot names or art, no team logos), no backend and no API keys, no asset files (canvas plus Web Audio only), a pure deterministic `src/core/` with no `Math.random()` or `Date.now()`, and "`npm test` and `npm run build` must pass". Because those rules lived in the guidelines, every task prompt could stay focused on the change it was asking for.
2. **One milestone per headless task.** Each prompt was a numbered list of concrete, checkable requirements. Junie worked through them, ran the gates and printed a `TASK RESULT` summary. That summary is at the end of each transcript.
3. **Playtest, then prompt.** After every task the build ran in headless Chromium. I looked at the screenshots and logged state, and every problem found became an item in the next prompt, written as an observed symptom rather than as a fix.

## The tasks

| # | Prompt focus | What Junie delivered | Tests after |
|---|---|---|---|
| 01 | Scaffold + pure core | Vite/TS/vitest scaffold; `rng`, `stack` (chop math, perfect snap, grow-back), `layers`, `scoring`, `round` state machine, `leaderboard`, `initials`, `attract` bot; 8 test files | 24 |
| 02 | Make it playable | Unified input (keyboard, touch, Gamepad API) with pure tested routing, Web Audio synth (SFX + procedural music), DPR-aware canvas renderer, all screens, fixed-timestep loop | 27 |
| 03 | Playtest fixes + booth features | Fixed HUD over the title, invisible demo tower, overlapping UI, muddy colours; added aim guide, alternating entry, kiosk mode, per-event boards, 2P duel (`duel.ts`), operator panel, reduced motion | 33 |
| 04 | Second playtest pass | Result-screen input lockout (players were mashing past their score), dimmed attract and rotating cards, demo bot tuned with a 5-seed 60 s simulation test, Cloud Nine celebration, `?test=1` hook | 37 |
| 05 | **Bug: game froze after a miss** | Confirmed the root cause (edge-triggered `oldPhase !== 'over'` check missed when the miss happened in the input handler), replaced it with a pure level-triggered `flow.ts` plus regression tests | 46 |
| 06 | Arcade-button initials | Space/Enter tap-vs-hold via keydown/keyup timing (USB arcade encoders send keys), active slot highlight, 15 s auto-save, longer game-over lockout | 51 |
| 07 | Result-screen layout | Hid the HUD on result screens, panel layout, reason-specific game-over (TOWER TOPPLED! / TIME!), big top-10 rows with rank accents, inline SVG favicon and meta tags | 51 |
| review | `junie --review` over all task commits | Junie's review mode (with delegated read-only audits) found 3 real issues: `?event=constructor` crashed the leaderboard (prototype key), O/M could not be typed as initials because they were global shortcuts, and a released wake lock was never re-acquired. It confirmed the first with a temporary failing test | — |
| 08 | Fix the review findings | Prototype-safe leaderboard maps, pure `keyboard-shortcuts.ts` dispatch that yields to initials typing, wake-lock release handling with rate-limited re-acquire, plus regression tests | 56 |

## Four moments that show the workflow

**1. A freeze that only a real playthrough could find.** Every unit test was green after task 04, but the headless smoke test kept pressing Space and saw `window.__skyline` stuck on `{screen:'play', floors:4, timeRemaining:57.37}` forever. The prompt for task 05 gave Junie the reproduction and a suspected cause and asked it to *verify* that cause before fixing anything. Junie confirmed it, moved screen routing into a pure function that decides from the current state on every tick, added regression tests (miss, time-up, duel one-out/both-out, side effects firing exactly once), and kept edge detection only for audio cues, where it is harmless. The smoke test then went attract → countdown → play → game over → initials → leaderboard without a hitch.

**2. Designing for the booth, not the desk.** Several fixes came from thinking about real hardware. Arcade buttons usually reach the PC as a USB keyboard encoder sending Space or Enter, and the first initials screen only accepted tap/hold from touch or gamepad. Task 06 asked for keydown/keyup hold timing that ignores auto-repeat, so a single physical button can spell a name. Button-mashers were skipping their own score, so a result-screen lockout was added with a visible progress line and pure tests behind it.

**3. The agent reviewed its own work.** After seven build tasks, `junie --review` audited every Junie commit for booth-day failure modes. It found three issues no human playtest had hit, including a crash on `?event=constructor`, proved that one with a temporary failing test, and left the tree clean. Task 08 fed the review verdict straight back to Junie, which fixed all three with regression tests (51 → 56 tests).

**4. Determinism made the AI verifiable.** Because the guidelines kept `src/core` free of `Math.random()` and `Date.now()`, Junie could write tests like "simulate a full 60 s demo round at 1/120 s steps for seeds 1..5 and assert the bot averages at least 30 floors." That turned "make the attract mode look good" into a checkable requirement and let Junie verify its own tuning.

## Numbers

| Metric | Value |
|---|---|
| Junie headless runs | 8 build/fix tasks + 1 `junie --review` run |
| Model reported by Junie | `junie-lite/gpt-6-luna` (Junie Lite, free tier) |
| Reported cost per session | 0.0 |
| Output tokens across tasks | ≈281k output tokens, ≈304k uncached input tokens, ≈10.6M cached input tokens (from Junie session summaries) |
| Source / test files | 18 / 14 |
| Unit tests | 56 passing |
| Lines of TypeScript (src + tests) | ≈3,450 (2,802 src + 650 tests) |

## What I learned

- **Put invariants in guidelines and changes in prompts.** Once purity, no assets and the IP rules were in `guidelines.md`, I never had to repeat them, and Junie never broke them.
- **Report symptoms, ask for verification.** "Here is what the player saw; verify this suspected cause" produced better fixes than "change line X", because Junie looked for the whole class of bug (task 05 also hardened the duel and time-up paths).
- **Give the agent a gate it can run.** `npm test && npm run build` was in every definition of done. Junie ran both on every task and fixed what failed before reporting.
- **Agents don't see pixels; screenshots do.** Junie can't look at the canvas in a headless shell (it said so in task 06), so visual QA stayed outside the agent and came back as written findings. A browser-capable agent setup would close this gap.

## Honest limits

- Junie Lite is the free tier. Its model is chosen by JetBrains (`junie-lite/gpt-6-luna`) and isn't selectable on this plan.
- The JetBrains IDE (Rider, WebStorm) wasn't used, because the environment was a headless Linux arm64 sandbox. The `.junie/` folder is the IDE-agnostic evidence.
- Prompts, guidelines, QA scripts and these docs were written by the entrant with the help of a general-purpose AI assistant. Junie wrote the game code. The transcripts let anyone check that line.
