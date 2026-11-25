# Junie CLI session — Task 03: playtest fixes, kiosk, events, duel, operator panel

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-040157-5x42

The playtest problems listed in the prompt came from headless-Chromium screenshots of the Task 02 build.

## Prompt given to Junie

```text
Read .junie/guidelines.md and the current code. Do TASK 3 of Skyline Stack: booth/kiosk features, 2-player duel, and fixes from a playtest. Playtest screenshots showed these problems — fix them first:
 a. In ATTRACT the play HUD (SCORE 0 / FLOORS / LAYER / 60 timer ring) is drawn over the title. Hide the gameplay HUD in attract; instead show the demo-bot tower actually building in the background (it is not visible now — only the skyline is), dimmed, with a small 'DEMO' tag.
 b. The 9 layer pips bar at the bottom overlaps the attract banner '60 SECONDS · ONE BUTTON · NINE LAYERS'. Only show pips during play, and position the banner above them.
 c. Colours are muddy/dark: make the sky and blocks more vivid and higher contrast (keep it tasteful; layer 1 warm dusk, getting cooler/brighter upward, Cloud Nine golden). Blocks need a clearly brighter top face so stacking alignment is easy to read from 3 m.
 d. Show a faint 'ghost' outline of the block below's edges extended upward while the block slides, so players can aim.
 e. The moving block should alternate entering from left and right each floor.

Then implement:
1. Kiosk mode `?kiosk=1`: hide cursor, prevent context menu, pinch/double-tap zoom and text selection, request fullscreen on first input (ignore failures), return to ATTRACT after 20 s with no input on any non-play screen, and keep the screen awake with the Screen Wake Lock API when available.
2. Events `?event=NAME`: leaderboard storage key per event (sanitise to [a-z0-9-], max 24 chars); show the event name small on attract and leaderboard. Also show 'TODAY'S BEST' (top score) on attract.
3. Duel mode (`?duel=1` or toggle in operator panel or press D on attract): two towers side by side with identical seed so it is fair; P1 = A/S, left half touch, gamepad 0; P2 = L/K, right half touch, gamepad 1. Both play the same 60 s; a player who misses is out (their side greys out) while the other continues; winner banner 'P1 WINS' / 'P2 WINS' / 'DRAW' by score. Duel scores do not go to the leaderboard. Put any duel result logic (winner decision, both-out detection) in a pure src/core/duel.ts with vitest tests.
4. Operator panel: hold O for 3 s, or press-and-hold the top-left 80x80 px corner for 3 s: overlay with big buttons/keys — [1] clear this event's leaderboard (confirm twice), [2] toggle sound, [3] toggle duel default, [4] close. Show build version (from package.json version) and current event. Navigable by touch and keyboard.
5. A short on-screen 'How to play' line on READY/countdown: 'TAP when the block lines up · PERFECT drops grow it back'.
6. Respect prefers-reduced-motion: disable screen flash and shake.
7. Add/extend vitest tests (duel logic, event key sanitising, idle-timeout logic if you make it pure). Run `npm test` and `npm run build` until both pass. Do not commit. Do not create files outside this directory.
```

## Junie transcript (verbatim export)

# Session transcript

### Searched tests/**/*

```text
tests/attract.test.ts
tests/initials.test.ts
tests/inputmap.test.ts
tests/layers.test.ts
tests/leaderboard.test.ts
tests/rng.test.ts
tests/round.test.ts
tests/scoring.test.ts
tests/stack.test.ts
```

### Searched src/**/*

```text
src/audio/synth.ts
src/core/attract.ts
src/core/initials.ts
src/core/inputmap.ts
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

### Read package.json

### Read .junie/guidelines.md

### Read src/core/stack.ts

### Read src/render/renderer.ts

### Read src/core/round.ts

### Read src/core/layers.ts

### Read src/audio/synth.ts

### Read src/core/inputmap.ts

### Read src/input/input.ts

### Read src/main.ts

### Read src/core/leaderboard.ts

### Read src/core/attract.ts

### Read index.html

### Read tests/attract.test.ts

### Read src/core/scoring.ts

### Read tsconfig.json

### Read tests/round.test.ts

### Read tests/inputmap.test.ts

### Read tests/leaderboard.test.ts

### Read tests/stack.test.ts

### Read vite.config.ts

### Edited src/core/stack.ts +2 -2

#### src/core/stack.ts

```diff
--- a/src/core/stack.ts
+++ b/src/core/stack.ts
@@ -37,8 +37,8 @@
   return { x: (worldWidth - width) / 2, width, direction: 1 };
 }
 
-export function createMovingBlock(width: number, direction: -1 | 1 = 1): Block {
-  return { x: 0, width, direction };
+export function createMovingBlock(width: number, direction: -1 | 1 = 1, worldWidth = WORLD_WIDTH): Block {
+  return { x: direction === 1 ? 0 : Math.max(0, worldWidth - width), width, direction };
 }
 
 /** Moves a block and reflects it at either world edge, including large time steps. */
```

### Edited 5 files

#### src/core/duel.ts

```diff
--- a/src/core/duel.ts
+++ b/src/core/duel.ts
@@ -1,0 +1,18 @@
+export type DuelWinner = 'P1' | 'P2' | 'DRAW';
+
+export interface DuelOutcome {
+  complete: boolean;
+  winner: DuelWinner | null;
+}
+
+/** Resolves a duel after both players are out or both rounds have ended. */
+export function getDuelOutcome(
+  scores: readonly [number, number],
+  out: readonly [boolean, boolean],
+  finished: readonly [boolean, boolean],
+): DuelOutcome {
+  const complete = (out[0] && out[1]) || (finished[0] && finished[1]);
+  if (!complete) return { complete: false, winner: null };
+  if (scores[0] === scores[1]) return { complete: true, winner: 'DRAW' };
+  return { complete: true, winner: scores[0] > scores[1] ? 'P1' : 'P2' };
+}
```

#### src/core/kiosk.ts

```diff
--- a/src/core/kiosk.ts
+++ b/src/core/kiosk.ts
@@ -1,0 +1,10 @@
+export const KIOSK_IDLE_SECONDS = 20;
+
+/** Kiosk screens return to attract after inactivity, but never interrupt active play. */
+export function shouldReturnToAttract(
+  screen: string,
+  idleSeconds: number,
+  timeout = KIOSK_IDLE_SECONDS,
+): boolean {
+  return screen !== 'play' && idleSeconds >= Math.max(0, timeout);
+}
```

#### tests/duel.test.ts

```diff
--- a/tests/duel.test.ts
+++ b/tests/duel.test.ts
@@ -1,0 +1,17 @@
+import { describe, expect, it } from 'vitest';
+import { getDuelOutcome } from '../src/core/duel';
+
+describe('duel outcome', () => {
+  it('waits for the other player after one player is out', () => {
+    expect(getDuelOutcome([100, 80], [true, false], [true, false])).toEqual({ complete: false, winner: null });
+  });
+
+  it('ends when both players are out and awards the higher score', () => {
+    expect(getDuelOutcome([100, 80], [true, true], [true, true])).toEqual({ complete: true, winner: 'P1' });
+    expect(getDuelOutcome([80, 100], [true, true], [true, true])).toEqual({ complete: true, winner: 'P2' });
+  });
+
+  it('ends completed rounds with a draw when scores match', () => {
+    expect(getDuelOutcome([120, 120], [false, false], [true, true])).toEqual({ complete: true, winner: 'DRAW' });
+  });
+});
```

#### tests/kiosk.test.ts

```diff
--- a/tests/kiosk.test.ts
+++ b/tests/kiosk.test.ts
@@ -1,0 +1,10 @@
+import { describe, expect, it } from 'vitest';
+import { shouldReturnToAttract } from '../src/core/kiosk';
+
+describe('kiosk idle timeout', () => {
+  it('returns from idle non-play screens but never interrupts play', () => {
+    expect(shouldReturnToAttract('leaderboard', 20)).toBe(true);
+    expect(shouldReturnToAttract('attract', 19.9)).toBe(false);
+    expect(shouldReturnToAttract('play', 60)).toBe(false);
+  });
+});
```

#### tests/leaderboard.test.ts

```diff
--- a/tests/leaderboard.test.ts
+++ b/tests/leaderboard.test.ts
@@ -4,6 +4,7 @@
   isValidInitials,
   Leaderboard,
   serializeLeaderboards,
+  sanitizeEventKey,
   type StorageLike,
 } from '../src/core/leaderboard';
 

@@ -24,6 +25,12 @@
 }
 
 describe('leaderboard', () => {
+  it('sanitizes event names for stable, bounded storage keys', () => {
+    expect(sanitizeEventKey(' Friday Finals 2026! ')).toBe('friday-finals-2026');
+    expect(sanitizeEventKey('A'.repeat(30))).toBe('a'.repeat(24));
+    expect(sanitizeEventKey('!!!')).toBe('default');
+    expect(sanitizeEventKey('My_event/Day')).toBe('my-event-day');
+  });
   it('validates initials, sorts by score and earlier timestamp, and keeps top ten per event', () => {
     const storage = new MemoryStorage();
     const leaderboard = new Leaderboard(storage);
```

### Read src/core/leaderboard.ts

### Read src/core/round.ts

### Read tests/leaderboard.test.ts

### Read tests/stack.test.ts

### Edited 3 files

#### src/core/leaderboard.ts

```diff
--- a/src/core/leaderboard.ts
+++ b/src/core/leaderboard.ts
@@ -15,6 +15,17 @@
 
 export type EventLeaderboards = Record<string, LeaderboardEntry[]>;
 
+export function sanitizeEventKey(eventName: string | null | undefined): string {
+  const sanitized = (eventName ?? '')
+    .trim()
+    .toLowerCase()
+    .replace(/[^a-z0-9-]+/g, '-')
+    .replace(/^-+|-+$/g, '')
+    .slice(0, 24)
+    .replace(/-+$/g, '');
+  return sanitized || 'default';
+}
+
 export function isValidInitials(initials: string): boolean {
   return /^[A-Z0-9]{3}$/.test(initials);
 }
```

#### src/core/round.ts

```diff
--- a/src/core/round.ts
+++ b/src/core/round.ts
@@ -96,7 +96,7 @@
   const nextState: RoundState = {
     ...state,
     blocks: [...state.blocks, result.block],
-    movingBlock: createMovingBlock(result.block.width),
+    movingBlock: createMovingBlock(result.block.width, floors % 2 === 0 ? 1 : -1),
     floors,
     combo: result.combo,
     perfectStreak: result.perfectStreak,
```

#### tests/stack.test.ts

```diff
--- a/tests/stack.test.ts
+++ b/tests/stack.test.ts
@@ -1,5 +1,6 @@
 import { describe, expect, it } from 'vitest';
 import { advanceBlock, createBaseBlock, dropBlock } from '../src/core/stack';
+import { createRound, pressRound, updateRound } from '../src/core/round';
 
 describe('stack mechanics', () => {
   const base = createBaseBlock();

@@ -8,6 +9,15 @@
     expect(base).toEqual({ x: 20, width: 60, direction: 1 });
   });
 
+  it('alternates each new moving block from opposite sides', () => {
+    let round = updateRound(pressRound(createRound()), 3);
+    expect(round.movingBlock).toMatchObject({ x: 0, direction: 1 });
+    round = pressRound(round);
+    expect(round.movingBlock).toMatchObject({ x: 40, direction: -1 });
+    round = pressRound(round);
+    expect(round.movingBlock).toMatchObject({ x: 0, direction: 1 });
+  });
+
   it('bounces a sliding block off world edges', () => {
     expect(advanceBlock({ x: 0, width: 60, direction: 1 }, 1.5, 40)).toEqual({
       x: 20,
```

### Edited 2 files

#### tests/stack.test.ts

```diff
--- a/tests/stack.test.ts
+++ b/tests/stack.test.ts
@@ -12,8 +12,10 @@
   it('alternates each new moving block from opposite sides', () => {
     let round = updateRound(pressRound(createRound()), 3);
     expect(round.movingBlock).toMatchObject({ x: 0, direction: 1 });
+    round = { ...round, movingBlock: { x: 20, width: 60, direction: 1 } };
     round = pressRound(round);
     expect(round.movingBlock).toMatchObject({ x: 40, direction: -1 });
+    round = { ...round, movingBlock: { x: 20, width: 60, direction: -1 } };
     round = pressRound(round);
     expect(round.movingBlock).toMatchObject({ x: 0, direction: 1 });
   });
```

#### src/input/input.ts

```diff
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -5,6 +5,8 @@
   player: PlayerIndex;
   source: 'keyboard' | 'pointer' | 'gamepad';
   key?: string;
+  x?: number;
+  y?: number;
 }
 
 export interface InputOptions {

@@ -12,6 +14,7 @@
   onPress: (event: PressEvent) => void;
   onKey?: (key: string) => void;
   onGesture?: () => void;
+  onActivity?: () => void;
 }
 
 export interface InputController {

@@ -37,16 +40,22 @@
     options.onGesture?.();
   };
 
-  const emit = (player: PlayerIndex, source: PressEvent['source'], key?: string): void => {
+  const emit = (player: PlayerIndex, source: PressEvent['source'], key?: string, x?: number, y?: number): void => {
     const now = performance.now();
     if (now - lastPress[player] < DEBOUNCE_MS) return;
     lastPress[player] = now;
-    options.onPress({ type: 'press', player, source, ...(key ? { key } : {}) });
+    options.onPress({
+      type: 'press', player, source,
+      ...(key ? { key } : {}),
+      ...(x === undefined ? {} : { x }),
+      ...(y === undefined ? {} : { y }),
+    });
   };
 
   const keydown = (event: KeyboardEvent): void => {
     if (event.ctrlKey || event.metaKey || event.altKey) return;
     const token = event.key.toLowerCase();
+    options.onActivity?.();
     if (heldKeys.has(token)) return;
     heldKeys.add(token);
     options.onKey?.(event.key);

@@ -65,6 +74,7 @@
   };
 
   const pointerdown = (event: PointerEvent): void => {
+    options.onActivity?.();
     const bounds = canvas.getBoundingClientRect();
     const player = routePress({
       source: 'pointer',

@@ -80,7 +90,7 @@
       // Capture is unavailable for some synthetic and browser-generated events.
     }
     signalGesture();
-    emit(player, 'pointer');
+    emit(player, 'pointer', undefined, event.clientX - bounds.left, event.clientY - bounds.top);
   };
 
   const pointerup = (event: PointerEvent): void => {

@@ -115,6 +125,7 @@
         const player = routePress({ source: 'gamepad', index, buttons: down }, options.isDuel());
         if (player === null) continue;
         currentlyHeld[player] = true;
+        if (down.length > 0) options.onActivity?.();
         for (const buttonIndex of down.filter((button) => [0, 1, 2, 3, 9].includes(button))) {
           const buttonId = `${index}:${buttonIndex}`;
           if (pressedGamepadButtons.has(buttonId)) continue;
```

### Edited src/render/renderer.ts +50 -32

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -1,6 +1,7 @@
 import type { RoundSnapshot } from '../core/round';
 import type { Block, DebrisPiece } from '../core/stack';
 import type { LeaderboardEntry } from '../core/leaderboard';
+import type { DuelWinner } from '../core/duel';
 
 export type AppScreen = 'attract' | 'countdown' | 'play' | 'game-over' | 'initials' | 'leaderboard';
 

@@ -33,9 +34,17 @@
   leaderboard: readonly LeaderboardEntry[];
   leaderboardIndex: number;
   highlightedEntry: LeaderboardEntry | null;
+  todayBest: LeaderboardEntry | null;
+  eventName: string;
   initials: string;
   holdProgress: number;
   muted: boolean;
+  reducedMotion: boolean;
+  duelMode: boolean;
+  duelRounds: readonly [RoundSnapshot, RoundSnapshot] | null;
+  duelOut: readonly [boolean, boolean];
+  duelWinner: DuelWinner | null;
+  operator: { open: boolean; confirmClear: boolean; selected: number; version: string };
 }
 
 interface Palette {

@@ -45,15 +54,15 @@
 }
 
 const PALETTES: readonly Palette[] = [
-  { top: '#34274f', bottom: '#ed8a74', glow: '#ffc394' },
-  { top: '#62435e', bottom: '#f0a2a3', glow: '#ffe0c0' },
-  { top: '#56769c', bottom: '#f5bc8b', glow: '#fff0bd' },
-  { top: '#3e729c', bottom: '#b3d9e8', glow: '#ecfbff' },
-  { top: '#23577e', bottom: '#86c6e2', glow: '#d9f5ff' },
-  { top: '#263b75', bottom: '#a4b9de', glow: '#f0f7ff' },
-  { top: '#171f4e', bottom: '#586eae', glow: '#cad8ff' },
-  { top: '#172d60', bottom: '#51b9bb', glow: '#d5ffe8' },
-  { top: '#483b83', bottom: '#f4c783', glow: '#fff4bd' },
+  { top: '#51345f', bottom: '#f57f55', glow: '#ffcf83' },
+  { top: '#523877', bottom: '#ff9b90', glow: '#ffe0a6' },
+  { top: '#354f91', bottom: '#ffbc68', glow: '#fff3a4' },
+  { top: '#2469a5', bottom: '#9ce7ff', glow: '#ecfdff' },
+  { top: '#15558c', bottom: '#63c9f5', glow: '#d4f7ff' },
+  { top: '#304e9e', bottom: '#afcfff', glow: '#effaff' },
+  { top: '#212963', bottom: '#718cff', glow: '#d5e0ff' },
+  { top: '#134c73', bottom: '#55e2ce', glow: '#d5fff2' },
+  { top: '#6a418a', bottom: '#ffc964', glow: '#fff5c3' },
 ];
 
 export class CanvasRenderer {

@@ -61,6 +70,7 @@
   private width = 1;
   private height = 1;
   private camera = 0;
+  private duelCameras: [number, number] = [0, 0];
   private lastDpr = 0;
 
   constructor(private readonly canvas: HTMLCanvasElement) {

@@ -85,38 +95,46 @@
     const contentWidth = this.width * 0.84;
     const contentLeft = this.width * 0.08;
     const ground = this.height * 0.89;
-    const targetCamera = Math.max(0, round.floors * blockHeight - this.height * 0.3);
-    this.camera += (targetCamera - this.camera) * (1 - Math.exp(-Math.max(0, dt) * 2.4));
-
     this.drawSky(palette, round.layer, scene.elapsed);
     this.drawClouds(scene.elapsed);
     if (round.layer >= 7) this.drawStars(scene.elapsed, palette.glow);
-
-    for (let index = 0; index < round.blocks.length; index += 1) {
-      const block = round.blocks[index]!;
-      this.drawBlock(block, index, contentLeft, contentWidth, ground, blockHeight, minSide);
+    if (scene.duelRounds) {
+      this.drawDuelTowers(scene, minSide, ground, blockHeight, dt);
+      this.drawDuelHud(scene, minSide);
+    } else {
+      const targetCamera = Math.max(0, round.floors * blockHeight - this.height * 0.3);
+      this.camera += (targetCamera - this.camera) * (1 - Math.exp(-Math.max(0, dt) * 2.4));
+      this.drawTower(round, scene, contentLeft, contentWidth, ground, blockHeight, minSide);
+      this.drawHud(round, scene, minSide);
     }
-    if (round.movingBlock && (scene.screen === 'play' || scene.screen === 'countdown' || scene.screen === 'attract')) {
-      this.drawBlock(
-        round.movingBlock,
-        round.floors + 1,
-        contentLeft,
-        contentWidth,
-        ground,
-        blockHeight,
-        minSide,
-        true,
-      );
-    }
-    this.drawDebris(scene.debris, contentLeft, contentWidth, ground, blockHeight);
-    this.drawHud(round, scene, minSide);
-    this.drawLayerPips(round, minSide);
+    if (scene.screen === 'play') this.drawLayerPips(round, minSide);
 
     if (scene.perfectAge >= 0 && scene.perfectAge < 1.15) this.drawPerfect(scene, minSide);
-    if (scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
+    if (!scene.reducedMotion && scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
     this.drawScreen(scene, minSide);
+    if (scene.operator.open) this.drawOperatorPanel(scene, minSide);
   }
 
+  private drawTower(
+    round: RoundSnapshot,
+    scene: RendererScene,
+    left: number,
+    width: number,
+    ground: number,
+    blockHeight: number,
+    minSide: number,
+  ): void {
+    for (let index = 0; index < round.blocks.length; index += 1) {
+      this.drawBlock(round.blocks[index]!, index, left, width, ground, blockHeight, minSide);
+    }
+    if (round.movingBlock && ['play', 'countdown', 'attract'].includes(scene.screen)) {
+      const target = round.blocks[round.blocks.length - 1]!;
+      this.drawAlignmentGuide(target, round.floors, round.movingBlock, round.floors + 1, left, width, ground, blockHeight);
+      this.drawBlock(round.movingBlock, round.floors + 1, left, width, ground, blockHeight, minSide, true);
+    }
+    this.drawDebris(scene.debris, left, width, ground, blockHeight);
+  }
+
   private resize = (): void => {
     const bounds = this.canvas.getBoundingClientRect();
     const dpr = Math.min(2.5, window.devicePixelRatio || 1);
```

### Read src/render/renderer.ts [115-464]

### Edited src/render/renderer.ts +95

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -135,6 +135,101 @@
     this.drawDebris(scene.debris, left, width, ground, blockHeight);
   }
 
+  private drawAlignmentGuide(
+    target: Block,
+    targetFloor: number,
+    moving: Block,
+    movingFloor: number,
+    left: number,
+    width: number,
+    ground: number,
+    blockHeight: number,
+  ): void {
+    const ctx = this.context;
+    const targetY = ground - targetFloor * blockHeight + this.camera;
+    const movingBottom = ground - movingFloor * blockHeight + this.camera + blockHeight * 0.8;
+    const edges = [target.x, target.x + target.width];
+    ctx.save();
+    ctx.strokeStyle = '#e7fbff';
+    ctx.globalAlpha = 0.38;
+    ctx.lineWidth = Math.max(2, blockHeight * 0.055);
+    ctx.setLineDash([Math.max(6, blockHeight * 0.2), Math.max(5, blockHeight * 0.16)]);
+    for (const edge of edges) {
+      const x = left + edge / 100 * width;
+      ctx.beginPath();
+      ctx.moveTo(x, movingBottom);
+      ctx.lineTo(x, targetY);
+      ctx.stroke();
+    }
+    ctx.setLineDash([]);
+    ctx.restore();
+    void moving;
+  }
+
+  private drawDuelTowers(
+    scene: RendererScene,
+    minSide: number,
+    ground: number,
+    blockHeight: number,
+    dt: number,
+  ): void {
+    if (!scene.duelRounds) return;
+    const gap = this.width * 0.055;
+    const margin = this.width * 0.025;
+    const viewWidth = (this.width - gap - margin * 2) / 2;
+    const contentWidth = viewWidth * 0.88;
+    const ctx = this.context;
+    ctx.save();
+    ctx.strokeStyle = '#ffffff88';
+    ctx.lineWidth = Math.max(2, minSide * 0.003);
+    ctx.beginPath();
+    ctx.moveTo(this.width / 2, this.height * 0.12);
+    ctx.lineTo(this.width / 2, this.height * 0.88);
+    ctx.stroke();
+    ctx.restore();
+
+    scene.duelRounds.forEach((round, index) => {
+      const viewLeft = margin + index * (viewWidth + gap);
+      const left = viewLeft + (viewWidth - contentWidth) / 2;
+      const targetCamera = Math.max(0, round.floors * blockHeight - this.height * 0.3);
+      this.duelCameras[index] += (targetCamera - this.duelCameras[index]) * (1 - Math.exp(-Math.max(0, dt) * 2.4));
+      this.camera = this.duelCameras[index];
+      ctx.save();
+      if (scene.duelOut[index]) ctx.globalAlpha = 0.28;
+      for (let blockIndex = 0; blockIndex < round.blocks.length; blockIndex += 1) {
+        this.drawBlock(round.blocks[blockIndex]!, blockIndex, left, contentWidth, ground, blockHeight, minSide * 0.48);
+      }
+      if (round.movingBlock) {
+        const target = round.blocks[round.blocks.length - 1]!;
+        this.drawAlignmentGuide(target, round.floors, round.movingBlock, round.floors + 1, left, contentWidth, ground, blockHeight);
+        this.drawBlock(round.movingBlock, round.floors + 1, left, contentWidth, ground, blockHeight, minSide * 0.48, true);
+      }
+      ctx.restore();
+      if (scene.duelOut[index]) {
+        this.text(`P${index + 1} OUT`, viewLeft + viewWidth / 2, this.height * 0.58, Math.max(23, minSide * 0.055), 'center', '#d2d7e2');
+      }
+    });
+    this.camera = this.duelCameras[0];
+  }
+
+  private drawDuelHud(scene: RendererScene, minSide: number): void {
+    if (!scene.duelRounds) return;
+    const gap = this.width * 0.055;
+    const margin = this.width * 0.025;
+    const viewWidth = (this.width - gap - margin * 2) / 2;
+    const labelSize = Math.max(16, minSide * 0.035);
+    const scoreSize = Math.max(24, minSide * 0.058);
+    scene.duelRounds.forEach((round, index) => {
+      const center = margin + index * (viewWidth + gap) + viewWidth / 2;
+      this.text(`P${index + 1}  ·  ${round.score.toLocaleString()}`, center, this.height * 0.055, scoreSize, 'center');
+      this.text(`FLOORS ${round.floors}  ·  ${Math.ceil(round.timeRemaining)}s`, center, this.height * 0.105, labelSize, 'center');
+    });
+    if (scene.screen === 'play') {
+      this.text('A / S', this.width * 0.15, this.height * 0.19, Math.max(14, minSide * 0.025), 'center', '#e9f8ff');
+      this.text('L / K', this.width * 0.85, this.height * 0.19, Math.max(14, minSide * 0.025), 'center', '#e9f8ff');
+    }
+  }
+
   private resize = (): void => {
     const bounds = this.canvas.getBoundingClientRect();
     const dpr = Math.min(2.5, window.devicePixelRatio || 1);
```

### Edited src/render/renderer.ts +9 -10

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -129,7 +129,7 @@
     }
     if (round.movingBlock && ['play', 'countdown', 'attract'].includes(scene.screen)) {
       const target = round.blocks[round.blocks.length - 1]!;
-      this.drawAlignmentGuide(target, round.floors, round.movingBlock, round.floors + 1, left, width, ground, blockHeight);
+      this.drawAlignmentGuide(target, round.floors, round.floors + 1, left, width, ground, blockHeight);
       this.drawBlock(round.movingBlock, round.floors + 1, left, width, ground, blockHeight, minSide, true);
     }
     this.drawDebris(scene.debris, left, width, ground, blockHeight);

@@ -138,7 +138,6 @@
   private drawAlignmentGuide(
     target: Block,
     targetFloor: number,
-    moving: Block,
     movingFloor: number,
     left: number,
     width: number,

@@ -163,7 +162,6 @@
     }
     ctx.setLineDash([]);
     ctx.restore();
-    void moving;
   }
 
   private drawDuelTowers(

@@ -201,7 +199,7 @@
       }
       if (round.movingBlock) {
         const target = round.blocks[round.blocks.length - 1]!;
-        this.drawAlignmentGuide(target, round.floors, round.movingBlock, round.floors + 1, left, contentWidth, ground, blockHeight);
+        this.drawAlignmentGuide(target, round.floors, round.floors + 1, left, contentWidth, ground, blockHeight);
         this.drawBlock(round.movingBlock, round.floors + 1, left, contentWidth, ground, blockHeight, minSide * 0.48, true);
       }
       ctx.restore();

@@ -337,7 +335,7 @@
     const slabWidth = block.width / 100 * width;
     const y = ground - floor * blockHeight + this.camera;
     if (y < -blockHeight * 2 || y > this.height + blockHeight) return;
-    const hue = (190 + floor * 19) % 360;
+    const hue = (20 + floor * 31) % 360;
     const radius = Math.max(3, minSide * 0.008);
     const sideDepth = Math.max(4, blockHeight * 0.16);
     const ctx = this.context;

@@ -344,7 +342,7 @@
     ctx.save();
     if (moving) ctx.shadowColor = `hsla(${hue},90%,75%,0.6)`;
     ctx.shadowBlur = moving ? minSide * 0.025 : minSide * 0.008;
-    ctx.fillStyle = `hsl(${hue} 72% 34%)`;
+    ctx.fillStyle = `hsl(${hue} 88% 31%)`;
     ctx.beginPath();
     ctx.moveTo(x + radius, y + blockHeight - sideDepth);
     ctx.lineTo(x + slabWidth - radius, y + blockHeight - sideDepth);

@@ -353,11 +351,11 @@
     ctx.closePath();
     ctx.fill();
     ctx.shadowBlur = 0;
-    ctx.fillStyle = `hsl(${hue} 76% 53%)`;
+    ctx.fillStyle = `hsl(${hue} 86% 61%)`;
     this.roundRect(x, y, slabWidth, blockHeight - sideDepth, radius);
     ctx.fill();
-    ctx.fillStyle = `hsl(${hue} 87% 77% / 0.7)`;
-    ctx.fillRect(x + radius, y + 2, Math.max(0, slabWidth - radius * 2), Math.max(2, blockHeight * 0.09));
+    ctx.fillStyle = `hsl(${hue} 96% 91%)`;
+    ctx.fillRect(x + radius, y + 2, Math.max(0, slabWidth - radius * 2), Math.max(4, blockHeight * 0.18));
     ctx.restore();
   }
 

@@ -387,6 +385,7 @@
   }
 
   private drawHud(round: RoundSnapshot, scene: RendererScene, minSide: number): void {
+    if (scene.screen === 'attract') return;
     const ctx = this.context;
     const labelSize = Math.max(16, minSide * 0.04);
     const scoreSize = Math.max(27, minSide * 0.075);

@@ -405,7 +404,7 @@
     ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI * 1.5);
     ctx.stroke();
     ctx.strokeStyle = warning ? '#ff786f' : '#f7f5df';
-    if (warning) ctx.globalAlpha = 0.65 + (Math.sin(scene.elapsed * 9) + 1) * 0.17;
+    if (warning && !scene.reducedMotion) ctx.globalAlpha = 0.65 + (Math.sin(scene.elapsed * 9) + 1) * 0.17;
     ctx.beginPath();
     ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
     ctx.stroke();
```

### Edited src/render/renderer.ts +59 -14

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -465,31 +465,43 @@
     if (scene.screen === 'play') return;
 
     ctx.save();
-    ctx.fillStyle = scene.screen === 'attract' ? '#111a3470' : '#111a34bd';
+    ctx.fillStyle = scene.screen === 'attract' ? '#111a3450' : '#111a34bd';
     ctx.fillRect(0, 0, this.width, this.height);
 
     if (scene.screen === 'attract') {
+      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, this.height * 0.065, Math.max(13, minSide * 0.025), 'center', '#e7f5ff');
+      this.text('DEMO', this.width * 0.93, this.height * 0.12, Math.max(14, minSide * 0.03), 'center', '#ffe8a6');
       this.text('SKYLINE STACK', centerX, centerY - minSide * 0.12, big, 'center', '#fff8e4');
       this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.02, medium, 'center', '#d2f3ff');
-      const blink = Math.sin(scene.elapsed * 3.2) > -0.15;
+      const blink = scene.reducedMotion || Math.sin(scene.elapsed * 3.2) > -0.15;
       if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.1, medium, 'center', '#ffe8a6');
-      this.text('60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, this.height * 0.91, Math.max(13, medium * 0.62), 'center', '#ffffff');
+      this.text(scene.duelMode ? 'DUEL MODE · P1 LEFT / P2 RIGHT' : '60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, this.height * 0.84, Math.max(13, medium * 0.62), 'center', '#ffffff');
       this.drawLeaderboard(scene, minSide, centerY + minSide * 0.24, false);
+      if (scene.todayBest) {
+        this.text(`TODAY'S BEST  ${scene.todayBest.initials} · ${scene.todayBest.score.toLocaleString()}`, centerX, centerY + minSide * 0.31, Math.max(14, minSide * 0.031), 'center', '#ffe8a6');
+      }
     } else if (scene.screen === 'countdown') {
       const countdown = Math.max(1, Math.ceil(scene.round.countdownRemaining));
       this.text(countdown.toString(), centerX, centerY + big * 0.35, big * 2.2, 'center', '#fff5ce');
       this.text('GET READY', centerX, centerY + big * 1.25, medium, 'center');
+      this.text('TAP when the block lines up · PERFECT drops grow it back', centerX, this.height * 0.79, Math.max(14, minSide * 0.035), 'center', '#fff2bd');
     } else if (scene.screen === 'game-over') {
-      this.text('TOWER COMPLETE', centerX, centerY - minSide * 0.29, big * 0.75, 'center', '#fff5ce');
-      const reason = scene.round.endReason === 'missed' ? 'THE BLOCK SLIPPED AWAY' : 'TIME IS UP';
-      this.text(reason, centerX, centerY - minSide * 0.21, medium, 'center', '#d8edff');
-      this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, centerY - minSide * 0.11, big, 'center');
-      const rows = [
-        `FLOORS  ${scene.breakdown.floors}  ·  PERFECTS  ${scene.breakdown.perfects}  +${scene.breakdown.perfectBonus}`,
-        `LAYERS  ${scene.breakdown.layers}  +${scene.breakdown.layerBonus}  ·  TIME  +${scene.breakdown.timeBonus}`,
-        ...(scene.breakdown.summitBonus > 0 ? [`CLOUD NINE BONUS  +${scene.breakdown.summitBonus}`] : []),
-      ];
-      rows.forEach((row, index) => this.text(row, centerX, centerY + minSide * (index * 0.065), Math.max(15, medium * 0.78), 'center'));
+      if (scene.duelRounds && scene.duelWinner) {
+        this.text(`${scene.duelWinner} WINS`, centerX, centerY - minSide * 0.15, big * 1.05, 'center', '#fff2ac');
+        this.text(`P1  ${scene.duelRounds[0].score.toLocaleString()}   ·   P2  ${scene.duelRounds[1].score.toLocaleString()}`, centerX, centerY - minSide * 0.015, medium, 'center');
+        this.text('DUEL COMPLETE', centerX, centerY + minSide * 0.09, medium * 0.8, 'center', '#d8edff');
+      } else {
+        this.text('TOWER COMPLETE', centerX, centerY - minSide * 0.29, big * 0.75, 'center', '#fff5ce');
+        const reason = scene.round.endReason === 'missed' ? 'THE BLOCK SLIPPED AWAY' : 'TIME IS UP';
+        this.text(reason, centerX, centerY - minSide * 0.21, medium, 'center', '#d8edff');
+        this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, centerY - minSide * 0.11, big, 'center');
+        const rows = [
+          `FLOORS  ${scene.breakdown.floors}  ·  PERFECTS  ${scene.breakdown.perfects}  +${scene.breakdown.perfectBonus}`,
+          `LAYERS  ${scene.breakdown.layers}  +${scene.breakdown.layerBonus}  ·  TIME  +${scene.breakdown.timeBonus}`,
+          ...(scene.breakdown.summitBonus > 0 ? [`CLOUD NINE BONUS  +${scene.breakdown.summitBonus}`] : []),
+        ];
+        rows.forEach((row, index) => this.text(row, centerX, centerY + minSide * (index * 0.065), Math.max(15, medium * 0.78), 'center'));
+      }
       this.text('PRESS TO CONTINUE', centerX, centerY + minSide * 0.23, medium * 0.8, 'center', '#ffe8a6');
     } else if (scene.screen === 'initials') {
       this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');

@@ -503,12 +515,45 @@
       this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.24, Math.max(14, medium * 0.68), 'center');
     } else if (scene.screen === 'leaderboard') {
       this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
-      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.22, true);
+      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.25, Math.max(13, minSide * 0.024), 'center', '#e7f5ff');
+      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.19, true);
       this.text('PRESS TO PLAY AGAIN', centerX, this.height - minSide * 0.12, medium * 0.82, 'center', '#ffe8a6');
     }
     ctx.restore();
   }
 
+  private drawOperatorPanel(scene: RendererScene, minSide: number): void {
+    const ctx = this.context;
+    const centerX = this.width / 2;
+    const rowHeight = this.height * 0.085;
+    const rowTop = this.height * 0.39;
+    const rowGap = this.height * 0.105;
+    const panelWidth = this.width * 0.82;
+    ctx.save();
+    ctx.fillStyle = '#071126eF';
+    ctx.fillRect(0, 0, this.width, this.height);
+    ctx.fillStyle = '#192c50';
+    ctx.beginPath();
+    ctx.roundRect(centerX - panelWidth / 2, this.height * 0.13, panelWidth, this.height * 0.74, Math.max(10, minSide * 0.025));
+    ctx.fill();
+    this.text('OPERATOR PANEL', centerX, this.height * 0.22, Math.max(28, minSide * 0.075), 'center', '#fff2ac');
+    this.text(`EVENT · ${scene.eventName.toUpperCase()}  ·  BUILD ${scene.operator.version}`, centerX, this.height * 0.31, Math.max(14, minSide * 0.029), 'center', '#e4f6ff');
+    const labels = [
+      scene.operator.confirmClear ? '[1] CLEAR BOARD — PRESS AGAIN TO CONFIRM' : '[1] CLEAR THIS EVENT LEADERBOARD',
+      `[2] SOUND: ${scene.muted ? 'OFF — TURN ON' : 'ON — TURN OFF'}`,
+      `[3] DUEL DEFAULT: ${scene.duelMode ? 'ON — TURN OFF' : 'OFF — TURN ON'}`,
+      '[4] CLOSE',
+    ];
+    labels.forEach((label, index) => {
+      const y = rowTop + index * rowGap;
+      ctx.fillStyle = scene.operator.selected === index ? '#31547b' : '#233b60';
+      ctx.fillRect(centerX - panelWidth * 0.43, y - rowHeight / 2, panelWidth * 0.86, rowHeight);
+      this.text(label, centerX, y, Math.max(16, minSide * 0.034), 'center', '#ffffff');
+    });
+    this.text('TOUCH A BUTTON · ↑/↓ + ENTER · 1–4 · ESC', centerX, this.height * 0.81, Math.max(13, minSide * 0.025), 'center', '#d7eaff');
+    ctx.restore();
+  }
+
   private drawLeaderboard(scene: RendererScene, minSide: number, startY: number, full: boolean): void {
     const ctx = this.context;
     if (!scene.leaderboard.length) {
```

### Edited src/main.ts +20 -2

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,6 +1,8 @@
 import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
 import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
-import { Leaderboard, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
+import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
+import { getDuelOutcome, type DuelWinner } from './core/duel';
+import { shouldReturnToAttract } from './core/kiosk';
 import { nextRandom } from './core/rng';
 import {
   createRound,

@@ -14,6 +16,7 @@
 import { SynthAudio } from './audio/synth';
 import { createInput, type InputController, type PressEvent } from './input/input';
 import { CanvasRenderer, type AppScreen, type DebrisAnimation, type RendererScene } from './render/renderer';
+import packageInfo from '../package.json';
 
 const canvas = document.querySelector<HTMLCanvasElement>('#game');
 if (!canvas) throw new Error('The game canvas is missing.');

@@ -21,7 +24,10 @@
 const params = new URLSearchParams(window.location.search);
 const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;
 const fixedSeed = parsedSeed !== null && Number.isFinite(parsedSeed) ? parsedSeed >>> 0 : null;
-const eventKey = params.get('event')?.trim() || 'default';
+const eventKey = sanitizeEventKey(params.get('event'));
+const eventName = eventKey;
+const kioskMode = params.get('kiosk') === '1';
+const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 let seedCursor = fixedSeed ?? (Date.now() >>> 0);
 
 function nextRoundSeed(): number {

@@ -66,6 +72,10 @@
 
 let screen: AppScreen = 'attract';
 let round: RoundState = createRound(nextRoundSeed());
+let duelRound: RoundState = createRound(round.seed);
+let duelEnabled = params.get('duel') === '1';
+let duelSession = false;
+let duelWinner: DuelWinner | null = null;
 let demoRound = pressRound(createRound(nextRoundSeed()));
 let demoBot: DemoBotState = createDemoBot(nextRoundSeed());
 let demoResetTimer = 0;

@@ -84,6 +94,14 @@
 let highlightedEntry: LeaderboardEntry | null = null;
 let candidateEntry: LeaderboardEntry | null = null;
 let ignoreNextKeyboardPress = false;
+let operatorOpen = false;
+let operatorConfirmClear = false;
+let operatorSelected = 0;
+let operatorKeyStarted = 0;
+let operatorPointerStarted = 0;
+let kioskIdleSeconds = 0;
+let inputActivity = false;
+let wakeLock: { release: () => Promise<void> } | null = null;
 
 function getEntries(): LeaderboardEntry[] {
   return board.get(eventKey);
```

### Read src/main.ts [75-380]

### Edited src/main.ts +156 -32

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -113,7 +113,11 @@
 }
 
 function beginRound(): void {
-  round = pressRound(createRound(nextRoundSeed()));
+  const seed = nextRoundSeed();
+  round = pressRound(createRound(seed));
+  duelRound = pressRound(createRound(seed));
+  duelSession = duelEnabled;
+  duelWinner = null;
   screen = 'countdown';
   screenElapsed = 0;
   previousCountdown = 3;

@@ -125,11 +129,17 @@
   debris = [];
   candidateEntry = null;
   highlightedEntry = null;
+  kioskIdleSeconds = 0;
   audio.countdown(3);
 }
 
 function enterResults(): void {
   screenElapsed = 0;
+  if (duelSession) {
+    duelSession = false;
+    screen = 'attract';
+    return;
+  }
   if (candidateEntry) {
     initials = createInitialsState();
     screen = 'initials';

@@ -175,61 +185,151 @@
   }
 }
 
+function noteActivity(): void {
+  inputActivity = true;
+  kioskIdleSeconds = 0;
+}
+
+function openOperatorPanel(): void {
+  operatorOpen = true;
+  operatorConfirmClear = false;
+}
+
+function activateOperator(index: number): void {
+  operatorSelected = index;
+  if (index === 0) {
+    if (operatorConfirmClear) {
+      board.clear(eventKey);
+      highlightedEntry = null;
+      operatorConfirmClear = false;
+    } else {
+      operatorConfirmClear = true;
+    }
+  } else if (index === 1) {
+    operatorConfirmClear = false;
+    audio.toggleMute();
+  } else if (index === 2) {
+    operatorConfirmClear = false;
+    duelEnabled = !duelEnabled;
+  } else {
+    operatorOpen = false;
+    operatorConfirmClear = false;
+  }
+}
+
+function handleOperatorKey(key: string): void {
+  const normalized = key.toLowerCase();
+  if (normalized === 'escape') {
+    operatorOpen = false;
+    operatorConfirmClear = false;
+  } else if (normalized === 'arrowup' || normalized === 'arrowdown') {
+    const direction = normalized === 'arrowup' ? -1 : 1;
+    operatorSelected = (operatorSelected + direction + 4) % 4;
+  } else if (normalized === 'enter' || normalized === ' ' || normalized === 'space') {
+    activateOperator(operatorSelected);
+  } else if (/^[1-4]$/.test(normalized)) {
+    activateOperator(Number(normalized) - 1);
+  }
+}
+
+function handleOperatorPointer(event: PressEvent): void {
+  if (event.source !== 'pointer' || event.y === undefined) return;
+  const bounds = canvas.getBoundingClientRect();
+  const rowTop = bounds.height * 0.39;
+  const rowGap = bounds.height * 0.105;
+  const rowHeight = bounds.height * 0.085;
+  for (let index = 0; index < 4; index += 1) {
+    const center = rowTop + index * rowGap;
+    if (Math.abs(event.y - center) <= rowHeight / 2) {
+      activateOperator(index);
+      return;
+    }
+  }
+}
+
+function dropForPlayer(player: 0 | 1): void {
+  const activeRound = player === 0 ? round : duelRound;
+  if (activeRound.phase !== 'playing' || !activeRound.movingBlock) return;
+  const moving = activeRound.movingBlock;
+  const target = activeRound.blocks[activeRound.blocks.length - 1]!;
+  const result = dropBlock(moving, target, activeRound.perfectStreak, { worldWidth: WORLD_WIDTH });
+  const updated = pressRound(activeRound);
+  if (player === 0) round = updated;
+  else duelRound = updated;
+  audio.drop();
+  if (result.chopped.length > 0) audio.chop();
+  if (!result.landed || !result.block) return;
+  if (result.chopped.length > 0) {
+    debris.push(...result.chopped.map((piece) => ({ piece, floor: updated.floors, age: 0 })));
+  }
+  if (result.perfect) {
+    perfects += 1;
+    perfectText = `P${player + 1} PERFECT x${updated.combo}`;
+    perfectAge = 0;
+    audio.perfect(updated.combo);
+  } else {
+    perfectAge = -1;
+  }
+  if (updated.layerBreaks > activeRound.layerBreaks && !reducedMotion) {
+    layerFlash = 0.8;
+    audio.layerBreak(getRoundSnapshot(updated).layer);
+  }
+}
+
 function onInput(event: PressEvent): void {
   if (event.source === 'keyboard' && ignoreNextKeyboardPress) {
     ignoreNextKeyboardPress = false;
     return;
   }
-  if (event.player !== 0) return;
+  if (operatorOpen) {
+    handleOperatorPointer(event);
+    return;
+  }
   if (screen === 'attract') {
     beginRound();
     return;
   }
   if (screen === 'play') {
-    const moving = round.movingBlock;
-    if (!moving) return;
-    const target = round.blocks[round.blocks.length - 1]!;
-    const result = dropBlock(moving, target, round.perfectStreak, { worldWidth: WORLD_WIDTH });
-    round = pressRound(round);
-    if (round.phase === 'over') {
-      audio.drop();
-      if (result.chopped.length > 0) audio.chop();
-      return;
-    }
-    audio.drop();
-    if (result.chopped.length > 0) {
-      audio.chop();
-      debris.push(...result.chopped.map((piece) => ({ piece, floor: round.floors, age: 0 })));
-    }
-    if (result.perfect) {
-      perfects += 1;
-      perfectText = `PERFECT x${round.combo}`;
-      perfectAge = 0;
-      audio.perfect(round.combo);
-    } else {
-      perfectAge = -1;
-    }
-    if (round.layerBreaks > 0 && round.floors % 6 === 0) {
-      layerFlash = 0.8;
-      audio.layerBreak(getRoundSnapshot(round).layer);
-    }
+    if (event.player === 1 && !duelSession) return;
+    dropForPlayer(event.player);
     return;
   }
   if (screen === 'game-over') {
+    if (duelSession) {
+      duelSession = false;
+      screen = 'attract';
+      screenElapsed = 0;
+      return;
+    }
     enterResults();
     return;
   }
   if (screen === 'leaderboard') {
+    if (event.player !== 0) return;
     screen = 'attract';
     screenElapsed = 0;
     return;
   }
-  if (screen === 'initials' && event.source !== 'keyboard') {
+  if (screen === 'initials' && event.player === 0 && event.source !== 'keyboard') {
     initialsGesture = { started: performance.now(), player: event.player };
   }
 }
 
 function onKey(key: string): void {
+  const normalized = key.toLowerCase();
+  if (operatorOpen) {
+    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup', 'arrowdown'].includes(normalized);
+    handleOperatorKey(key);
+    return;
+  }
+  if (normalized === 'o') {
+    operatorKeyStarted = performance.now();
+    return;
+  }
+  if (normalized === 'd' && screen === 'attract') {
+    duelEnabled = !duelEnabled;
+    return;
+  }
   if (key.toLowerCase() === 'm') {
     audio.toggleMute();
     return;

@@ -243,11 +343,35 @@
   }
 }
 
+const onCornerPointerDown = (event: PointerEvent): void => {
+  const bounds = canvas.getBoundingClientRect();
+  const x = event.clientX - bounds.left;
+  const y = event.clientY - bounds.top;
+  if (x >= 80 || y >= 80) return;
+  event.preventDefault();
+  event.stopImmediatePropagation();
+  operatorPointerStarted = performance.now();
+  noteActivity();
+};
+
+canvas.addEventListener('pointerdown', onCornerPointerDown, true);
+window.addEventListener('pointerup', () => { operatorPointerStarted = 0; });
+window.addEventListener('keyup', (event) => {
+  if (event.key.toLowerCase() === 'o') operatorKeyStarted = 0;
+});
+
 const input: InputController = createInput(canvas, {
-  isDuel: () => false,
+  isDuel: () => duelEnabled || duelSession,
   onPress: onInput,
   onKey,
-  onGesture: () => audio.unlock(),
+  onGesture: () => {
+    audio.unlock();
+    if (!kioskMode) return;
+    const fullscreen = canvas.requestFullscreen?.();
+    if (fullscreen) void fullscreen.catch(() => undefined);
+    void acquireWakeLock();
+  },
+  onActivity: noteActivity,
 });
 
 function updateDemo(dt: number): void {
```

### Edited src/main.ts +41 -3

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -396,6 +396,7 @@
   if (screen !== 'countdown' && screen !== 'play') return;
   const oldPhase = round.phase;
   round = updateRound(round, dt);
+  if (duelSession) duelRound = updateRound(duelRound, dt);
   if (oldPhase === 'countdown' && round.phase === 'countdown') {
     const countdown = Math.ceil(3 - round.phaseElapsed);
     if (countdown < previousCountdown && countdown >= 1) audio.countdown(countdown);

@@ -406,13 +407,28 @@
     audio.countdown(0);
   }
   if (oldPhase === 'playing' && round.phase === 'playing') {
-    const remaining = Math.ceil(round.timeRemaining);
+    const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
+    const remaining = Math.ceil(timerRound.timeRemaining);
     if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
     previousWarningSecond = remaining;
   }
-  if (round.phase === 'over') {
+  if (duelSession) {
+    const outcome = getDuelOutcome(
+      [round.score, duelRound.score],
+      [round.endReason === 'missed', duelRound.endReason === 'missed'],
+      [round.phase === 'over', duelRound.phase === 'over'],
+    );
+    if (outcome.complete && screen !== 'game-over') {
+      duelWinner = outcome.winner;
+      screen = 'game-over';
+      screenElapsed = 0;
+      kioskIdleSeconds = 0;
+      audio.gameOver();
+    }
+  } else if (round.phase === 'over' && oldPhase !== 'over') {
     screen = 'game-over';
     screenElapsed = 0;
+    kioskIdleSeconds = 0;
     audio.gameOver();
     if (isHighScore(round.score)) candidateEntry = { initials: 'AAA', score: round.score, timestamp: Date.now() };
   }

@@ -431,7 +447,21 @@
     screen = 'attract';
     screenElapsed = 0;
   }
-  const currentRound = screen === 'attract' ? demoRound : round;
+  if (kioskMode) {
+    if (inputActivity) kioskIdleSeconds = 0;
+    else if (screen === 'play') kioskIdleSeconds = 0;
+    else kioskIdleSeconds += dt;
+    inputActivity = false;
+    if (shouldReturnToAttract(screen, kioskIdleSeconds)) {
+      screen = 'attract';
+      screenElapsed = 0;
+      duelSession = false;
+      duelWinner = null;
+      candidateEntry = null;
+      kioskIdleSeconds = 0;
+    }
+  }
+  const currentRound = screen === 'attract' ? demoRound : duelSession && round.phase === 'over' ? duelRound : round;
   audio.update(dt, getRoundSnapshot(currentRound).layer, screen === 'attract' || screen === 'countdown' || screen === 'play');
 }
 

@@ -464,9 +494,17 @@
     leaderboard: entries,
     leaderboardIndex: entries.length ? Math.floor(elapsed / 8) % entries.length : 0,
     highlightedEntry,
+    todayBest: entries[0] ?? null,
+    eventName,
     initials: initials.value,
     holdProgress,
     muted: audio.isMuted,
+    reducedMotion,
+    duelMode: duelEnabled,
+    duelRounds: duelSession ? [getRoundSnapshot(round), getRoundSnapshot(duelRound)] : null,
+    duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
+    duelWinner,
+    operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
   };
   renderer.render(scene, dt);
 }
```

### Edited src/input/input.ts +6 -1

#### src/input/input.ts

```diff
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -56,6 +56,7 @@
     if (event.ctrlKey || event.metaKey || event.altKey) return;
     const token = event.key.toLowerCase();
     options.onActivity?.();
+    signalGesture();
     if (heldKeys.has(token)) return;
     heldKeys.add(token);
     options.onKey?.(event.key);

@@ -76,6 +77,7 @@
   const pointerdown = (event: PointerEvent): void => {
     options.onActivity?.();
     const bounds = canvas.getBoundingClientRect();
+    signalGesture();
     const player = routePress({
       source: 'pointer',
       x: event.clientX - bounds.left,

@@ -122,10 +124,13 @@
         const down = pad.buttons
           .map((button, buttonIndex) => button.pressed ? buttonIndex : -1)
           .filter((buttonIndex) => buttonIndex >= 0);
+        if (down.length > 0) {
+          options.onActivity?.();
+          signalGesture();
+        }
         const player = routePress({ source: 'gamepad', index, buttons: down }, options.isDuel());
         if (player === null) continue;
         currentlyHeld[player] = true;
-        if (down.length > 0) options.onActivity?.();
         for (const buttonIndex of down.filter((button) => [0, 1, 2, 3, 9].includes(button))) {
           const buttonId = `${index}:${buttonIndex}`;
           if (pressedGamepadButtons.has(buttonId)) continue;
```

### Edited src/main.ts +25 -7

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -102,6 +102,7 @@
 let kioskIdleSeconds = 0;
 let inputActivity = false;
 let wakeLock: { release: () => Promise<void> } | null = null;
+let kioskGestureStarted = false;
 
 function getEntries(): LeaderboardEntry[] {
   return board.get(eventKey);

@@ -188,8 +189,31 @@
 function noteActivity(): void {
   inputActivity = true;
   kioskIdleSeconds = 0;
+  activateGesture();
 }
 
+async function acquireWakeLock(): Promise<void> {
+  if (!kioskMode || wakeLock) return;
+  const wakeLockNavigator = navigator as Navigator & {
+    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
+  };
+  if (!wakeLockNavigator.wakeLock) return;
+  try {
+    wakeLock = await wakeLockNavigator.wakeLock.request('screen');
+  } catch {
+    wakeLock = null;
+  }
+}
+
+function activateGesture(): void {
+  audio.unlock();
+  if (!kioskMode || kioskGestureStarted) return;
+  kioskGestureStarted = true;
+  const fullscreen = canvas.requestFullscreen?.();
+  if (fullscreen) void fullscreen.catch(() => undefined);
+  void acquireWakeLock();
+}
+
 function openOperatorPanel(): void {
   operatorOpen = true;
   operatorConfirmClear = false;

@@ -364,13 +388,7 @@
   isDuel: () => duelEnabled || duelSession,
   onPress: onInput,
   onKey,
-  onGesture: () => {
-    audio.unlock();
-    if (!kioskMode) return;
-    const fullscreen = canvas.requestFullscreen?.();
-    if (fullscreen) void fullscreen.catch(() => undefined);
-    void acquireWakeLock();
-  },
+  onGesture: activateGesture,
   onActivity: noteActivity,
 });
```

### Edited src/main.ts +25

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -392,6 +392,31 @@
   onActivity: noteActivity,
 });
 
+if (kioskMode) {
+  document.documentElement.classList.add('kiosk');
+  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
+  if (viewport) viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
+  const preventDefault = (event: Event): void => event.preventDefault();
+  document.addEventListener('contextmenu', preventDefault);
+  document.addEventListener('selectstart', preventDefault);
+  document.addEventListener('gesturestart', preventDefault, { passive: false });
+  document.addEventListener('touchmove', (event: TouchEvent) => {
+    if (event.touches.length > 1) event.preventDefault();
+  }, { passive: false });
+  let lastTouchEnd = 0;
+  document.addEventListener('touchend', (event: TouchEvent) => {
+    const now = performance.now();
+    if (now - lastTouchEnd < 320) event.preventDefault();
+    lastTouchEnd = now;
+  }, { passive: false });
+  window.addEventListener('wheel', (event: WheelEvent) => {
+    if (event.ctrlKey) event.preventDefault();
+  }, { passive: false });
+  window.addEventListener('keydown', (event: KeyboardEvent) => {
+    if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '0'].includes(event.key)) event.preventDefault();
+  }, true);
+}
+
 function updateDemo(dt: number): void {
   if (demoRound.phase === 'over') {
     demoResetTimer += dt;
```

### Edited 4 files

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,456 +1,3 @@
-import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
-import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
-import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
-import { getDuelOutcome, type DuelWinner } from './core/duel';
-import { shouldReturnToAttract } from './core/kiosk';
-import { nextRandom } from './core/rng';
-import {
-  createRound,
-  getRoundSnapshot,
-  pressRound,
-  ROUND_SECONDS,
-  updateRound,
-  type RoundState,
-} from './core/round';
-import { dropBlock, WORLD_WIDTH } from './core/stack';
-import { SynthAudio } from './audio/synth';
-import { createInput, type InputController, type PressEvent } from './input/input';
-import { CanvasRenderer, type AppScreen, type DebrisAnimation, type RendererScene } from './render/renderer';
-import packageInfo from '../package.json';
-
-const canvas = document.querySelector<HTMLCanvasElement>('#game');
-if (!canvas) throw new Error('The game canvas is missing.');
-
-const params = new URLSearchParams(window.location.search);
-const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;
-const fixedSeed = parsedSeed !== null && Number.isFinite(parsedSeed) ? parsedSeed >>> 0 : null;
-const eventKey = sanitizeEventKey(params.get('event'));
-const eventName = eventKey;
-const kioskMode = params.get('kiosk') === '1';
-const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
-let seedCursor = fixedSeed ?? (Date.now() >>> 0);
-
-function nextRoundSeed(): number {
-  if (fixedSeed !== null) return fixedSeed;
-  const next = nextRandom(seedCursor);
-  seedCursor = next.seed;
-  return next.seed;
-}
-
-const memory = new Map<string, string>();
-const safeStorage: StorageLike = {
-  getItem(key): string | null {
-    try {
-      return window.localStorage.getItem(key);
-    } catch {
-      return memory.get(key) ?? null;
-    }
-  },
-  setItem(key, value): void {
-    memory.set(key, value);
-    try {
-      window.localStorage.setItem(key, value);
-    } catch {
-      // The in-memory copy keeps the game playable when storage is disabled.
-    }
-  },
-  removeItem(key): void {
-    memory.delete(key);
-    try {
-      window.localStorage.removeItem(key);
-    } catch {
-      // Storage can be unavailable in private or embedded browser contexts.
-    }
-  },
-};
-
-const board = new Leaderboard(safeStorage);
-const audio = new SynthAudio(params.get('mute') === '1');
-const renderer = new CanvasRenderer(canvas);
-const STEP = 1 / 120;
-const INITIAL_HOLD_SECONDS = 0.6;
-
-let screen: AppScreen = 'attract';
-let round: RoundState = createRound(nextRoundSeed());
-let duelRound: RoundState = createRound(round.seed);
-let duelEnabled = params.get('duel') === '1';
-let duelSession = false;
-let duelWinner: DuelWinner | null = null;
-let demoRound = pressRound(createRound(nextRoundSeed()));
-let demoBot: DemoBotState = createDemoBot(nextRoundSeed());
-let demoResetTimer = 0;
-let elapsed = 0;
-let screenElapsed = 0;
-let previousCountdown = 3;
-let previousWarningSecond = ROUND_SECONDS;
-let perfects = 0;
-let perfectText = '';
-let perfectAge = -1;
-let layerFlash = 0;
-let debris: DebrisAnimation[] = [];
-let initials: InitialsState = createInitialsState();
-let initialsGesture: { started: number; player: 0 | 1 } | null = null;
-let holdProgress = 0;
-let highlightedEntry: LeaderboardEntry | null = null;
-let candidateEntry: LeaderboardEntry | null = null;
-let ignoreNextKeyboardPress = false;
-let operatorOpen = false;
-let operatorConfirmClear = false;
-let operatorSelected = 0;
-let operatorKeyStarted = 0;
-let operatorPointerStarted = 0;
-let kioskIdleSeconds = 0;
-let inputActivity = false;
-let wakeLock: { release: () => Promise<void> } | null = null;
-let kioskGestureStarted = false;
-
-function getEntries(): LeaderboardEntry[] {
-  return board.get(eventKey);
-}
-
-function isHighScore(score: number): boolean {
-  const entries = getEntries();
-  return entries.length < 10 || score > (entries[entries.length - 1]?.score ?? -1);
-}
-
-function beginRound(): void {
-  const seed = nextRoundSeed();
-  round = pressRound(createRound(seed));
-  duelRound = pressRound(createRound(seed));
-  duelSession = duelEnabled;
-  duelWinner = null;
-  screen = 'countdown';
-  screenElapsed = 0;
-  previousCountdown = 3;
-  previousWarningSecond = ROUND_SECONDS;
-  perfects = 0;
-  perfectText = '';
-  perfectAge = -1;
-  layerFlash = 0;
-  debris = [];
-  candidateEntry = null;
-  highlightedEntry = null;
-  kioskIdleSeconds = 0;
-  audio.countdown(3);
-}
-
-function enterResults(): void {
-  screenElapsed = 0;
-  if (duelSession) {
-    duelSession = false;
-    screen = 'attract';
-    return;
-  }
-  if (candidateEntry) {
-    initials = createInitialsState();
-    screen = 'initials';
-    audio.highScore();
-  } else {
-    screen = 'leaderboard';
-  }
-}
-
-function saveInitials(): void {
-  if (!initials.complete || screen !== 'initials') return;
-  const entry: LeaderboardEntry = {
-    initials: initials.value,
-    score: round.score,
-    timestamp: Date.now(),
-  };
-  board.add(eventKey, entry);
-  highlightedEntry = entry;
-  candidateEntry = entry;
-  screen = 'leaderboard';
-  screenElapsed = 0;
-}
-
-function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]): void {
-  if (screen !== 'initials' || !initialsGesture) {
-    holdProgress = 0;
-    return;
-  }
-  const duration = Math.max(0, (now - initialsGesture.started) / 1000);
-  const isHeld = holds[initialsGesture.player];
-  holdProgress = Math.min(1, duration / INITIAL_HOLD_SECONDS);
-  if (isHeld && duration >= INITIAL_HOLD_SECONDS) {
-    initials = holdInitials(initials);
-    initialsGesture = null;
-    holdProgress = 0;
-    saveInitials();
-  } else if (!isHeld) {
-    if (duration < INITIAL_HOLD_SECONDS) initials = tapInitials(initials);
-    else initials = holdInitials(initials);
-    initialsGesture = null;
-    holdProgress = 0;
-    saveInitials();
-  }
-}
-
-function noteActivity(): void {
-  inputActivity = true;
-  kioskIdleSeconds = 0;
-  activateGesture();
-}
-
-async function acquireWakeLock(): Promise<void> {
-  if (!kioskMode || wakeLock) return;
-  const wakeLockNavigator = navigator as Navigator & {
-    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
-  };
-  if (!wakeLockNavigator.wakeLock) return;
-  try {
-    wakeLock = await wakeLockNavigator.wakeLock.request('screen');
-  } catch {
-    wakeLock = null;
-  }
-}
-
-function activateGesture(): void {
-  audio.unlock();
-  if (!kioskMode || kioskGestureStarted) return;
-  kioskGestureStarted = true;
-  const fullscreen = canvas.requestFullscreen?.();
-  if (fullscreen) void fullscreen.catch(() => undefined);
-  void acquireWakeLock();
-}
-
-function openOperatorPanel(): void {
-  operatorOpen = true;
-  operatorConfirmClear = false;
-}
-
-function activateOperator(index: number): void {
-  operatorSelected = index;
-  if (index === 0) {
-    if (operatorConfirmClear) {
-      board.clear(eventKey);
-      highlightedEntry = null;
-      operatorConfirmClear = false;
-    } else {
-      operatorConfirmClear = true;
-    }
-  } else if (index === 1) {
-    operatorConfirmClear = false;
-    audio.toggleMute();
-  } else if (index === 2) {
-    operatorConfirmClear = false;
-    duelEnabled = !duelEnabled;
-  } else {
-    operatorOpen = false;
-    operatorConfirmClear = false;
-  }
-}
-
-function handleOperatorKey(key: string): void {
-  const normalized = key.toLowerCase();
-  if (normalized === 'escape') {
-    operatorOpen = false;
-    operatorConfirmClear = false;
-  } else if (normalized === 'arrowup' || normalized === 'arrowdown') {
-    const direction = normalized === 'arrowup' ? -1 : 1;
-    operatorSelected = (operatorSelected + direction + 4) % 4;
-  } else if (normalized === 'enter' || normalized === ' ' || normalized === 'space') {
-    activateOperator(operatorSelected);
-  } else if (/^[1-4]$/.test(normalized)) {
-    activateOperator(Number(normalized) - 1);
-  }
-}
-
-function handleOperatorPointer(event: PressEvent): void {
-  if (event.source !== 'pointer' || event.y === undefined) return;
-  const bounds = canvas.getBoundingClientRect();
-  const rowTop = bounds.height * 0.39;
-  const rowGap = bounds.height * 0.105;
-  const rowHeight = bounds.height * 0.085;
-  for (let index = 0; index < 4; index += 1) {
-    const center = rowTop + index * rowGap;
-    if (Math.abs(event.y - center) <= rowHeight / 2) {
-      activateOperator(index);
-      return;
-    }
-  }
-}
-
-function dropForPlayer(player: 0 | 1): void {
-  const activeRound = player === 0 ? round : duelRound;
-  if (activeRound.phase !== 'playing' || !activeRound.movingBlock) return;
-  const moving = activeRound.movingBlock;
-  const target = activeRound.blocks[activeRound.blocks.length - 1]!;
-  const result = dropBlock(moving, target, activeRound.perfectStreak, { worldWidth: WORLD_WIDTH });
-  const updated = pressRound(activeRound);
-  if (player === 0) round = updated;
-  else duelRound = updated;
-  audio.drop();
-  if (result.chopped.length > 0) audio.chop();
-  if (!result.landed || !result.block) return;
-  if (result.chopped.length > 0) {
-    debris.push(...result.chopped.map((piece) => ({ piece, floor: updated.floors, age: 0 })));
-  }
-  if (result.perfect) {
-    perfects += 1;
-    perfectText = `P${player + 1} PERFECT x${updated.combo}`;
-    perfectAge = 0;
-    audio.perfect(updated.combo);
-  } else {
-    perfectAge = -1;
-  }
-  if (updated.layerBreaks > activeRound.layerBreaks && !reducedMotion) {
-    layerFlash = 0.8;
-    audio.layerBreak(getRoundSnapshot(updated).layer);
-  }
-}
-
-function onInput(event: PressEvent): void {
-  if (event.source === 'keyboard' && ignoreNextKeyboardPress) {
-    ignoreNextKeyboardPress = false;
-    return;
-  }
-  if (operatorOpen) {
-    handleOperatorPointer(event);
-    return;
-  }
-  if (screen === 'attract') {
-    beginRound();
-    return;
-  }
-  if (screen === 'play') {
-    if (event.player === 1 && !duelSession) return;
-    dropForPlayer(event.player);
-    return;
-  }
-  if (screen === 'game-over') {
-    if (duelSession) {
-      duelSession = false;
-      screen = 'attract';
-      screenElapsed = 0;
-      return;
-    }
-    enterResults();
-    return;
-  }
-  if (screen === 'leaderboard') {
-    if (event.player !== 0) return;
-    screen = 'attract';
-    screenElapsed = 0;
-    return;
-  }
-  if (screen === 'initials' && event.player === 0 && event.source !== 'keyboard') {
-    initialsGesture = { started: performance.now(), player: event.player };
-  }
-}
-
-function onKey(key: string): void {
-  const normalized = key.toLowerCase();
-  if (operatorOpen) {
-    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup', 'arrowdown'].includes(normalized);
-    handleOperatorKey(key);
-    return;
-  }
-  if (normalized === 'o') {
-    operatorKeyStarted = performance.now();
-    return;
-  }
-  if (normalized === 'd' && screen === 'attract') {
-    duelEnabled = !duelEnabled;
-    return;
-  }
-  if (key.toLowerCase() === 'm') {
-    audio.toggleMute();
-    return;
-  }
-  if (screen === 'initials') {
-    const normalized = key.toLowerCase();
-    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup'].includes(normalized);
-    initials = typeInitialKey(initials, key);
-    saveInitials();
-    return;
-  }
-}
-
-const onCornerPointerDown = (event: PointerEvent): void => {
-  const bounds = canvas.getBoundingClientRect();
-  const x = event.clientX - bounds.left;
-  const y = event.clientY - bounds.top;
-  if (x >= 80 || y >= 80) return;
-  event.preventDefault();
-  event.stopImmediatePropagation();
-  operatorPointerStarted = performance.now();
-  noteActivity();
-};
-
-canvas.addEventListener('pointerdown', onCornerPointerDown, true);
-window.addEventListener('pointerup', () => { operatorPointerStarted = 0; });
-window.addEventListener('keyup', (event) => {
-  if (event.key.toLowerCase() === 'o') operatorKeyStarted = 0;
-});
-
-const input: InputController = createInput(canvas, {
-  isDuel: () => duelEnabled || duelSession,
-  onPress: onInput,
-  onKey,
-  onGesture: activateGesture,
-  onActivity: noteActivity,
-});
-
-if (kioskMode) {
-  document.documentElement.classList.add('kiosk');
-  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
-  if (viewport) viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
-  const preventDefault = (event: Event): void => event.preventDefault();
-  document.addEventListener('contextmenu', preventDefault);
-  document.addEventListener('selectstart', preventDefault);
-  document.addEventListener('gesturestart', preventDefault, { passive: false });
-  document.addEventListener('touchmove', (event: TouchEvent) => {
-    if (event.touches.length > 1) event.preventDefault();
-  }, { passive: false });
-  let lastTouchEnd = 0;
-  document.addEventListener('touchend', (event: TouchEvent) => {
-    const now = performance.now();
-    if (now - lastTouchEnd < 320) event.preventDefault();
-    lastTouchEnd = now;
-  }, { passive: false });
-  window.addEventListener('wheel', (event: WheelEvent) => {
-    if (event.ctrlKey) event.preventDefault();
-  }, { passive: false });
-  window.addEventListener('keydown', (event: KeyboardEvent) => {
-    if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '0'].includes(event.key)) event.preventDefault();
-  }, true);
-}
-
-function updateDemo(dt: number): void {
-  if (demoRound.phase === 'over') {
-    demoResetTimer += dt;
-    if (demoResetTimer >= 1.4) {
-      demoRound = pressRound(createRound(nextRoundSeed()));
-      demoBot = createDemoBot(nextRoundSeed());
-      demoResetTimer = 0;
-    }
-    return;
-  }
-  demoRound = updateRound(demoRound, dt);
-  if (demoRound.phase !== 'playing' || !demoRound.movingBlock) return;
-  const target = demoRound.blocks[demoRound.blocks.length - 1]!;
-  const decision = updateDemoBot(demoBot, demoRound.movingBlock, target);
-  demoBot = decision.bot;
-  if (decision.shouldPress) demoRound = pressRound(demoRound);
-}
-
-function updateRoundState(dt: number): void {
-  if (screen !== 'countdown' && screen !== 'play') return;
-  const oldPhase = round.phase;
-  round = updateRound(round, dt);
-  if (duelSession) duelRound = updateRound(duelRound, dt);
-  if (oldPhase === 'countdown' && round.phase === 'countdown') {
-    const countdown = Math.ceil(3 - round.phaseElapsed);
-    if (countdown < previousCountdown && countdown >= 1) audio.countdown(countdown);
-    previousCountdown = countdown;
-  }
-  if (oldPhase === 'countdown' && round.phase === 'playing') {
-    screen = 'play';
-    audio.countdown(0);
-  }
-  if (oldPhase === 'playing' && round.phase === 'playing') {
-    const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
     const remaining = Math.ceil(timerRound.timeRemaining);
     if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
     previousWarningSecond = remaining;

@@ -592,3 +139,4 @@
   input.destroy();
   renderer.destroy();
 });
+
```

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -146,7 +146,7 @@
   ): void {
     const ctx = this.context;
     const targetY = ground - targetFloor * blockHeight + this.camera;
-    const movingBottom = ground - movingFloor * blockHeight + this.camera + blockHeight * 0.8;
+    const movingTop = ground - movingFloor * blockHeight + this.camera;
     const edges = [target.x, target.x + target.width];
     ctx.save();
     ctx.strokeStyle = '#e7fbff';

@@ -156,7 +156,7 @@
     for (const edge of edges) {
       const x = left + edge / 100 * width;
       ctx.beginPath();
-      ctx.moveTo(x, movingBottom);
+      ctx.moveTo(x, movingTop);
       ctx.lineTo(x, targetY);
       ctx.stroke();
     }

@@ -487,7 +487,8 @@
       this.text('TAP when the block lines up · PERFECT drops grow it back', centerX, this.height * 0.79, Math.max(14, minSide * 0.035), 'center', '#fff2bd');
     } else if (scene.screen === 'game-over') {
       if (scene.duelRounds && scene.duelWinner) {
-        this.text(`${scene.duelWinner} WINS`, centerX, centerY - minSide * 0.15, big * 1.05, 'center', '#fff2ac');
+        const winnerText = scene.duelWinner === 'DRAW' ? 'DRAW' : `${scene.duelWinner} WINS`;
+        this.text(winnerText, centerX, centerY - minSide * 0.15, big * 1.05, 'center', '#fff2ac');
         this.text(`P1  ${scene.duelRounds[0].score.toLocaleString()}   ·   P2  ${scene.duelRounds[1].score.toLocaleString()}`, centerX, centerY - minSide * 0.015, medium, 'center');
         this.text('DUEL COMPLETE', centerX, centerY + minSide * 0.09, medium * 0.8, 'center', '#d8edff');
       } else {
```

#### tsconfig.json

```diff
--- a/tsconfig.json
+++ b/tsconfig.json
@@ -7,6 +7,7 @@
     "strict": true,
     "noEmit": true,
     "isolatedModules": true,
+    "resolveJsonModule": true,
     "esModuleInterop": true,
     "forceConsistentCasingInFileNames": true,
     "skipLibCheck": true,
```

#### index.html

```diff
--- a/index.html
+++ b/index.html
@@ -22,6 +22,14 @@
         touch-action: none;
         user-select: none;
       }
+
+      html.kiosk,
+      html.kiosk body {
+        cursor: none;
+        user-select: none;
+        -webkit-user-select: none;
+        overscroll-behavior: none;
+      }
     </style>
   </head>
   <body>
```

### Read src/main.ts

### Edited 4 files

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,3 +1,456 @@
+import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
+import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
+import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
+import { getDuelOutcome, type DuelWinner } from './core/duel';
+import { shouldReturnToAttract } from './core/kiosk';
+import { nextRandom } from './core/rng';
+import {
+  createRound,
+  getRoundSnapshot,
+  pressRound,
+  ROUND_SECONDS,
+  updateRound,
+  type RoundState,
+} from './core/round';
+import { dropBlock, WORLD_WIDTH } from './core/stack';
+import { SynthAudio } from './audio/synth';
+import { createInput, type InputController, type PressEvent } from './input/input';
+import { CanvasRenderer, type AppScreen, type DebrisAnimation, type RendererScene } from './render/renderer';
+import packageInfo from '../package.json';
+
+const canvas = document.querySelector<HTMLCanvasElement>('#game');
+if (!canvas) throw new Error('The game canvas is missing.');
+
+const params = new URLSearchParams(window.location.search);
+const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;
+const fixedSeed = parsedSeed !== null && Number.isFinite(parsedSeed) ? parsedSeed >>> 0 : null;
+const eventKey = sanitizeEventKey(params.get('event'));
+const eventName = eventKey;
+const kioskMode = params.get('kiosk') === '1';
+const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
+let seedCursor = fixedSeed ?? (Date.now() >>> 0);
+
+function nextRoundSeed(): number {
+  if (fixedSeed !== null) return fixedSeed;
+  const next = nextRandom(seedCursor);
+  seedCursor = next.seed;
+  return next.seed;
+}
+
+const memory = new Map<string, string>();
+const safeStorage: StorageLike = {
+  getItem(key): string | null {
+    try {
+      return window.localStorage.getItem(key);
+    } catch {
+      return memory.get(key) ?? null;
+    }
+  },
+  setItem(key, value): void {
+    memory.set(key, value);
+    try {
+      window.localStorage.setItem(key, value);
+    } catch {
+      // The in-memory copy keeps the game playable when storage is disabled.
+    }
+  },
+  removeItem(key): void {
+    memory.delete(key);
+    try {
+      window.localStorage.removeItem(key);
+    } catch {
+      // Storage can be unavailable in private or embedded browser contexts.
+    }
+  },
+};
+
+const board = new Leaderboard(safeStorage);
+const audio = new SynthAudio(params.get('mute') === '1');
+const renderer = new CanvasRenderer(canvas);
+const STEP = 1 / 120;
+const INITIAL_HOLD_SECONDS = 0.6;
+
+let screen: AppScreen = 'attract';
+let round: RoundState = createRound(nextRoundSeed());
+let duelRound: RoundState = createRound(round.seed);
+let duelEnabled = params.get('duel') === '1';
+let duelSession = false;
+let duelWinner: DuelWinner | null = null;
+let demoRound = pressRound(createRound(nextRoundSeed()));
+let demoBot: DemoBotState = createDemoBot(nextRoundSeed());
+let demoResetTimer = 0;
+let elapsed = 0;
+let screenElapsed = 0;
+let previousCountdown = 3;
+let previousWarningSecond = ROUND_SECONDS;
+let perfects = 0;
+let perfectText = '';
+let perfectAge = -1;
+let layerFlash = 0;
+let debris: DebrisAnimation[] = [];
+let initials: InitialsState = createInitialsState();
+let initialsGesture: { started: number; player: 0 | 1 } | null = null;
+let holdProgress = 0;
+let highlightedEntry: LeaderboardEntry | null = null;
+let candidateEntry: LeaderboardEntry | null = null;
+let ignoreNextKeyboardPress = false;
+let operatorOpen = false;
+let operatorConfirmClear = false;
+let operatorSelected = 0;
+let operatorKeyStarted = 0;
+let operatorPointerStarted = 0;
+let kioskIdleSeconds = 0;
+let inputActivity = false;
+let wakeLock: { release: () => Promise<void> } | null = null;
+let kioskGestureStarted = false;
+
+function getEntries(): LeaderboardEntry[] {
+  return board.get(eventKey);
+}
+
+function isHighScore(score: number): boolean {
+  const entries = getEntries();
+  return entries.length < 10 || score > (entries[entries.length - 1]?.score ?? -1);
+}
+
+function beginRound(): void {
+  const seed = nextRoundSeed();
+  round = pressRound(createRound(seed));
+  duelRound = pressRound(createRound(seed));
+  duelSession = duelEnabled;
+  duelWinner = null;
+  screen = 'countdown';
+  screenElapsed = 0;
+  previousCountdown = 3;
+  previousWarningSecond = ROUND_SECONDS;
+  perfects = 0;
+  perfectText = '';
+  perfectAge = -1;
+  layerFlash = 0;
+  debris = [];
+  candidateEntry = null;
+  highlightedEntry = null;
+  kioskIdleSeconds = 0;
+  audio.countdown(3);
+}
+
+function enterResults(): void {
+  screenElapsed = 0;
+  if (duelSession) {
+    duelSession = false;
+    screen = 'attract';
+    return;
+  }
+  if (candidateEntry) {
+    initials = createInitialsState();
+    screen = 'initials';
+    audio.highScore();
+  } else {
+    screen = 'leaderboard';
+  }
+}
+
+function saveInitials(): void {
+  if (!initials.complete || screen !== 'initials') return;
+  const entry: LeaderboardEntry = {
+    initials: initials.value,
+    score: round.score,
+    timestamp: Date.now(),
+  };
+  board.add(eventKey, entry);
+  highlightedEntry = entry;
+  candidateEntry = entry;
+  screen = 'leaderboard';
+  screenElapsed = 0;
+}
+
+function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]): void {
+  if (screen !== 'initials' || !initialsGesture) {
+    holdProgress = 0;
+    return;
+  }
+  const duration = Math.max(0, (now - initialsGesture.started) / 1000);
+  const isHeld = holds[initialsGesture.player];
+  holdProgress = Math.min(1, duration / INITIAL_HOLD_SECONDS);
+  if (isHeld && duration >= INITIAL_HOLD_SECONDS) {
+    initials = holdInitials(initials);
+    initialsGesture = null;
+    holdProgress = 0;
+    saveInitials();
+  } else if (!isHeld) {
+    if (duration < INITIAL_HOLD_SECONDS) initials = tapInitials(initials);
+    else initials = holdInitials(initials);
+    initialsGesture = null;
+    holdProgress = 0;
+    saveInitials();
+  }
+}
+
+function noteActivity(): void {
+  inputActivity = true;
+  kioskIdleSeconds = 0;
+  activateGesture();
+}
+
+async function acquireWakeLock(): Promise<void> {
+  if (!kioskMode || wakeLock) return;
+  const wakeLockNavigator = navigator as Navigator & {
+    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
+  };
+  if (!wakeLockNavigator.wakeLock) return;
+  try {
+    wakeLock = await wakeLockNavigator.wakeLock.request('screen');
+  } catch {
+    wakeLock = null;
+  }
+}
+
+function activateGesture(): void {
+  audio.unlock();
+  if (!kioskMode || kioskGestureStarted) return;
+  kioskGestureStarted = true;
+  const fullscreen = canvas.requestFullscreen?.();
+  if (fullscreen) void fullscreen.catch(() => undefined);
+  void acquireWakeLock();
+}
+
+function openOperatorPanel(): void {
+  operatorOpen = true;
+  operatorConfirmClear = false;
+}
+
+function activateOperator(index: number): void {
+  operatorSelected = index;
+  if (index === 0) {
+    if (operatorConfirmClear) {
+      board.clear(eventKey);
+      highlightedEntry = null;
+      operatorConfirmClear = false;
+    } else {
+      operatorConfirmClear = true;
+    }
+  } else if (index === 1) {
+    operatorConfirmClear = false;
+    audio.toggleMute();
+  } else if (index === 2) {
+    operatorConfirmClear = false;
+    duelEnabled = !duelEnabled;
+  } else {
+    operatorOpen = false;
+    operatorConfirmClear = false;
+  }
+}
+
+function handleOperatorKey(key: string): void {
+  const normalized = key.toLowerCase();
+  if (normalized === 'escape') {
+    operatorOpen = false;
+    operatorConfirmClear = false;
+  } else if (normalized === 'arrowup' || normalized === 'arrowdown') {
+    const direction = normalized === 'arrowup' ? -1 : 1;
+    operatorSelected = (operatorSelected + direction + 4) % 4;
+  } else if (normalized === 'enter' || normalized === ' ' || normalized === 'space') {
+    activateOperator(operatorSelected);
+  } else if (/^[1-4]$/.test(normalized)) {
+    activateOperator(Number(normalized) - 1);
+  }
+}
+
+function handleOperatorPointer(event: PressEvent): void {
+  if (event.source !== 'pointer' || event.y === undefined) return;
+  const bounds = canvas.getBoundingClientRect();
+  const rowTop = bounds.height * 0.39;
+  const rowGap = bounds.height * 0.105;
+  const rowHeight = bounds.height * 0.085;
+  for (let index = 0; index < 4; index += 1) {
+    const center = rowTop + index * rowGap;
+    if (Math.abs(event.y - center) <= rowHeight / 2) {
+      activateOperator(index);
+      return;
+    }
+  }
+}
+
+function dropForPlayer(player: 0 | 1): void {
+  const activeRound = player === 0 ? round : duelRound;
+  if (activeRound.phase !== 'playing' || !activeRound.movingBlock) return;
+  const moving = activeRound.movingBlock;
+  const target = activeRound.blocks[activeRound.blocks.length - 1]!;
+  const result = dropBlock(moving, target, activeRound.perfectStreak, { worldWidth: WORLD_WIDTH });
+  const updated = pressRound(activeRound);
+  if (player === 0) round = updated;
+  else duelRound = updated;
+  audio.drop();
+  if (result.chopped.length > 0) audio.chop();
+  if (!result.landed || !result.block) return;
+  if (result.chopped.length > 0) {
+    debris.push(...result.chopped.map((piece) => ({ piece, floor: updated.floors, age: 0 })));
+  }
+  if (result.perfect) {
+    perfects += 1;
+    perfectText = `P${player + 1} PERFECT x${updated.combo}`;
+    perfectAge = 0;
+    audio.perfect(updated.combo);
+  } else {
+    perfectAge = -1;
+  }
+  if (updated.layerBreaks > activeRound.layerBreaks && !reducedMotion) {
+    layerFlash = 0.8;
+    audio.layerBreak(getRoundSnapshot(updated).layer);
+  }
+}
+
+function onInput(event: PressEvent): void {
+  if (event.source === 'keyboard' && ignoreNextKeyboardPress) {
+    ignoreNextKeyboardPress = false;
+    return;
+  }
+  if (operatorOpen) {
+    handleOperatorPointer(event);
+    return;
+  }
+  if (screen === 'attract') {
+    beginRound();
+    return;
+  }
+  if (screen === 'play') {
+    if (event.player === 1 && !duelSession) return;
+    dropForPlayer(event.player);
+    return;
+  }
+  if (screen === 'game-over') {
+    if (duelSession) {
+      duelSession = false;
+      screen = 'attract';
+      screenElapsed = 0;
+      return;
+    }
+    enterResults();
+    return;
+  }
+  if (screen === 'leaderboard') {
+    if (event.player !== 0) return;
+    screen = 'attract';
+    screenElapsed = 0;
+    return;
+  }
+  if (screen === 'initials' && event.player === 0 && event.source !== 'keyboard') {
+    initialsGesture = { started: performance.now(), player: event.player };
+  }
+}
+
+function onKey(key: string): void {
+  const normalized = key.toLowerCase();
+  if (operatorOpen) {
+    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup', 'arrowdown'].includes(normalized);
+    handleOperatorKey(key);
+    return;
+  }
+  if (normalized === 'o') {
+    operatorKeyStarted = performance.now();
+    return;
+  }
+  if (normalized === 'd' && screen === 'attract') {
+    duelEnabled = !duelEnabled;
+    return;
+  }
+  if (key.toLowerCase() === 'm') {
+    audio.toggleMute();
+    return;
+  }
+  if (screen === 'initials') {
+    const normalized = key.toLowerCase();
+    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup'].includes(normalized);
+    initials = typeInitialKey(initials, key);
+    saveInitials();
+    return;
+  }
+}
+
+const onCornerPointerDown = (event: PointerEvent): void => {
+  const bounds = canvas.getBoundingClientRect();
+  const x = event.clientX - bounds.left;
+  const y = event.clientY - bounds.top;
+  if (x >= 80 || y >= 80) return;
+  event.preventDefault();
+  event.stopImmediatePropagation();
+  operatorPointerStarted = performance.now();
+  noteActivity();
+};
+
+canvas.addEventListener('pointerdown', onCornerPointerDown, true);
+window.addEventListener('pointerup', () => { operatorPointerStarted = 0; });
+window.addEventListener('keyup', (event) => {
+  if (event.key.toLowerCase() === 'o') operatorKeyStarted = 0;
+});
+
+const input: InputController = createInput(canvas, {
+  isDuel: () => duelEnabled || duelSession,
+  onPress: onInput,
+  onKey,
+  onGesture: activateGesture,
+  onActivity: noteActivity,
+});
+
+if (kioskMode) {
+  document.documentElement.classList.add('kiosk');
+  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
+  if (viewport) viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
+  const preventDefault = (event: Event): void => event.preventDefault();
+  document.addEventListener('contextmenu', preventDefault);
+  document.addEventListener('selectstart', preventDefault);
+  document.addEventListener('gesturestart', preventDefault, { passive: false });
+  document.addEventListener('touchmove', (event: TouchEvent) => {
+    if (event.touches.length > 1) event.preventDefault();
+  }, { passive: false });
+  let lastTouchEnd = 0;
+  document.addEventListener('touchend', (event: TouchEvent) => {
+    const now = performance.now();
+    if (now - lastTouchEnd < 320) event.preventDefault();
+    lastTouchEnd = now;
+  }, { passive: false });
+  window.addEventListener('wheel', (event: WheelEvent) => {
+    if (event.ctrlKey) event.preventDefault();
+  }, { passive: false });
+  window.addEventListener('keydown', (event: KeyboardEvent) => {
+    if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '0'].includes(event.key)) event.preventDefault();
+  }, true);
+}
+
+function updateDemo(dt: number): void {
+  if (demoRound.phase === 'over') {
+    demoResetTimer += dt;
+    if (demoResetTimer >= 1.4) {
+      demoRound = pressRound(createRound(nextRoundSeed()));
+      demoBot = createDemoBot(nextRoundSeed());
+      demoResetTimer = 0;
+    }
+    return;
+  }
+  demoRound = updateRound(demoRound, dt);
+  if (demoRound.phase !== 'playing' || !demoRound.movingBlock) return;
+  const target = demoRound.blocks[demoRound.blocks.length - 1]!;
+  const decision = updateDemoBot(demoBot, demoRound.movingBlock, target);
+  demoBot = decision.bot;
+  if (decision.shouldPress) demoRound = pressRound(demoRound);
+}
+
+function updateRoundState(dt: number): void {
+  if (screen !== 'countdown' && screen !== 'play') return;
+  const oldPhase = round.phase;
+  round = updateRound(round, dt);
+  if (duelSession) duelRound = updateRound(duelRound, dt);
+  if (oldPhase === 'countdown' && round.phase === 'countdown') {
+    const countdown = Math.ceil(3 - round.phaseElapsed);
+    if (countdown < previousCountdown && countdown >= 1) audio.countdown(countdown);
+    previousCountdown = countdown;
+  }
+  if (oldPhase === 'countdown' && round.phase === 'playing') {
+    screen = 'play';
+    audio.countdown(0);
+  }
+  if (oldPhase === 'playing' && round.phase === 'playing') {
+    const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
     const remaining = Math.ceil(timerRound.timeRemaining);
     if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
     previousWarningSecond = remaining;

@@ -139,4 +592,3 @@
   input.destroy();
   renderer.destroy();
 });
-
```

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
```

#### tsconfig.json

```diff
--- a/tsconfig.json
+++ b/tsconfig.json
@@ -7,7 +7,6 @@
     "strict": true,
     "noEmit": true,
     "isolatedModules": true,
-    "resolveJsonModule": true,
     "esModuleInterop": true,
     "forceConsistentCasingInFileNames": true,
     "skipLibCheck": true,
```

#### index.html

```diff
--- a/index.html
+++ b/index.html
@@ -22,14 +22,6 @@
         touch-action: none;
         user-select: none;
       }
-
-      html.kiosk,
-      html.kiosk body {
-        cursor: none;
-        user-select: none;
-        -webkit-user-select: none;
-        overscroll-behavior: none;
-      }
     </style>
   </head>
   <body>
```

### Read src/main.ts [385-505]

### Edited src/main.ts +4 -2

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -438,6 +438,7 @@
 function updateRoundState(dt: number): void {
   if (screen !== 'countdown' && screen !== 'play') return;
   const oldPhase = round.phase;
+  const oldDuelPhase = duelRound.phase;
   round = updateRound(round, dt);
   if (duelSession) duelRound = updateRound(duelRound, dt);
   if (oldPhase === 'countdown' && round.phase === 'countdown') {

@@ -449,8 +450,9 @@
     screen = 'play';
     audio.countdown(0);
   }
-  if (oldPhase === 'playing' && round.phase === 'playing') {
-    const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
+  const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
+  const timerWasPlaying = duelSession && round.phase === 'over' ? oldDuelPhase === 'playing' : oldPhase === 'playing';
+  if (timerWasPlaying && timerRound.phase === 'playing') {
     const remaining = Math.ceil(timerRound.timeRemaining);
     if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
     previousWarningSecond = remaining;
```

### Read tsconfig.json

### Edited tsconfig.json +1

#### tsconfig.json

```diff
--- a/tsconfig.json
+++ b/tsconfig.json
@@ -7,6 +7,7 @@
     "strict": true,
     "noEmit": true,
     "isolatedModules": true,
+    "resolveJsonModule": true,
     "esModuleInterop": true,
     "forceConsistentCasingInFileNames": true,
     "skipLibCheck": true,
```

### Edited index.html +8

#### index.html

```diff
--- a/index.html
+++ b/index.html
@@ -22,6 +22,14 @@
         touch-action: none;
         user-select: none;
       }
+
+      html.kiosk,
+      html.kiosk body {
+        cursor: none;
+        user-select: none;
+        -webkit-user-select: none;
+        overscroll-behavior: none;
+      }
     </style>
   </head>
   <body>
```

### Read src/render/renderer.ts [128-248]

### Edited src/render/renderer.ts +2 -2

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -146,7 +146,7 @@
   ): void {
     const ctx = this.context;
     const targetY = ground - targetFloor * blockHeight + this.camera;
-    const movingBottom = ground - movingFloor * blockHeight + this.camera + blockHeight * 0.8;
+    const movingTop = ground - movingFloor * blockHeight + this.camera;
     const edges = [target.x, target.x + target.width];
     ctx.save();
     ctx.strokeStyle = '#e7fbff';

@@ -156,7 +156,7 @@
     for (const edge of edges) {
       const x = left + edge / 100 * width;
       ctx.beginPath();
-      ctx.moveTo(x, movingBottom);
+      ctx.moveTo(x, movingTop);
       ctx.lineTo(x, targetY);
       ctx.stroke();
     }
```

### Searched duelWinner|TOWER COMPLETE

```text
src/render/renderer.ts [2—6]
src/render/renderer.ts [44—48]
src/render/renderer.ts [487—497]
```

### Failed to run npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

src/main.ts(100,5): error TS6133: 'operatorKeyStarted' is declared but its value is never read.
src/main.ts(101,5): error TS6133: 'operatorPointerStarted' is declared but its value is never read.
src/main.ts(212,22): error TS18047: 'canvas' is possibly 'null'.
src/main.ts(217,10): error TS6133: 'openOperatorPanel' is declared but its value is never read.
src/main.ts(261,18): error TS18047: 'canvas' is possibly 'null'.
src/main.ts(466,29): error TS2367: This comparison appears to be unintentional because the types '"play" | "countdown"' and '"game-over"' have no overlap.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  11 passed (11)
      Tests  33 passed (33)
   Start at  04:09:48
   Duration  3.44s (transform 263ms, setup 0ms, import 523ms, tests 58ms, environment 1ms)
```

```text
All tests passed: 11 test files and 33 tests.
```

### Read src/main.ts [180-540]

### Edited src/main.ts +5 -3

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -18,8 +18,9 @@
 import { CanvasRenderer, type AppScreen, type DebrisAnimation, type RendererScene } from './render/renderer';
 import packageInfo from '../package.json';
 
-const canvas = document.querySelector<HTMLCanvasElement>('#game');
-if (!canvas) throw new Error('The game canvas is missing.');
+const canvasElement = document.querySelector<HTMLCanvasElement>('#game');
+if (!canvasElement) throw new Error('The game canvas is missing.');
+const canvas: HTMLCanvasElement = canvasElement;
 
 const params = new URLSearchParams(window.location.search);
 const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;

@@ -380,6 +381,7 @@
 
 canvas.addEventListener('pointerdown', onCornerPointerDown, true);
 window.addEventListener('pointerup', () => { operatorPointerStarted = 0; });
+window.addEventListener('pointercancel', () => { operatorPointerStarted = 0; });
 window.addEventListener('keyup', (event) => {
   if (event.key.toLowerCase() === 'o') operatorKeyStarted = 0;
 });

@@ -463,7 +465,7 @@
       [round.endReason === 'missed', duelRound.endReason === 'missed'],
       [round.phase === 'over', duelRound.phase === 'over'],
     );
-    if (outcome.complete && screen !== 'game-over') {
+    if (outcome.complete) {
       duelWinner = outcome.winner;
       screen = 'game-over';
       screenElapsed = 0;
```

### Edited src/main.ts +15

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -571,6 +571,15 @@
   if (lastFrame === 0) lastFrame = now;
   const delta = Math.min(0.25, Math.max(0, now - lastFrame));
   lastFrame = now;
+  const holdNow = performance.now();
+  if (operatorKeyStarted > 0 && holdNow - operatorKeyStarted >= 3000) {
+    operatorKeyStarted = 0;
+    openOperatorPanel();
+  }
+  if (operatorPointerStarted > 0 && holdNow - operatorPointerStarted >= 3000) {
+    operatorPointerStarted = 0;
+    openOperatorPanel();
+  }
   accumulator += delta;
   let steps = 0;
   while (accumulator >= STEP && steps < 30) {

@@ -587,6 +596,12 @@
   if (document.hidden) {
     lastFrame = 0;
     accumulator = 0;
+    if (wakeLock) {
+      void wakeLock.release().catch(() => undefined);
+      wakeLock = null;
+    }
+  } else if (kioskMode) {
+    void acquireWakeLock();
   }
 });
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 20 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.41 kB
dist/assets/index-DN2MnS3m.js  36.26 kB │ gzip: 13.44 kB

✓ built in 151ms
```

```text
The production build completed successfully, including type checking and asset generation.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  11 passed (11)
      Tests  33 passed (33)
   Start at  04:10:23
   Duration  3.42s (transform 212ms, setup 0ms, import 484ms, tests 60ms, environment 1ms)
```

```text
All 33 tests passed across 11 test files.
```

### Read src/core/inputmap.ts

### Read src/core/stack.ts

### Edited src/render/renderer.ts +1 -1

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -215,7 +215,7 @@
     const gap = this.width * 0.055;
     const margin = this.width * 0.025;
     const viewWidth = (this.width - gap - margin * 2) / 2;
-    const labelSize = Math.max(16, minSide * 0.035);
+    const labelSize = Math.max(16, minSide * 0.04);
     const scoreSize = Math.max(24, minSide * 0.058);
     scene.duelRounds.forEach((round, index) => {
       const center = margin + index * (viewWidth + gap) + viewWidth / 2;
```

### Ran git status --short && git diff --stat

```text
 M index.html
 M src/core/leaderboard.ts
 M src/core/round.ts
 M src/core/stack.ts
 M src/input/input.ts
 M src/main.ts
 M src/render/renderer.ts
 M tests/leaderboard.test.ts
 M tests/stack.test.ts
 M tsconfig.json
?? src/core/duel.ts
?? src/core/kiosk.ts
?? tests/duel.test.ts
?? tests/kiosk.test.ts
 index.html                |   8 ++
 src/core/leaderboard.ts   |  11 ++
 src/core/round.ts         |   2 +-
 src/core/stack.ts         |   4 +-
 src/input/input.ts        |  22 +++-
 src/main.ts               | 322 ++++++++++++++++++++++++++++++++++++++++------
 src/render/renderer.ts    | 260 +++++++++++++++++++++++++++++--------
 tests/leaderboard.test.ts |   7 +
 tests/stack.test.ts       |  12 ++
 tsconfig.json             |   1 +
 10 files changed, 552 insertions(+), 97 deletions(-)
```

```text
The working tree contains modifications to existing files and several new duel- and kiosk-related files; the diff reports 552 insertions and 97 deletions.
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 20 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.41 kB
dist/assets/index-BGbNu26q.js  36.26 kB │ gzip: 13.44 kB

✓ built in 102ms
```

```text
The production build completed successfully with no errors.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  11 passed (11)
      Tests  33 passed (33)
   Start at  04:11:24
   Duration  3.41s (transform 217ms, setup 0ms, import 484ms, tests 60ms, environment 1ms)
```

```text
All 33 tests across 11 test files passed.
```

### Searched .junie/guidelines.md

```text
.junie/guidelines.md
```

### Read vite.config.ts

### Read .junie/guidelines.md

### Read src/render/renderer.ts [350-470]

### Edited src/render/renderer.ts +1 -1

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -410,7 +410,7 @@
     ctx.stroke();
     ctx.globalAlpha = 1;
     this.text(`${Math.ceil(round.timeRemaining)}`, centerX, centerY + minSide * 0.015, labelSize * 1.15, 'center');
-    this.text(scene.muted ? 'SOUND OFF · M' : 'SOUND ON · M', this.width - 18, this.height - 18, Math.max(13, labelSize * 0.7), 'right');
+    this.text(scene.muted ? 'SOUND OFF · M' : 'SOUND ON · M', this.width - 18, this.height - 18, labelSize, 'right');
   }
 
   private drawLayerPips(round: RoundSnapshot, minSide: number): void {
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 20 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.41 kB
dist/assets/index-B7CKKNZZ.js  36.24 kB │ gzip: 13.44 kB

✓ built in 148ms
```

```text
The production build completed successfully.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  11 passed (11)
      Tests  33 passed (33)
   Start at  04:12:08
   Duration  3.73s (transform 265ms, setup 0ms, import 588ms, tests 62ms, environment 1ms)
```

```text
All 33 tests across 11 test files passed.
```

## Task result

Implemented the Skyline Stack playtest fixes and booth features without committing changes.

### Changes
- Fixed attract/demo presentation, play-only layer pips, vivid palettes, block alignment guides, and alternating block entry direction.
- Added kiosk protections, fullscreen/wake lock, idle return, event-specific boards and best-score display, plus operator controls.
- Added seeded two-player duels with independent outs and pure winner logic; duel results do not enter the leaderboard.
- Added READY/countdown instructions, reduced-motion handling, and tests for duel, event keys, kiosk timeout, and direction alternation.

### Verification
- `npm test` — 11 files, 33 tests passed.
- `npm run build` — passed.
