# Junie CLI session — Task 04: second playtest polish (lockout, attract cards, demo bot, Cloud Nine moment, smoke-test hook)

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-041849-1gnw

## Prompt given to Junie

```text
Read .junie/guidelines.md and the current code. Do TASK 4 of Skyline Stack: second playtest polish pass. Problems seen in headless-browser playtests:
1. Accidental skipping: at the booth people mash the button. A press on GAME OVER immediately jumps on, and the next press starts a new round, so players never see their result (reproduced in duel: both players out -> next press -> attract -> next press -> new countdown). Add an input lockout of 1.2 s on GAME OVER, duel result and LEADERBOARD screens (show a thin progress line that fills during the lockout), and on duel result return to ATTRACT automatically after 6 s. Put the lockout rule in a pure helper and unit-test it.
2. ATTRACT legibility: the demo tower is drawn bright, directly behind the title text. Draw the demo world dimmed (about 45% opacity or a dark veil) and put a soft translucent rounded panel behind the title block.
3. ATTRACT content: cycle three cards every 6 s: (a) title card, (b) leaderboard card — if empty show 'NO SCORES YET · BE THE FIRST', (c) 'HOW TO PLAY' card with three steps drawn with simple canvas icons: 1 'TAP to drop the block', 2 'Line it up — overhang is sliced off', 3 'PERFECT x3 grows it back · reach CLOUD NINE in 60 s'. Small footer text on all attract cards: 'Made for the Cloud9 booth · Built with JetBrains Junie' (plain text only, no logos).
4. The demo bot is too sloppy: the tower thins out within ~10 floors, so attract never shows the higher sky layers. Tune src/core/attract.ts so that with a fixed seed it usually lands 70%+ perfect drops and reaches layer 6 or higher within 60 s, while still making occasional seeded small mistakes. Add a deterministic vitest that simulates a full 60 s demo round at 1/120 s steps for seeds 1..5 and asserts the bot reaches at least floor 30 on average.
5. CLOUD NINE moment: when a player reaches floor 48, show a golden full-width 'CLOUD NINE!' banner with a confetti burst (reduced-motion: no confetti, banner only) and play the fanfare; keep playing afterwards (blocks keep stacking on the golden layer until time runs out).
6. Add `?test=1`: expose a read-only `window.__skyline` getter returning { screen, floors, score, layer, timeRemaining, duel } for automated smoke tests. No effect without the param.
7. Run `npm test` and `npm run build` until both pass. Do not commit. Do not create files outside this directory.
```

## Junie transcript (verbatim export)

# Session transcript

### Searched tests/**/*

```text
tests/attract.test.ts
tests/duel.test.ts
tests/initials.test.ts
tests/inputmap.test.ts
tests/kiosk.test.ts
tests/layers.test.ts
tests/leaderboard.test.ts
tests/rng.test.ts
tests/round.test.ts
tests/scoring.test.ts
tests/stack.test.ts
```

### Searched src/**/*.ts

```text
src/audio/synth.ts
src/core/attract.ts
src/core/duel.ts
src/core/initials.ts
src/core/inputmap.ts
src/core/kiosk.ts
src/core/layers.ts
src/core/leaderboard.ts
src/core/rng.ts
src/core/round.ts
src/core/scoring.ts
src/core/stack.ts
src/input/input.ts
src/main.ts
src/render/renderer.ts
```

### Ran git status --short

```text
The working tree is clean, with no pending changes.
```

### Read .junie/guidelines.md

### Read package.json

### Read src/core/attract.ts

### Read src/main.ts [1-520]

### Read src/core/round.ts

### Read src/render/renderer.ts [1-550]

### Read src/core/layers.ts

### Read tests/attract.test.ts

### Read src/core/duel.ts

### Read src/audio/synth.ts

### Read tests/round.test.ts

### Read src/core/stack.ts

### Searched RendererScene|drawScreen\(|requestAnimationFrame|setInterval|cloud|confetti|leaderboardIndex

```text
src/core/layers.ts [17—26]
src/core/round.ts [28—32]
src/core/round.ts [62—66]
src/core/round.ts [90—94]
src/core/round.ts [103—107]
src/core/scoring.ts [2—6]
src/core/scoring.ts [8—12]
src/core/scoring.ts [16—20]
src/core/scoring.ts [31—35]
src/core/scoring.ts [43—47]
src/main.ts [16—20]
src/main.ts [513—517]
src/main.ts [521—525]
src/main.ts [529—533]
src/main.ts [540—544]
src/main.ts [561—565]
src/main.ts [606—610]
src/render/renderer.ts [22—26]
src/render/renderer.ts [33—37]
src/render/renderer.ts [86—90]
src/render/renderer.ts [97—101]
src/render/renderer.ts [112—116]
src/render/renderer.ts [118—122]
src/render/renderer.ts [166—170]
src/render/renderer.ts [211—215]
src/render/renderer.ts [278—282]
src/render/renderer.ts [290—299]
src/render/renderer.ts [385—389]
src/render/renderer.ts [431—435]
src/render/renderer.ts [446—450]
src/render/renderer.ts [457—461]
src/render/renderer.ts [473—477]
src/render/renderer.ts [500—504]
src/render/renderer.ts [524—528]
src/render/renderer.ts [556—560]
src/render/renderer.ts [563—567]
```

### Read src/render/renderer.ts [350-604]

### Read src/core/rng.ts

### Read tests/stack.test.ts

### Read src/main.ts [505-613]

### Read tsconfig.json

### Edited tests/attract.test.ts +31

#### tests/attract.test.ts

```diff
--- a/tests/attract.test.ts
+++ b/tests/attract.test.ts
@@ -5,6 +5,7 @@
   updateAttract,
   updateDemoBot,
 } from '../src/core/attract';
+import { createRound, pressRound, ROUND_SECONDS, updateRound } from '../src/core/round';
 
 describe('attract mode helpers', () => {
   it('enters attract after idling and resets the timer on activity', () => {

@@ -25,4 +26,34 @@
     expect(first.shouldPress).toBe(true);
     expect(first.bot.attempts).toBe(1);
   });
+
+  it('builds a tall tower with mostly perfect drops across fixed 60-second demos', () => {
+    const results = [1, 2, 3, 4, 5].map((seed) => {
+      let round = pressRound(createRound(seed));
+      let bot = createDemoBot(seed);
+      let perfectDrops = 0;
+      let landedDrops = 0;
+      const step = 1 / 120;
+
+      for (let elapsed = 0; elapsed < ROUND_SECONDS + 3; elapsed += step) {
+        round = updateRound(round, step);
+        if (round.phase !== 'playing' || !round.movingBlock) continue;
+        const target = round.blocks[round.blocks.length - 1]!;
+        const decision = updateDemoBot(bot, round.movingBlock, target);
+        bot = decision.bot;
+        if (!decision.shouldPress) continue;
+        const previousFloors = round.floors;
+        round = pressRound(round);
+        if (round.floors > previousFloors) {
+          landedDrops += 1;
+          if (round.combo > 0) perfectDrops += 1;
+        }
+      }
+
+      return { floors: round.floors, perfectRate: landedDrops ? perfectDrops / landedDrops : 0 };
+    });
+
+    expect(results.reduce((sum, result) => sum + result.floors, 0) / results.length).toBeGreaterThanOrEqual(30);
+    expect(results.every((result) => result.perfectRate >= 0.7)).toBe(true);
+  });
 });
```

### Failed to run npm test -- tests/attract.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/attract.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame

 ❯ tests/attract.test.ts (3 tests | 1 failed) 24ms
     × builds a tall tower with mostly perfect drops across fixed 60-second demos 20ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/attract.test.ts > attract mode helpers > builds a tall tower with mostly perfect drops across fixed 60-second demos
AssertionError: expected 27.4 to be greater than or equal to 30
 ❯ tests/attract.test.ts:56:86
     54|     });
     55|
     56|     expect(results.reduce((sum, result) => sum + result.floors, 0) / r…
       |                                                                                      ^
     57|     expect(results.every((result) => result.perfectRate >= 0.7)).toBe(…
     58|   });

 Test Files  1 failed (1)
      Tests  1 failed | 2 passed (3)

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

   Start at  04:19:47
   Duration  367ms (transform 76ms, setup 0ms, import 109ms, tests 24ms, environment 0ms)
```

### Edited 3 files

#### src/core/screen-lockout.ts

```diff
--- a/src/core/screen-lockout.ts
+++ b/src/core/screen-lockout.ts
@@ -1,0 +1,18 @@
+export const SCREEN_INPUT_LOCKOUT_SECONDS = 1.2;
+
+export function getScreenLockoutProgress(
+  elapsed: number,
+  duration = SCREEN_INPUT_LOCKOUT_SECONDS,
+): number {
+  const safeElapsed = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
+  const safeDuration = Math.max(0, Number.isFinite(duration) ? duration : 0);
+  if (safeDuration === 0) return 1;
+  return Math.min(1, safeElapsed / safeDuration);
+}
+
+export function isScreenInputLocked(
+  elapsed: number,
+  duration = SCREEN_INPUT_LOCKOUT_SECONDS,
+): boolean {
+  return getScreenLockoutProgress(elapsed, duration) < 1;
+}
```

#### tests/screen-lockout.test.ts

```diff
--- a/tests/screen-lockout.test.ts
+++ b/tests/screen-lockout.test.ts
@@ -1,0 +1,19 @@
+import { describe, expect, it } from 'vitest';
+import { getScreenLockoutProgress, isScreenInputLocked } from '../src/core/screen-lockout';
+
+describe('screen input lockout', () => {
+  it('locks input until the duration elapses and reports fill progress', () => {
+    expect(isScreenInputLocked(0)).toBe(true);
+    expect(getScreenLockoutProgress(0.6)).toBe(0.5);
+    expect(isScreenInputLocked(1.199)).toBe(true);
+    expect(isScreenInputLocked(1.2)).toBe(false);
+    expect(getScreenLockoutProgress(2)).toBe(1);
+  });
+
+  it('handles invalid and zero-duration timing safely', () => {
+    expect(getScreenLockoutProgress(Number.NaN)).toBe(0);
+    expect(getScreenLockoutProgress(-1)).toBe(0);
+    expect(getScreenLockoutProgress(0, 0)).toBe(1);
+    expect(isScreenInputLocked(Number.POSITIVE_INFINITY)).toBe(true);
+  });
+});
```

#### src/core/attract.ts

```diff
--- a/src/core/attract.ts
+++ b/src/core/attract.ts
@@ -2,9 +2,9 @@
 import type { Block } from './stack';
 
 export const DEFAULT_IDLE_SECONDS = 20;
-export const BOT_NEAR_PERFECT_TOLERANCE = 2;
-export const BOT_MISTAKE_TOLERANCE = 5;
-const BOT_MISTAKE_CHANCE = 0.12;
+export const BOT_NEAR_PERFECT_TOLERANCE = 1.5;
+export const BOT_MISTAKE_TOLERANCE = 2.6;
+const BOT_MISTAKE_CHANCE = 0.045;
 
 export interface AttractState {
   idleSeconds: number;
```

### Ran npm test -- tests/attract.test.ts tests/screen-lockout.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/attract.test.ts tests/screen-lockout.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  2 passed (2)
      Tests  5 passed (5)
   Start at  04:20:02
   Duration  596ms (transform 77ms, setup 0ms, import 129ms, tests 30ms, environment 0ms)
```

```text
Both targeted test files passed, with all 5 tests successful.
```

### Read index.html

### Read src/main.ts [208-480]

### Read tests/kiosk.test.ts

### Read src/input/input.ts

### Edited 2 files

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -4,6 +4,7 @@
 import { getDuelOutcome, type DuelWinner } from './core/duel';
 import { shouldReturnToAttract } from './core/kiosk';
 import { nextRandom } from './core/rng';
+import { getScreenLockoutProgress, isScreenInputLocked } from './core/screen-lockout';
 import {
   createRound,
   getRoundSnapshot,

@@ -104,6 +105,8 @@
 let inputActivity = false;
 let wakeLock: { release: () => Promise<void> } | null = null;
 let kioskGestureStarted = false;
+let cloudNineAge = -1;
+let cloudNinePlayer: 0 | 1 | null = null;
 
 function getEntries(): LeaderboardEntry[] {
   return board.get(eventKey);

@@ -128,6 +131,8 @@
   perfectText = '';
   perfectAge = -1;
   layerFlash = 0;
+  cloudNineAge = -1;
+  cloudNinePlayer = null;
   debris = [];
   candidateEntry = null;
   highlightedEntry = null;

@@ -137,11 +142,6 @@
 
 function enterResults(): void {
   screenElapsed = 0;
-  if (duelSession) {
-    duelSession = false;
-    screen = 'attract';
-    return;
-  }
   if (candidateEntry) {
     initials = createInitialsState();
     screen = 'initials';

@@ -151,6 +151,14 @@
   }
 }
 
+function returnToAttract(): void {
+  screen = 'attract';
+  screenElapsed = 0;
+  duelSession = false;
+  duelWinner = null;
+  candidateEntry = null;
+}
+
 function saveInitials(): void {
   if (!initials.complete || screen !== 'initials') return;
   const entry: LeaderboardEntry = {

@@ -295,6 +303,11 @@
   } else {
     perfectAge = -1;
   }
+  if (!activeRound.reachedCloudNine && updated.reachedCloudNine) {
+    cloudNineAge = 0;
+    cloudNinePlayer = player;
+    audio.cloudNine();
+  }
   if (updated.layerBreaks > activeRound.layerBreaks && !reducedMotion) {
     layerFlash = 0.8;
     audio.layerBreak(getRoundSnapshot(updated).layer);

@@ -320,10 +333,9 @@
     return;
   }
   if (screen === 'game-over') {
+    if (isScreenInputLocked(screenElapsed)) return;
     if (duelSession) {
-      duelSession = false;
-      screen = 'attract';
-      screenElapsed = 0;
+      returnToAttract();
       return;
     }
     enterResults();

@@ -330,9 +342,8 @@
     return;
   }
   if (screen === 'leaderboard') {
-    if (event.player !== 0) return;
-    screen = 'attract';
-    screenElapsed = 0;
+    if (event.player !== 0 || isScreenInputLocked(screenElapsed)) return;
+    returnToAttract();
     return;
   }
   if (screen === 'initials' && event.player === 0 && event.source !== 'keyboard') {

@@ -485,14 +496,21 @@
   elapsed += dt;
   screenElapsed += dt;
   perfectAge = perfectAge < 0 ? perfectAge : perfectAge + dt;
+  if (cloudNineAge >= 0) {
+    cloudNineAge += dt;
+    if (cloudNineAge >= 3.5) {
+      cloudNineAge = -1;
+      cloudNinePlayer = null;
+    }
+  }
   layerFlash = Math.max(0, layerFlash - dt);
   debris = debris.map((piece) => ({ ...piece, age: piece.age + dt })).filter((piece) => piece.age < 1.4);
   if (screen === 'attract') updateDemo(dt);
   updateRoundState(dt);
-  if (screen === 'game-over' && screenElapsed >= 8) enterResults();
+  if (screen === 'game-over' && duelSession && screenElapsed >= 6) returnToAttract();
+  else if (screen === 'game-over' && screenElapsed >= 8) enterResults();
   if (screen === 'leaderboard' && screenElapsed >= 10) {
-    screen = 'attract';
-    screenElapsed = 0;
+    returnToAttract();
   }
   if (kioskMode) {
     if (inputActivity) kioskIdleSeconds = 0;

@@ -551,11 +569,35 @@
     duelRounds: duelSession ? [getRoundSnapshot(round), getRoundSnapshot(duelRound)] : null,
     duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
     duelWinner,
+    lockoutProgress: screen === 'game-over' || screen === 'leaderboard'
+      ? getScreenLockoutProgress(screenElapsed)
+      : 1,
+    cloudNineAge,
+    cloudNinePlayer,
     operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
   };
   renderer.render(scene, dt);
 }
 
+if (params.get('test') === '1') {
+  Object.defineProperty(window, '__skyline', {
+    configurable: false,
+    enumerable: true,
+    get: () => {
+      const state = screen === 'attract' ? demoRound : round;
+      const snapshot = getRoundSnapshot(state);
+      return Object.freeze({
+        screen,
+        floors: snapshot.floors,
+        score: snapshot.score,
+        layer: snapshot.layer,
+        timeRemaining: snapshot.timeRemaining,
+        duel: duelSession,
+      });
+    },
+  });
+}
+
 let lastFrame = 0;
 let accumulator = 0;
```

#### src/audio/synth.ts

```diff
--- a/src/audio/synth.ts
+++ b/src/audio/synth.ts
@@ -109,6 +109,15 @@
     });
   }
 
+  cloudNine(): void {
+    [523, 659, 784, 1047, 1319].forEach((frequency, index) => {
+      this.tone(frequency, 0.58, 'sine', 0.2, index * 0.13);
+    });
+    [392, 523, 659].forEach((frequency, index) => {
+      this.tone(frequency, 0.72, 'triangle', 0.12, 0.18 + index * 0.12);
+    });
+  }
+
   update(dt: number, layer: number, musicEnabled: boolean): void {
     if (!musicEnabled || this.muted || !this.context) return;
     this.musicElapsed += dt;
```

### Edited src/render/renderer.ts +147 -15

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -44,6 +44,9 @@
   duelRounds: readonly [RoundSnapshot, RoundSnapshot] | null;
   duelOut: readonly [boolean, boolean];
   duelWinner: DuelWinner | null;
+  lockoutProgress: number;
+  cloudNineAge: number;
+  cloudNinePlayer: 0 | 1 | null;
   operator: { open: boolean; confirmClear: boolean; selected: number; version: string };
 }
 

@@ -111,6 +114,7 @@
 
     if (scene.perfectAge >= 0 && scene.perfectAge < 1.15) this.drawPerfect(scene, minSide);
     if (!scene.reducedMotion && scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
+    if (scene.cloudNineAge >= 0) this.drawCloudNineMoment(scene, minSide);
     this.drawScreen(scene, minSide);
     if (scene.operator.open) this.drawOperatorPanel(scene, minSide);
   }

@@ -456,6 +460,35 @@
     ctx.restore();
   }
 
+  private drawCloudNineMoment(scene: RendererScene, minSide: number): void {
+    const ctx = this.context;
+    const age = scene.cloudNineAge;
+    if (!scene.reducedMotion) {
+      const colors = ['#fff0a8', '#ffcf5a', '#8de8ff', '#ffffff', '#b6a2ff'];
+      for (let index = 0; index < 56; index += 1) {
+        const angle = index * 2.399;
+        const speed = minSide * (0.19 + (index * 17 % 11) * 0.012);
+        const x = this.width / 2 + Math.cos(angle) * speed * age;
+        const y = this.height * 0.4 + Math.sin(angle) * speed * age + age * age * minSide * 0.12;
+        if (x < -12 || x > this.width + 12 || y < -12 || y > this.height + 12) continue;
+        ctx.save();
+        ctx.globalAlpha = Math.max(0, 1 - age / 3.5);
+        ctx.fillStyle = colors[index % colors.length]!;
+        ctx.translate(x, y);
+        ctx.rotate(angle + age * (index % 2 === 0 ? 2 : -2));
+        ctx.fillRect(-minSide * 0.006, -minSide * 0.012, minSide * 0.012, minSide * 0.024);
+        ctx.restore();
+      }
+    }
+    ctx.save();
+    ctx.fillStyle = '#8c5b12ee';
+    ctx.fillRect(0, this.height * 0.34, this.width, this.height * 0.14);
+    ctx.fillStyle = '#ffe08a';
+    ctx.fillRect(0, this.height * 0.34, this.width, Math.max(3, minSide * 0.006));
+    this.text('CLOUD NINE!', this.width / 2, this.height * 0.41, Math.max(32, minSide * 0.105), 'center', '#fff5c2');
+    ctx.restore();
+  }
+
   private drawScreen(scene: RendererScene, minSide: number): void {
     const ctx = this.context;
     const centerX = this.width / 2;

@@ -465,21 +498,11 @@
     if (scene.screen === 'play') return;
 
     ctx.save();
-    ctx.fillStyle = scene.screen === 'attract' ? '#111a3450' : '#111a34bd';
+    ctx.fillStyle = scene.screen === 'attract' ? '#07112699' : '#111a34bd';
     ctx.fillRect(0, 0, this.width, this.height);
 
     if (scene.screen === 'attract') {
-      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, this.height * 0.065, Math.max(13, minSide * 0.025), 'center', '#e7f5ff');
-      this.text('DEMO', this.width * 0.93, this.height * 0.12, Math.max(14, minSide * 0.03), 'center', '#ffe8a6');
-      this.text('SKYLINE STACK', centerX, centerY - minSide * 0.12, big, 'center', '#fff8e4');
-      this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.02, medium, 'center', '#d2f3ff');
-      const blink = scene.reducedMotion || Math.sin(scene.elapsed * 3.2) > -0.15;
-      if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.1, medium, 'center', '#ffe8a6');
-      this.text(scene.duelMode ? 'DUEL MODE · P1 LEFT / P2 RIGHT' : '60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, this.height * 0.84, Math.max(13, medium * 0.62), 'center', '#ffffff');
-      this.drawLeaderboard(scene, minSide, centerY + minSide * 0.24, false);
-      if (scene.todayBest) {
-        this.text(`TODAY'S BEST  ${scene.todayBest.initials} · ${scene.todayBest.score.toLocaleString()}`, centerX, centerY + minSide * 0.31, Math.max(14, minSide * 0.031), 'center', '#ffe8a6');
-      }
+      this.drawAttractCard(scene, minSide, centerX, centerY, big, medium);
     } else if (scene.screen === 'countdown') {
       const countdown = Math.max(1, Math.ceil(scene.round.countdownRemaining));
       this.text(countdown.toString(), centerX, centerY + big * 0.35, big * 2.2, 'center', '#fff5ce');

@@ -503,7 +526,11 @@
         ];
         rows.forEach((row, index) => this.text(row, centerX, centerY + minSide * (index * 0.065), Math.max(15, medium * 0.78), 'center'));
       }
-      this.text('PRESS TO CONTINUE', centerX, centerY + minSide * 0.23, medium * 0.8, 'center', '#ffe8a6');
+      const prompt = scene.lockoutProgress < 1
+        ? 'PLEASE WAIT'
+        : scene.duelRounds ? 'PRESS TO RETURN · AUTO IN 6s' : 'PRESS TO CONTINUE';
+      this.text(prompt, centerX, centerY + minSide * 0.23, medium * 0.8, 'center', '#ffe8a6');
+      this.drawLockoutProgress(scene.lockoutProgress, minSide);
     } else if (scene.screen === 'initials') {
       this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');
       this.text(scene.initials.split('').join('  '), centerX, centerY + minSide * 0.01, big * 1.35, 'center');

@@ -518,11 +545,116 @@
       this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
       this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.25, Math.max(13, minSide * 0.024), 'center', '#e7f5ff');
       this.drawLeaderboard(scene, minSide, centerY - minSide * 0.19, true);
-      this.text('PRESS TO PLAY AGAIN', centerX, this.height - minSide * 0.12, medium * 0.82, 'center', '#ffe8a6');
+      this.text(scene.lockoutProgress < 1 ? 'PLEASE WAIT' : 'PRESS TO PLAY AGAIN', centerX, this.height - minSide * 0.12, medium * 0.82, 'center', '#ffe8a6');
+      this.drawLockoutProgress(scene.lockoutProgress, minSide);
     }
     ctx.restore();
   }
 
+  private drawAttractCard(
+    scene: RendererScene,
+    minSide: number,
+    centerX: number,
+    centerY: number,
+    big: number,
+    medium: number,
+  ): void {
+    const ctx = this.context;
+    const card = Math.floor(scene.elapsed / 6) % 3;
+    const panelWidth = this.width * 0.86;
+    const panelHeight = this.height * 0.68;
+    const panelTop = this.height * 0.16;
+    ctx.save();
+    ctx.fillStyle = '#08152de0';
+    ctx.strokeStyle = '#f6d88c88';
+    ctx.lineWidth = Math.max(2, minSide * 0.003);
+    ctx.beginPath();
+    ctx.roundRect(centerX - panelWidth / 2, panelTop, panelWidth, panelHeight, Math.max(12, minSide * 0.035));
+    ctx.fill();
+    ctx.stroke();
+    this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, this.height * 0.065, Math.max(14, minSide * 0.027), 'center', '#e7f5ff');
+    this.text('DEMO', this.width * 0.93, this.height * 0.12, Math.max(16, minSide * 0.032), 'center', '#ffe8a6');
+
+    if (card === 0) {
+      this.text('SKYLINE STACK', centerX, centerY - minSide * 0.14, big, 'center', '#fff8e4');
+      this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.015, medium, 'center', '#d2f3ff');
+      const blink = scene.reducedMotion || Math.sin(scene.elapsed * 3.2) > -0.15;
+      if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.13, medium, 'center', '#ffe8a6');
+      this.text(scene.duelMode ? 'DUEL MODE · P1 LEFT / P2 RIGHT' : '60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, centerY + minSide * 0.27, Math.max(14, medium * 0.62), 'center');
+    } else if (card === 1) {
+      this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.3, Math.max(28, big * 0.72), 'center', '#fff2ac');
+      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.23, Math.max(14, minSide * 0.026), 'center', '#e7f5ff');
+      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.15, true);
+      this.text('TAP TO TAKE YOUR PLACE', centerX, centerY + minSide * 0.31, Math.max(14, medium * 0.64), 'center', '#ffe8a6');
+    } else {
+      this.text('HOW TO PLAY', centerX, centerY - minSide * 0.29, Math.max(30, big * 0.72), 'center', '#fff2ac');
+      const rows = [
+        { y: centerY - minSide * 0.1, text: 'TAP to drop the block', icon: 0 },
+        { y: centerY + minSide * 0.08, text: 'Line it up — overhang is sliced off', icon: 1 },
+        { y: centerY + minSide * 0.26, text: 'PERFECT x3 grows it back · reach CLOUD NINE in 60 s', icon: 2 },
+      ];
+      for (const row of rows) {
+        this.drawHowToIcon(centerX - minSide * 0.32, row.y, minSide, row.icon);
+        this.text(row.text, centerX - minSide * 0.23, row.y, Math.max(16, minSide * 0.036), 'left', '#f4f8ff');
+      }
+    }
+    this.text('Made for the Cloud9 booth · Built with JetBrains Junie', centerX, this.height * 0.94, Math.max(13, minSide * 0.024), 'center', '#ffffff');
+    ctx.restore();
+  }
+
+  private drawHowToIcon(x: number, y: number, minSide: number, icon: number): void {
+    const ctx = this.context;
+    const size = minSide * 0.07;
+    ctx.save();
+    ctx.strokeStyle = '#ffe8a6';
+    ctx.fillStyle = '#a9e3ed';
+    ctx.lineWidth = Math.max(3, minSide * 0.006);
+    ctx.lineCap = 'round';
+    ctx.lineJoin = 'round';
+    if (icon === 0) {
+      ctx.fillRect(x - size * 0.48, y + size * 0.2, size * 0.96, size * 0.22);
+      ctx.strokeRect(x - size * 0.34, y - size * 0.3, size * 0.68, size * 0.34);
+      ctx.beginPath();
+      ctx.moveTo(x, y - size * 0.62);
+      ctx.lineTo(x, y - size * 0.4);
+      ctx.lineTo(x - size * 0.12, y - size * 0.52);
+      ctx.moveTo(x, y - size * 0.4);
+      ctx.lineTo(x + size * 0.12, y - size * 0.52);
+      ctx.stroke();
+    } else if (icon === 1) {
+      ctx.strokeRect(x - size * 0.5, y - size * 0.12, size, size * 0.34);
+      ctx.beginPath();
+      ctx.moveTo(x - size * 0.42, y - size * 0.42);
+      ctx.lineTo(x + size * 0.42, y - size * 0.42);
+      ctx.moveTo(x, y - size * 0.32);
+      ctx.lineTo(x, y + size * 0.34);
+      ctx.stroke();
+    } else {
+      ctx.fillRect(x - size * 0.5, y + size * 0.22, size, size * 0.22);
+      ctx.beginPath();
+      for (let point = 0; point < 8; point += 1) {
+        const angle = -Math.PI / 2 + point * Math.PI / 4;
+        const radius = point % 2 === 0 ? size * 0.47 : size * 0.2;
+        const pointX = x + Math.cos(angle) * radius;
+        const pointY = y - size * 0.12 + Math.sin(angle) * radius;
+        if (point === 0) ctx.moveTo(pointX, pointY);
+        else ctx.lineTo(pointX, pointY);
+      }
+      ctx.closePath();
+      ctx.stroke();
+    }
+    ctx.restore();
+  }
+
+  private drawLockoutProgress(progress: number, minSide: number): void {
+    const ctx = this.context;
+    const height = Math.max(4, minSide * 0.007);
+    ctx.fillStyle = '#ffffff55';
+    ctx.fillRect(0, this.height - height, this.width, height);
+    ctx.fillStyle = '#ffe08a';
+    ctx.fillRect(0, this.height - height, this.width * Math.max(0, Math.min(1, progress)), height);
+  }
+
   private drawOperatorPanel(scene: RendererScene, minSide: number): void {
     const ctx = this.context;
     const centerX = this.width / 2;

@@ -558,7 +690,7 @@
   private drawLeaderboard(scene: RendererScene, minSide: number, startY: number, full: boolean): void {
     const ctx = this.context;
     if (!scene.leaderboard.length) {
-      this.text('BE THE FIRST ON THE BOARD', this.width / 2, startY + minSide * 0.035, Math.max(14, minSide * 0.035), 'center');
+      this.text('NO SCORES YET · BE THE FIRST', this.width / 2, startY + minSide * 0.035, Math.max(14, minSide * 0.035), 'center');
       return;
     }
     const count = full ? Math.min(10, scene.leaderboard.length) : 1;
```

### Read src/main.ts [107-650]

### Read src/render/renderer.ts [460-580]

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 21 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.41 kB
dist/assets/index-DTBORsLg.js  40.16 kB │ gzip: 14.72 kB

✓ built in 110ms
```

```text
The production build completed successfully, with TypeScript checks passing and the client bundle generated.
```

### Edited 3 files

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -106,7 +106,6 @@
 let wakeLock: { release: () => Promise<void> } | null = null;
 let kioskGestureStarted = false;
 let cloudNineAge = -1;
-let cloudNinePlayer: 0 | 1 | null = null;
 
 function getEntries(): LeaderboardEntry[] {
   return board.get(eventKey);

@@ -132,7 +131,6 @@
   perfectAge = -1;
   layerFlash = 0;
   cloudNineAge = -1;
-  cloudNinePlayer = null;
   debris = [];
   candidateEntry = null;
   highlightedEntry = null;

@@ -305,7 +303,6 @@
   }
   if (!activeRound.reachedCloudNine && updated.reachedCloudNine) {
     cloudNineAge = 0;
-    cloudNinePlayer = player;
     audio.cloudNine();
   }
   if (updated.layerBreaks > activeRound.layerBreaks && !reducedMotion) {

@@ -500,7 +497,6 @@
     cloudNineAge += dt;
     if (cloudNineAge >= 3.5) {
       cloudNineAge = -1;
-      cloudNinePlayer = null;
     }
   }
   layerFlash = Math.max(0, layerFlash - dt);

@@ -573,7 +569,6 @@
       ? getScreenLockoutProgress(screenElapsed)
       : 1,
     cloudNineAge,
-    cloudNinePlayer,
     operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
   };
   renderer.render(scene, dt);

@@ -592,7 +587,7 @@
         score: snapshot.score,
         layer: snapshot.layer,
         timeRemaining: snapshot.timeRemaining,
-        duel: duelSession,
+        duel: duelSession || duelEnabled,
       });
     },
   });
```

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -46,7 +46,6 @@
   duelWinner: DuelWinner | null;
   lockoutProgress: number;
   cloudNineAge: number;
-  cloudNinePlayer: 0 | 1 | null;
   operator: { open: boolean; confirmClear: boolean; selected: number; version: string };
 }
```

#### tests/round.test.ts

```diff
--- a/tests/round.test.ts
+++ b/tests/round.test.ts
@@ -45,4 +45,25 @@
     expect(round.phase).toBe('over');
     expect(round.endReason).toBe('missed');
   });
+
+  it('reaches Cloud Nine at floor 48 and keeps accepting drops afterwards', () => {
+    let round = updateRound(pressRound(createRound(7)), COUNTDOWN_SECONDS);
+    round = {
+      ...round,
+      floors: 47,
+      movingBlock: { x: 20, width: 60, direction: 1 },
+    };
+    round = pressRound(round);
+    expect(round.floors).toBe(48);
+    expect(round.reachedCloudNine).toBe(true);
+    expect(getRoundSnapshot(round).layer).toBe(9);
+
+    round = {
+      ...round,
+      movingBlock: { x: round.blocks.at(-1)!.x, width: round.blocks.at(-1)!.width, direction: 1 },
+    };
+    round = pressRound(round);
+    expect(round.floors).toBe(49);
+    expect(round.phase).toBe('playing');
+  });
 });
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 21 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.40 kB
dist/assets/index-DpmIo1dI.js  40.12 kB │ gzip: 14.70 kB

✓ built in 132ms
```

```text
The production build completed successfully. The full test suite is still running.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  12 passed (12)
      Tests  37 passed (37)
   Start at  04:21:50
   Duration  3.73s (transform 233ms, setup 0ms, import 555ms, tests 97ms, environment 1ms)
```

```text
The complete test suite passed: all 37 tests across 12 test files succeeded.
```

### Edited src/render/renderer.ts +12 -6

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -583,14 +583,14 @@
     } else if (card === 1) {
       this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.3, Math.max(28, big * 0.72), 'center', '#fff2ac');
       this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.23, Math.max(14, minSide * 0.026), 'center', '#e7f5ff');
-      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.15, true);
+      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.15, true, 6);
       this.text('TAP TO TAKE YOUR PLACE', centerX, centerY + minSide * 0.31, Math.max(14, medium * 0.64), 'center', '#ffe8a6');
     } else {
       this.text('HOW TO PLAY', centerX, centerY - minSide * 0.29, Math.max(30, big * 0.72), 'center', '#fff2ac');
       const rows = [
-        { y: centerY - minSide * 0.1, text: 'TAP to drop the block', icon: 0 },
-        { y: centerY + minSide * 0.08, text: 'Line it up — overhang is sliced off', icon: 1 },
-        { y: centerY + minSide * 0.26, text: 'PERFECT x3 grows it back · reach CLOUD NINE in 60 s', icon: 2 },
+        { y: centerY - minSide * 0.1, text: '1  TAP to drop the block', icon: 0 },
+        { y: centerY + minSide * 0.08, text: '2  Line it up — overhang is sliced off', icon: 1 },
+        { y: centerY + minSide * 0.26, text: '3  PERFECT x3 grows it back · reach CLOUD NINE in 60 s', icon: 2 },
       ];
       for (const row of rows) {
         this.drawHowToIcon(centerX - minSide * 0.32, row.y, minSide, row.icon);

@@ -686,13 +686,19 @@
     ctx.restore();
   }
 
-  private drawLeaderboard(scene: RendererScene, minSide: number, startY: number, full: boolean): void {
+  private drawLeaderboard(
+    scene: RendererScene,
+    minSide: number,
+    startY: number,
+    full: boolean,
+    limit = 10,
+  ): void {
     const ctx = this.context;
     if (!scene.leaderboard.length) {
       this.text('NO SCORES YET · BE THE FIRST', this.width / 2, startY + minSide * 0.035, Math.max(14, minSide * 0.035), 'center');
       return;
     }
-    const count = full ? Math.min(10, scene.leaderboard.length) : 1;
+    const count = full ? Math.min(limit, scene.leaderboard.length) : 1;
     const index = full ? 0 : scene.leaderboardIndex % scene.leaderboard.length;
     for (let row = 0; row < count; row += 1) {
       const entryIndex = full ? row : index;
```

### Edited src/render/renderer.ts +8 -4

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -588,13 +588,17 @@
     } else {
       this.text('HOW TO PLAY', centerX, centerY - minSide * 0.29, Math.max(30, big * 0.72), 'center', '#fff2ac');
       const rows = [
-        { y: centerY - minSide * 0.1, text: '1  TAP to drop the block', icon: 0 },
-        { y: centerY + minSide * 0.08, text: '2  Line it up — overhang is sliced off', icon: 1 },
-        { y: centerY + minSide * 0.26, text: '3  PERFECT x3 grows it back · reach CLOUD NINE in 60 s', icon: 2 },
+        { y: centerY - minSide * 0.1, text: '1  TAP to drop the block', secondLine: null, icon: 0 },
+        { y: centerY + minSide * 0.08, text: '2  Line it up — overhang is sliced off', secondLine: null, icon: 1 },
+        { y: centerY + minSide * 0.22, text: '3  PERFECT x3 grows it back ·', secondLine: 'reach CLOUD NINE in 60 s', icon: 2 },
       ];
       for (const row of rows) {
         this.drawHowToIcon(centerX - minSide * 0.32, row.y, minSide, row.icon);
-        this.text(row.text, centerX - minSide * 0.23, row.y, Math.max(16, minSide * 0.036), 'left', '#f4f8ff');
+        const textSize = Math.max(16, minSide * 0.04);
+        this.text(row.text, centerX - minSide * 0.23, row.y, textSize, 'left', '#f4f8ff');
+        if (row.secondLine) {
+          this.text(row.secondLine, centerX - minSide * 0.23, row.y + textSize * 1.1, textSize, 'left', '#f4f8ff');
+        }
       }
     }
     this.text('Made for the Cloud9 booth · Built with JetBrains Junie', centerX, this.height * 0.94, Math.max(13, minSide * 0.024), 'center', '#ffffff');
```

### Ran git diff --check && git status --short

```text
 M src/audio/synth.ts
 M src/core/attract.ts
 M src/main.ts
 M src/render/renderer.ts
 M tests/attract.test.ts
 M tests/round.test.ts
?? src/core/screen-lockout.ts
?? tests/screen-lockout.test.ts
```

```text
The whitespace and status check completed successfully. Several files remain modified or untracked, and the test suite and build are still running.
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 21 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.41 kB
dist/assets/index-BCFkZ85R.js  40.26 kB │ gzip: 14.74 kB

✓ built in 138ms
```

```text
The production build completed successfully.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  12 passed (12)
      Tests  37 passed (37)
   Start at  04:22:36
   Duration  3.69s (transform 248ms, setup 0ms, import 562ms, tests 120ms, environment 1ms)
```

```text
All tests passed: 12 test files and 37 tests.
```

## Task result

Completed TASK 4’s playtest polish across results flow, attract cards, demo bot, Cloud Nine feedback, and opt-in smoke-test state.

### Changes
- Added a tested 1.2-second input lockout with a filling progress line; duel results auto-return to attract after six seconds.
- Added dimmed attract scenery, rounded cards cycling every six seconds, leaderboard/how-to content, and the requested footer.
- Tuned the deterministic demo bot; added five-seed 60-second simulation coverage and Cloud Nine continuation coverage.
- Added the Cloud Nine banner, reduced-motion-aware confetti, synthesized fanfare, and the `?test=1` read-only `window.__skyline` getter.

### Verification
- `npm test`: 12 files and 37 tests passed; `npm run build` passed; `git diff --check` clean.
- No commit made.
