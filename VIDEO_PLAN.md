# Demo video plan — Skyline Stack (target 2:30, hard limit < 3:00)

No voice-over. Everything is told with on-screen captions (burned-in, large, white on a dark bar) over screen recordings of the live build. Audio = the game's own code-generated sound effects and music only (no third-party music, no logos, no trademarks besides plain-text mentions).

Recording setup
- Live URL: https://song11071696.github.io/cloud9-minigame/ (Chrome, 1920x1080, fullscreen). Add `?seed=9` for repeatable towers; `?duel=1` for the duel segment; `?kiosk=1&event=demo` for the kiosk segment.
- Capture with OBS (or `npx playwright` video for the attract/demo-bot shots); terminal shots of Junie CLI from the real session transcripts in `.junie/sessions/`.
- Export 1080p30 MP4, upload to YouTube as Public (the user does this step; not done by the build agent).

| # | Time | Picture | Caption (burned in) |
|---|------|---------|---------------------|
| 1 | 0:00–0:08 | Attract screen, demo bot climbing, title card | "Skyline Stack — a 60-second, one-button tower game for the Cloud9 booth." |
| 2 | 0:08–0:18 | Booth problem montage: text cards | "Booth games must be learned in 3 seconds, played in 60, and survive 1,000 strangers a day." |
| 3 | 0:18–0:40 | Single player round: countdown → first drops → PERFECT x3 grows block back | "One button: TAP to drop. Overhang is sliced off. PERFECT x3 grows it back." |
| 4 | 0:40–0:58 | Climbing through layers: Low Haze → stratosphere → stars; layer banners | "Break through nine sky layers. Each one is faster, windier, and changes the sky." |
| 5 | 0:58–1:08 | Reach floor 48: CLOUD NINE banner + confetti | "Reach Cloud Nine before the 60-second clock runs out." |
| 6 | 1:08–1:22 | Game over → one-button initials entry (tap = next letter, hold = confirm) → leaderboard highlight | "Top-10 board with arcade initials — entered with the same single button." |
| 7 | 1:22–1:40 | Duel: two players side by side, same seed, one goes OUT, winner banner | "Head-to-head duel on one screen: same tower, same wind, A vs L or left vs right half of a touchscreen." |
| 8 | 1:40–1:52 | Kiosk: `?kiosk=1&event=demo`, tablet viewport, idle → back to attract, operator panel (hold O 3 s) | "Kiosk mode: no cursor, no zoom, wake-lock, idle reset, per-event leaderboards, operator panel." |
| 9 | 1:52–2:00 | Gamepad + touch + keyboard icons card | "Keyboard, touchscreen or any gamepad. Zero backend. Works offline. All art and sound generated in code." |
| 10 | 2:00–2:25 | Terminal: `junie` headless run from `.junie/sessions/task-0X-*.md`, `.junie/guidelines.md`, tests passing, git log of Junie task commits | "Built with JetBrains Junie CLI: guidelines → 8 headless Junie tasks + junie --review → playtest screenshots fed back as the next task → vitest + build gates." |
| 11 | 2:25–2:35 | `npm test` green (56 tests), GitHub repo, live URL | "Open source (MIT). Play it now: song11071696.github.io/cloud9-minigame" |

Caption style: 64 px bold sans, max 2 lines, on screen ≥ 2.5 s per line. Keep total runtime ≤ 2:40.
