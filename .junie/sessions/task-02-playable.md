# Junie CLI session — Task 02: playable game (input, audio, renderer, app shell)

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-035345-19hh

## Prompt given to Junie

```text
Read .junie/guidelines.md and the existing src/core modules. Do TASK 2 of Skyline Stack: make it a complete, polished, playable single-player game in the browser.

1. src/input/input.ts — unified input producing 'press' events (with player index 0/1) and 'hold' state: keyboard (Space, Enter, ArrowUp; in duel: A/S = P1, L/K = P2), pointer/touch anywhere (in duel: left half = P1, right half = P2), Gamepad API polled every frame (any of buttons 0-3 or 9; gamepad 0 = P1, gamepad 1 = P2). 80 ms debounce per player. Keep the press-routing logic in a pure function in src/core/inputmap.ts and unit-test it.
2. src/audio/synth.ts — Web Audio synth created lazily on first user gesture: drop thud, perfect chime whose pitch rises with combo (pentatonic), chop/crumble noise burst, layer-break whoosh + arpeggio, countdown beeps (3,2,1, higher GO), time-warning tick in last 10 s, game-over sting, new-high-score fanfare, soft procedural background pad/arp loop that speeds up with layer. Master gain + mute toggle (M key). No audio files.
3. src/render/renderer.ts — canvas renderer, devicePixelRatio aware, resizes with the window, portrait AND landscape. Camera eases upward so the top of the tower stays at ~60% height. Sky: vertical gradient per layer palette (dusk city -> haze -> blue -> cloud deck -> high cirrus -> violet stratosphere -> starfield -> aurora -> golden 'Cloud Nine' glow); 3 parallax cloud bands drawn procedurally; stars from layer 7. Blocks: rounded slabs with a light top edge and slight 3D side face, hue shifting with floor index; chopped debris falls and rotates with gravity; perfect drop = expanding ring + 'PERFECT x{combo}' text (shape + text, not only colour); layer break = full-width banner 'LAYER {n}: {name}' and a flash. HUD: big score, floors, 60 s timer ring (turns warning colour + pulses under 10 s), current layer progress bar showing 9 layer pips. All text sizes derived from min(viewport w,h); use system-ui font, bold, high contrast with dark outline.
4. src/main.ts — app shell with screens: ATTRACT (title 'SKYLINE STACK', subtitle 'Stack to Cloud Nine', blinking 'TAP / PRESS ANY BUTTON', demo-bot playing in background using src/core/attract.ts, cycling with the top-10 leaderboard every 8 s), COUNTDOWN, PLAY, GAME OVER (reason, score breakdown: floors, perfects, layers, time bonus), INITIALS (if top-10: one-button entry via src/core/initials.ts — tap to cycle letter, hold 0.6 s to confirm; keyboard typing also works), LEADERBOARD (highlight the new entry), back to ATTRACT after 10 s or on press. Fixed-timestep loop (1/120 s) with requestAnimationFrame; pause when the tab is hidden. Leaderboard persisted in localStorage via the injected storage interface. Readable from 3 metres.
5. Respect URL params ?seed=N and ?mute=1 now (kiosk/event/duel/operator come in the next task, but structure the code so they plug in).
6. Add/extend vitest tests for any new pure logic (inputmap, any helper math such as camera easing or palette interpolation you put in src/core). Run `npm test` and `npm run build` until both pass. Do not commit. Do not create files outside this directory.
```

## Junie transcript (verbatim export)

# Session transcript

### Searched src/**/*.ts

```text
src/core/attract.ts
src/core/initials.ts
src/core/layers.ts
src/core/leaderboard.ts
src/core/rng.ts
src/core/round.ts
src/core/scoring.ts
src/core/stack.ts
src/main.ts
```

### Searched tests/**/*

```text
tests/attract.test.ts
tests/initials.test.ts
tests/layers.test.ts
tests/leaderboard.test.ts
tests/rng.test.ts
tests/round.test.ts
tests/scoring.test.ts
tests/stack.test.ts
```

### Read .junie/guidelines.md

### Read vite.config.ts

### Read package.json

### Searched **/*.{html,css,ts}

```text
index.html
src/core/attract.ts
src/core/initials.ts
src/core/layers.ts
src/core/leaderboard.ts
src/core/rng.ts
src/core/round.ts
src/core/scoring.ts
src/core/stack.ts
src/main.ts
tests/attract.test.ts
tests/initials.test.ts
tests/layers.test.ts
tests/leaderboard.test.ts
tests/rng.test.ts
tests/round.test.ts
tests/scoring.test.ts
tests/stack.test.ts
vite.config.ts
```

### Read src/core/layers.ts

### Read src/core/stack.ts

### Read src/core/initials.ts

### Read src/core/leaderboard.ts

### Read src/core/scoring.ts

### Read tsconfig.json

### Read src/core/round.ts

### Read src/core/attract.ts

### Read src/main.ts

### Read tests/initials.test.ts

### Read tests/round.test.ts

### Read src/core/rng.ts

### Read tests/attract.test.ts

### Ran git status --short

```text
The working tree is clean, with no reported changes.
```

### Read index.html

### Edited 4 files

#### src/core/inputmap.ts

```diff
--- a/src/core/inputmap.ts
+++ b/src/core/inputmap.ts
@@ -1,0 +1,34 @@
+export type PlayerIndex = 0 | 1;
+
+export type InputRoute =
+  | { source: 'keyboard'; key: string }
+  | { source: 'pointer'; x: number; width: number }
+  | { source: 'gamepad'; index: number; buttons: readonly number[] };
+
+const COMMON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
+const PLAYER_ONE_KEYS = new Set(['a', 's']);
+const PLAYER_TWO_KEYS = new Set(['l', 'k']);
+const GAMEPLAY_BUTTONS = new Set([0, 1, 2, 3, 9]);
+
+/** Maps a physical input to a player without depending on browser state. */
+export function routePress(input: InputRoute, duel: boolean): PlayerIndex | null {
+  if (input.source === 'keyboard') {
+    const key = input.key.toLowerCase();
+    if (COMMON_KEYS.has(key)) return 0;
+    if (!duel) return null;
+    if (PLAYER_ONE_KEYS.has(key)) return 0;
+    if (PLAYER_TWO_KEYS.has(key)) return 1;
+    return null;
+  }
+
+  if (input.source === 'pointer') {
+    if (!duel) return 0;
+    if (!Number.isFinite(input.x) || !Number.isFinite(input.width) || input.width <= 0) return null;
+    return input.x < input.width / 2 ? 0 : 1;
+  }
+
+  if (!input.buttons.some((button) => GAMEPLAY_BUTTONS.has(button))) return null;
+  if (input.index === 0) return 0;
+  if (duel && input.index === 1) return 1;
+  return null;
+}
```

#### tests/inputmap.test.ts

```diff
--- a/tests/inputmap.test.ts
+++ b/tests/inputmap.test.ts
@@ -1,0 +1,25 @@
+import { describe, expect, it } from 'vitest';
+import { routePress } from '../src/core/inputmap';
+
+describe('pure input routing', () => {
+  it('routes common keyboard controls to player one and ignores duel-only keys', () => {
+    expect(routePress({ source: 'keyboard', key: 'ArrowUp' }, false)).toBe(0);
+    expect(routePress({ source: 'keyboard', key: 'A' }, false)).toBeNull();
+    expect(routePress({ source: 'keyboard', key: 's' }, true)).toBe(0);
+    expect(routePress({ source: 'keyboard', key: 'K' }, true)).toBe(1);
+  });
+
+  it('splits pointer input at the midpoint only in duel mode', () => {
+    expect(routePress({ source: 'pointer', x: 8, width: 100 }, false)).toBe(0);
+    expect(routePress({ source: 'pointer', x: 49, width: 100 }, true)).toBe(0);
+    expect(routePress({ source: 'pointer', x: 50, width: 100 }, true)).toBe(1);
+    expect(routePress({ source: 'pointer', x: 1, width: 0 }, true)).toBeNull();
+  });
+
+  it('accepts only supported gamepad buttons and player assignments', () => {
+    expect(routePress({ source: 'gamepad', index: 0, buttons: [9] }, true)).toBe(0);
+    expect(routePress({ source: 'gamepad', index: 1, buttons: [2] }, true)).toBe(1);
+    expect(routePress({ source: 'gamepad', index: 1, buttons: [2] }, false)).toBeNull();
+    expect(routePress({ source: 'gamepad', index: 0, buttons: [4] }, false)).toBeNull();
+  });
+});
```

#### src/input/input.ts

```diff
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -1,0 +1,148 @@
+import { routePress, type PlayerIndex } from '../core/inputmap';
+
+export interface PressEvent {
+  type: 'press';
+  player: PlayerIndex;
+  source: 'keyboard' | 'pointer' | 'gamepad';
+  key?: string;
+}
+
+export interface InputOptions {
+  isDuel: () => boolean;
+  onPress: (event: PressEvent) => void;
+  onKey?: (key: string) => void;
+  onGesture?: () => void;
+}
+
+export interface InputController {
+  pollGamepads(): void;
+  getHoldState(): readonly [boolean, boolean];
+  destroy(): void;
+}
+
+const DEBOUNCE_MS = 80;
+
+export function createInput(canvas: HTMLCanvasElement, options: InputOptions): InputController {
+  const keyPlayers = new Map<string, PlayerIndex>();
+  const heldPointers = new Map<number, PlayerIndex>();
+  const heldGamepads: [boolean, boolean] = [false, false];
+  const lastPress = [-Infinity, -Infinity];
+  const pressedGamepadButtons = new Set<string>();
+  const heldKeys = new Set<string>();
+  let gestureStarted = false;
+
+  const signalGesture = (): void => {
+    if (gestureStarted) return;
+    gestureStarted = true;
+    options.onGesture?.();
+  };
+
+  const emit = (player: PlayerIndex, source: PressEvent['source'], key?: string): void => {
+    const now = performance.now();
+    if (now - lastPress[player] < DEBOUNCE_MS) return;
+    lastPress[player] = now;
+    options.onPress({ type: 'press', player, source, ...(key ? { key } : {}) });
+  };
+
+  const keydown = (event: KeyboardEvent): void => {
+    if (event.ctrlKey || event.metaKey || event.altKey) return;
+    options.onKey?.(event.key);
+    const token = event.key.toLowerCase();
+    if (heldKeys.has(token)) return;
+    const player = routePress({ source: 'keyboard', key: event.key }, options.isDuel());
+    if (player === null) return;
+    event.preventDefault();
+    heldKeys.add(token);
+    keyPlayers.set(token, player);
+    signalGesture();
+    emit(player, 'keyboard', event.key);
+  };
+
+  const keyup = (event: KeyboardEvent): void => {
+    const token = event.key.toLowerCase();
+    heldKeys.delete(token);
+    keyPlayers.delete(token);
+  };
+
+  const pointerdown = (event: PointerEvent): void => {
+    const bounds = canvas.getBoundingClientRect();
+    const player = routePress({
+      source: 'pointer',
+      x: event.clientX - bounds.left,
+      width: bounds.width,
+    }, options.isDuel());
+    if (player === null) return;
+    event.preventDefault();
+    heldPointers.set(event.pointerId, player);
+    try {
+      canvas.setPointerCapture(event.pointerId);
+    } catch {
+      // Capture is unavailable for some synthetic and browser-generated events.
+    }
+    signalGesture();
+    emit(player, 'pointer');
+  };
+
+  const pointerup = (event: PointerEvent): void => {
+    heldPointers.delete(event.pointerId);
+  };
+
+  const contextmenu = (event: Event): void => event.preventDefault();
+
+  window.addEventListener('keydown', keydown);
+  window.addEventListener('keyup', keyup);
+  canvas.addEventListener('pointerdown', pointerdown);
+  window.addEventListener('pointerup', pointerup);
+  window.addEventListener('pointercancel', pointerup);
+  canvas.addEventListener('contextmenu', contextmenu);
+
+  return {
+    pollGamepads(): void {
+      const pads = navigator.getGamepads?.();
+      const currentlyHeld: [boolean, boolean] = [false, false];
+      if (!pads) return;
+      for (let index = 0; index < pads.length; index += 1) {
+        const pad = pads[index];
+        if (!pad || !pad.connected) continue;
+        const down = pad.buttons
+          .map((button, buttonIndex) => button.pressed ? buttonIndex : -1)
+          .filter((buttonIndex) => buttonIndex >= 0);
+        const player = routePress({ source: 'gamepad', index, buttons: down }, options.isDuel());
+        if (player === null) continue;
+        currentlyHeld[player] = true;
+        for (const buttonIndex of down) {
+          const buttonId = `${index}:${buttonIndex}`;
+          if (pressedGamepadButtons.has(buttonId)) continue;
+          pressedGamepadButtons.add(buttonId);
+          signalGesture();
+          emit(player, 'gamepad');
+        }
+      }
+      for (const buttonId of pressedGamepadButtons) {
+        const [padIndexText, buttonText] = buttonId.split(':');
+        const pad = pads[Number(padIndexText)];
+        if (!pad?.buttons[Number(buttonText)]?.pressed) pressedGamepadButtons.delete(buttonId);
+      }
+      heldGamepads[0] = currentlyHeld[0];
+      heldGamepads[1] = currentlyHeld[1];
+    },
+    getHoldState(): readonly [boolean, boolean] {
+      return [
+        keyPlayersHas(0) || [...heldPointers.values()].includes(0) || heldGamepads[0],
+        keyPlayersHas(1) || [...heldPointers.values()].includes(1) || heldGamepads[1],
+      ];
+    },
+    destroy(): void {
+      window.removeEventListener('keydown', keydown);
+      window.removeEventListener('keyup', keyup);
+      canvas.removeEventListener('pointerdown', pointerdown);
+      window.removeEventListener('pointerup', pointerup);
+      window.removeEventListener('pointercancel', pointerup);
+      canvas.removeEventListener('contextmenu', contextmenu);
+    },
+  };
+
+  function keyPlayersHas(player: PlayerIndex): boolean {
+    return [...keyPlayers.values()].includes(player);
+  }
+}
```

#### src/audio/synth.ts

```diff
--- a/src/audio/synth.ts
+++ b/src/audio/synth.ts
@@ -1,0 +1,164 @@
+const PENTATONIC = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
+
+export class SynthAudio {
+  private context: AudioContext | null = null;
+  private master: GainNode | null = null;
+  private muted: boolean;
+  private musicElapsed = 0;
+  private musicStep = 0;
+
+  constructor(muted = false) {
+    this.muted = muted;
+  }
+
+  get isMuted(): boolean {
+    return this.muted;
+  }
+
+  unlock(): void {
+    const context = this.ensureContext();
+    if (context.state === 'suspended') void context.resume().catch(() => undefined);
+  }
+
+  toggleMute(): boolean {
+    this.setMuted(!this.muted);
+    return this.muted;
+  }
+
+  setMuted(muted: boolean): void {
+    this.muted = muted;
+    if (this.master && this.context) {
+      this.master.gain.setTargetAtTime(muted ? 0 : 0.72, this.context.currentTime, 0.025);
+    }
+  }
+
+  drop(): void {
+    const context = this.readyContext();
+    if (!context) return;
+    this.tone(88, 0.18, 'triangle', 0.34, 0.045);
+    this.tone(48, 0.23, 'sine', 0.23, 0.04);
+  }
+
+  perfect(combo: number): void {
+    const context = this.readyContext();
+    if (!context) return;
+    const base = 520 * 2 ** (PENTATONIC[Math.max(0, combo - 1) % PENTATONIC.length]! / 12);
+    this.tone(base, 0.22, 'sine', 0.19, 0.015);
+    this.tone(base * 1.5, 0.28, 'sine', 0.12, 0.07);
+  }
+
+  chop(): void {
+    const context = this.readyContext();
+    if (!context) return;
+    const length = Math.floor(context.sampleRate * 0.16);
+    const buffer = context.createBuffer(1, length, context.sampleRate);
+    const channel = buffer.getChannelData(0);
+    let seed = 0x51a7;
+    for (let index = 0; index < length; index += 1) {
+      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
+      channel[index] = (seed / 0x80000000 - 1) * (1 - index / length);
+    }
+    const source = context.createBufferSource();
+    const filter = context.createBiquadFilter();
+    const gain = context.createGain();
+    source.buffer = buffer;
+    filter.type = 'lowpass';
+    filter.frequency.value = 900;
+    gain.gain.setValueAtTime(0.2, context.currentTime);
+    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.16);
+    source.connect(filter).connect(gain).connect(this.master!);
+    source.start();
+    source.stop(context.currentTime + 0.17);
+  }
+
+  layerBreak(layer: number): void {
+    const context = this.readyContext();
+    if (!context) return;
+    const source = context.createOscillator();
+    const gain = context.createGain();
+    source.type = 'sawtooth';
+    source.frequency.setValueAtTime(280, context.currentTime);
+    source.frequency.exponentialRampToValueAtTime(780, context.currentTime + 0.48);
+    gain.gain.setValueAtTime(0.11, context.currentTime);
+    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
+    source.connect(gain).connect(this.master!);
+    source.start();
+    source.stop(context.currentTime + 0.51);
+    [0, 4, 7].forEach((step, index) => {
+      this.tone(330 * 2 ** ((step + Math.min(layer, 9)) / 12), 0.32, 'sine', 0.12, index * 0.09);
+    });
+  }
+
+  countdown(value: number): void {
+    this.tone(value <= 0 ? 880 : 480 + (3 - value) * 70, value <= 0 ? 0.36 : 0.15, 'sine', 0.18);
+  }
+
+  warning(): void {
+    this.tone(740, 0.07, 'square', 0.08);
+  }
+
+  gameOver(): void {
+    [392, 330, 262].forEach((frequency, index) => {
+      this.tone(frequency, 0.42, 'triangle', 0.18, index * 0.16);
+    });
+  }
+
+  highScore(): void {
+    [523, 659, 784, 1047].forEach((frequency, index) => {
+      this.tone(frequency, 0.36, 'sine', 0.17, index * 0.11);
+    });
+  }
+
+  update(dt: number, layer: number, musicEnabled: boolean): void {
+    if (!musicEnabled || this.muted || !this.context) return;
+    this.musicElapsed += dt;
+    const interval = Math.max(0.2, 0.62 - Math.max(0, layer - 1) * 0.045);
+    while (this.musicElapsed >= interval) {
+      this.musicElapsed -= interval;
+      const scale = [0, 2, 4, 7, 9];
+      const step = this.musicStep % scale.length;
+      const octave = this.musicStep % 8 === 0 ? 0 : 12;
+      this.tone(196 * 2 ** ((scale[step]! + octave) / 12), 0.55, 'sine', 0.045);
+      if (this.musicStep % 4 === 0) this.tone(98, 1.2, 'triangle', 0.035);
+      this.musicStep += 1;
+    }
+  }
+
+  private ensureContext(): AudioContext | null {
+    if (this.context) return this.context;
+    const AudioContextConstructor = window.AudioContext;
+    if (!AudioContextConstructor) return null;
+    this.context = new AudioContextConstructor();
+    this.master = this.context.createGain();
+    this.master.gain.value = this.muted ? 0 : 0.72;
+    this.master.connect(this.context.destination);
+    return this.context;
+  }
+
+  private readyContext(): AudioContext | null {
+    if (this.muted) return null;
+    return this.ensureContext();
+  }
+
+  private tone(
+    frequency: number,
+    duration: number,
+    type: OscillatorType,
+    volume: number,
+    delay = 0,
+  ): void {
+    if (this.muted || !this.context || !this.master) return;
+    const context = this.context;
+    const start = context.currentTime + delay;
+    const oscillator = context.createOscillator();
+    const gain = context.createGain();
+    oscillator.type = type;
+    oscillator.frequency.setValueAtTime(frequency, start);
+    gain.gain.setValueAtTime(0.0001, start);
+    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.018);
+    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
+    oscillator.connect(gain).connect(this.master);
+    oscillator.start(start);
+    oscillator.stop(start + duration + 0.02);
+  }
+}
```

### Edited src/render/renderer.ts +449

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -1,0 +1,449 @@
+import { SKY_LAYERS } from '../core/layers';
+import type { RoundSnapshot } from '../core/round';
+import type { Block, DebrisPiece } from '../core/stack';
+import type { LeaderboardEntry } from '../core/leaderboard';
+
+export type AppScreen = 'attract' | 'countdown' | 'play' | 'game-over' | 'initials' | 'leaderboard';
+
+export interface DebrisAnimation {
+  piece: DebrisPiece;
+  floor: number;
+  age: number;
+}
+
+export interface ScoreBreakdown {
+  floors: number;
+  perfects: number;
+  perfectBonus: number;
+  layers: number;
+  layerBonus: number;
+  timeBonus: number;
+  summitBonus: number;
+}
+
+export interface RendererScene {
+  screen: AppScreen;
+  round: RoundSnapshot;
+  displayRound: RoundSnapshot;
+  elapsed: number;
+  debris: readonly DebrisAnimation[];
+  perfectText: string;
+  perfectAge: number;
+  layerFlash: number;
+  breakdown: ScoreBreakdown;
+  leaderboard: readonly LeaderboardEntry[];
+  leaderboardIndex: number;
+  highlightedEntry: LeaderboardEntry | null;
+  initials: string;
+  holdProgress: number;
+  muted: boolean;
+}
+
+interface Palette {
+  top: string;
+  bottom: string;
+  glow: string;
+}
+
+const PALETTES: readonly Palette[] = [
+  { top: '#34274f', bottom: '#ed8a74', glow: '#ffc394' },
+  { top: '#62435e', bottom: '#f0a2a3', glow: '#ffe0c0' },
+  { top: '#56769c', bottom: '#f5bc8b', glow: '#fff0bd' },
+  { top: '#3e729c', bottom: '#b3d9e8', glow: '#ecfbff' },
+  { top: '#23577e', bottom: '#86c6e2', glow: '#d9f5ff' },
+  { top: '#263b75', bottom: '#a4b9de', glow: '#f0f7ff' },
+  { top: '#171f4e', bottom: '#586eae', glow: '#cad8ff' },
+  { top: '#172d60', bottom: '#51b9bb', glow: '#d5ffe8' },
+  { top: '#483b83', bottom: '#f4c783', glow: '#fff4bd' },
+];
+
+export class CanvasRenderer {
+  private readonly context: CanvasRenderingContext2D;
+  private width = 1;
+  private height = 1;
+  private camera = 0;
+  private lastDpr = 0;
+
+  constructor(private readonly canvas: HTMLCanvasElement) {
+    const context = canvas.getContext('2d');
+    if (!context) throw new Error('Canvas 2D is not available.');
+    this.context = context;
+    this.resize();
+    window.addEventListener('resize', this.resize);
+  }
+
+  destroy(): void {
+    window.removeEventListener('resize', this.resize);
+  }
+
+  render(scene: RendererScene, dt: number): void {
+    this.resize();
+    const ctx = this.context;
+    const minSide = Math.min(this.width, this.height);
+    const round = scene.screen === 'attract' ? scene.displayRound : scene.round;
+    const layerIndex = Math.max(0, Math.min(8, round.layer - 1));
+    const palette = PALETTES[layerIndex]!;
+    const blockHeight = Math.max(16, minSide * 0.045);
+    const contentWidth = this.width * 0.84;
+    const contentLeft = this.width * 0.08;
+    const ground = this.height * 0.89;
+    const targetCamera = Math.max(0, round.floors * blockHeight - this.height * 0.3);
+    this.camera += (targetCamera - this.camera) * (1 - Math.exp(-Math.max(0, dt) * 2.4));
+
+    this.drawSky(palette, round.layer, scene.elapsed);
+    this.drawClouds(scene.elapsed);
+    if (round.layer >= 7) this.drawStars(scene.elapsed, palette.glow);
+
+    for (let index = 0; index < round.blocks.length; index += 1) {
+      const block = round.blocks[index]!;
+      this.drawBlock(block, index, contentLeft, contentWidth, ground, blockHeight, minSide);
+    }
+    if (round.movingBlock && (scene.screen === 'play' || scene.screen === 'countdown')) {
+      this.drawBlock(
+        round.movingBlock,
+        round.floors + 1,
+        contentLeft,
+        contentWidth,
+        ground,
+        blockHeight,
+        minSide,
+        true,
+      );
+    }
+    this.drawDebris(scene.debris, contentLeft, contentWidth, ground, blockHeight);
+    this.drawHud(round, scene, minSide);
+    this.drawLayerPips(round, minSide);
+
+    if (scene.perfectAge >= 0 && scene.perfectAge < 1.15) this.drawPerfect(scene, minSide);
+    if (scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
+    this.drawScreen(scene, minSide);
+  }
+
+  private resize = (): void => {
+    const bounds = this.canvas.getBoundingClientRect();
+    const dpr = Math.min(2.5, window.devicePixelRatio || 1);
+    this.width = Math.max(1, bounds.width || window.innerWidth);
+    this.height = Math.max(1, bounds.height || window.innerHeight);
+    if (dpr === this.lastDpr && this.canvas.width === Math.round(this.width * dpr)
+      && this.canvas.height === Math.round(this.height * dpr)) return;
+    this.lastDpr = dpr;
+    this.canvas.width = Math.round(this.width * dpr);
+    this.canvas.height = Math.round(this.height * dpr);
+    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
+  };
+
+  private drawSky(palette: Palette, layer: number, elapsed: number): void {
+    const ctx = this.context;
+    const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
+    gradient.addColorStop(0, palette.top);
+    gradient.addColorStop(0.58, palette.bottom);
+    gradient.addColorStop(1, layer === 9 ? '#fbe6ae' : palette.glow);
+    ctx.fillStyle = gradient;
+    ctx.fillRect(0, 0, this.width, this.height);
+
+    const glowX = this.width * (0.72 + Math.sin(elapsed * 0.08) * 0.04);
+    const glow = ctx.createRadialGradient(glowX, this.height * 0.52, 0, glowX, this.height * 0.52, this.width * 0.55);
+    glow.addColorStop(0, `${palette.glow}55`);
+    glow.addColorStop(1, `${palette.glow}00`);
+    ctx.fillStyle = glow;
+    ctx.fillRect(0, 0, this.width, this.height);
+
+    if (layer === 1) this.drawCitySilhouette();
+  }
+
+  private drawCitySilhouette(): void {
+    const ctx = this.context;
+    const baseY = this.height * 0.88;
+    ctx.fillStyle = '#20274799';
+    const buildings = 22;
+    for (let index = 0; index < buildings; index += 1) {
+      const width = this.width / buildings + 1;
+      const height = this.height * (0.035 + ((index * 37) % 80) / 1000);
+      ctx.fillRect(index * width, baseY - height, width, height);
+      if (index % 3 === 0) {
+        ctx.fillStyle = '#ffd8a966';
+        ctx.fillRect(index * width + width * 0.35, baseY - height * 0.72, 3, 5);
+        ctx.fillStyle = '#20274799';
+      }
+    }
+  }
+
+  private drawClouds(elapsed: number): void {
+    const ctx = this.context;
+    const bands = [
+      { y: 0.3, scale: 0.7, speed: 5, opacity: 0.13, size: 0.19 },
+      { y: 0.48, scale: 1, speed: 11, opacity: 0.2, size: 0.25 },
+      { y: 0.69, scale: 1.4, speed: 18, opacity: 0.25, size: 0.32 },
+    ];
+    for (const [bandIndex, band] of bands.entries()) {
+      const spacing = this.width * band.size;
+      const shift = (elapsed * band.speed * band.scale) % spacing;
+      for (let index = -1; index < Math.ceil(this.width / spacing) + 1; index += 1) {
+        const x = index * spacing - shift + spacing * 0.5;
+        const y = this.height * band.y + Math.sin(index * 2.3 + bandIndex) * this.height * 0.018;
+        this.drawCloud(x, y, spacing * 0.8, this.height * 0.055 * band.scale, band.opacity);
+      }
+    }
+  }
+
+  private drawCloud(x: number, y: number, width: number, height: number, opacity: number): void {
+    const ctx = this.context;
+    ctx.save();
+    ctx.fillStyle = `rgba(255,255,255,${opacity})`;
+    ctx.beginPath();
+    ctx.ellipse(x, y, width * 0.48, height * 0.38, 0, 0, Math.PI * 2);
+    ctx.ellipse(x - width * 0.2, y + height * 0.08, width * 0.25, height * 0.35, 0, 0, Math.PI * 2);
+    ctx.ellipse(x + width * 0.16, y - height * 0.1, width * 0.28, height * 0.48, 0, 0, Math.PI * 2);
+    ctx.fill();
+    ctx.restore();
+  }
+
+  private drawStars(elapsed: number, color: string): void {
+    const ctx = this.context;
+    for (let index = 0; index < 70; index += 1) {
+      const x = ((index * 97.31) % 997) / 997 * this.width;
+      const y = ((index * 61.77) % 991) / 991 * this.height * 0.66;
+      const alpha = 0.35 + (Math.sin(elapsed * 2 + index) + 1) * 0.3;
+      ctx.fillStyle = color;
+      ctx.globalAlpha = alpha;
+      ctx.beginPath();
+      ctx.arc(x, y, index % 9 === 0 ? 2 : 1, 0, Math.PI * 2);
+      ctx.fill();
+    }
+    ctx.globalAlpha = 1;
+  }
+
+  private drawBlock(
+    block: Block,
+    floor: number,
+    left: number,
+    width: number,
+    ground: number,
+    blockHeight: number,
+    minSide: number,
+    moving = false,
+  ): void {
+    const x = left + block.x / 100 * width;
+    const slabWidth = block.width / 100 * width;
+    const y = ground - floor * blockHeight + this.camera;
+    if (y < -blockHeight * 2 || y > this.height + blockHeight) return;
+    const hue = (190 + floor * 19) % 360;
+    const radius = Math.max(3, minSide * 0.008);
+    const sideDepth = Math.max(4, blockHeight * 0.16);
+    const ctx = this.context;
+    ctx.save();
+    if (moving) ctx.shadowColor = `hsla(${hue},90%,75%,0.6)`;
+    ctx.shadowBlur = moving ? minSide * 0.025 : minSide * 0.008;
+    ctx.fillStyle = `hsl(${hue} 72% 34%)`;
+    ctx.beginPath();
+    ctx.moveTo(x + radius, y + blockHeight - sideDepth);
+    ctx.lineTo(x + slabWidth - radius, y + blockHeight - sideDepth);
+    ctx.lineTo(x + slabWidth, y + blockHeight);
+    ctx.lineTo(x, y + blockHeight);
+    ctx.closePath();
+    ctx.fill();
+    ctx.shadowBlur = 0;
+    ctx.fillStyle = `hsl(${hue} 76% 53%)`;
+    this.roundRect(x, y, slabWidth, blockHeight - sideDepth, radius);
+    ctx.fill();
+    ctx.fillStyle = `hsl(${hue} 87% 77% / 0.7)`;
+    ctx.fillRect(x + radius, y + 2, Math.max(0, slabWidth - radius * 2), Math.max(2, blockHeight * 0.09));
+    ctx.restore();
+  }
+
+  private drawDebris(
+    debris: readonly DebrisAnimation[],
+    left: number,
+    width: number,
+    ground: number,
+    blockHeight: number,
+  ): void {
+    const ctx = this.context;
+    for (const item of debris) {
+      const { piece, age, floor } = item;
+      if (age > 1.4) continue;
+      const rotation = (piece.side === 'left' ? -1 : 1) * age * 5;
+      const x = left + (piece.x + piece.width / 2) / 100 * width;
+      const y = ground - floor * blockHeight + this.camera + age * age * this.height * 0.7;
+      ctx.save();
+      ctx.translate(x, y);
+      ctx.rotate(rotation);
+      ctx.globalAlpha = Math.max(0, 1 - age / 1.4);
+      ctx.fillStyle = `hsl(${(190 + floor * 19) % 360} 75% 48%)`;
+      ctx.fillRect(-piece.width / 200 * width, 0, piece.width / 100 * width, blockHeight * 0.8);
+      ctx.restore();
+    }
+    ctx.globalAlpha = 1;
+  }
+
+  private drawHud(round: RoundSnapshot, scene: RendererScene, minSide: number): void {
+    const ctx = this.context;
+    const labelSize = Math.max(16, minSide * 0.04);
+    const scoreSize = Math.max(27, minSide * 0.075);
+    this.text(`SCORE  ${round.score.toLocaleString()}`, this.width * 0.055, this.height * 0.1, scoreSize, 'left');
+    this.text(`FLOORS  ${round.floors}`, this.width * 0.055, this.height * 0.1 + labelSize * 1.35, labelSize, 'left');
+    this.text(`LAYER ${round.layer} · ${round.layerName.toUpperCase()}`, this.width * 0.055, this.height * 0.1 + labelSize * 2.65, labelSize, 'left');
+
+    const radius = Math.max(25, minSide * 0.075);
+    const centerX = this.width - radius * 1.45;
+    const centerY = radius * 1.4;
+    const fraction = Math.max(0, Math.min(1, round.timeRemaining / 60));
+    const warning = round.timeRemaining <= 10;
+    ctx.lineWidth = Math.max(5, minSide * 0.009);
+    ctx.strokeStyle = '#14203d99';
+    ctx.beginPath();
+    ctx.arc(centerX, centerY, radius, -Math.PI / 2, Math.PI * 1.5);
+    ctx.stroke();
+    ctx.strokeStyle = warning ? '#ff786f' : '#f7f5df';
+    if (warning) ctx.globalAlpha = 0.65 + (Math.sin(scene.elapsed * 9) + 1) * 0.17;
+    ctx.beginPath();
+    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fraction);
+    ctx.stroke();
+    ctx.globalAlpha = 1;
+    this.text(`${Math.ceil(round.timeRemaining)}`, centerX, centerY + minSide * 0.015, labelSize * 1.15, 'center');
+    this.text(scene.muted ? 'SOUND OFF · M' : 'SOUND ON · M', this.width - 18, this.height - 18, Math.max(13, labelSize * 0.7), 'right');
+  }
+
+  private drawLayerPips(round: RoundSnapshot, minSide: number): void {
+    const ctx = this.context;
+    const pipGap = Math.min(14, this.width * 0.012);
+    const pipWidth = Math.min(44, (this.width * 0.62 - pipGap * 8) / 9);
+    const total = pipWidth * 9 + pipGap * 8;
+    const left = (this.width - total) / 2;
+    const y = this.height - Math.max(25, minSide * 0.055);
+    const active = round.layer - 1;
+    for (let index = 0; index < 9; index += 1) {
+      const progress = index < active ? 1 : index === active ? (round.floors % 6) / 6 : 0;
+      ctx.fillStyle = '#13213c99';
+      ctx.fillRect(left + index * (pipWidth + pipGap), y, pipWidth, Math.max(7, minSide * 0.012));
+      ctx.fillStyle = index < active ? '#f6f1dc' : '#a9e3ed';
+      ctx.fillRect(left + index * (pipWidth + pipGap), y, pipWidth * progress, Math.max(7, minSide * 0.012));
+    }
+  }
+
+  private drawPerfect(scene: RendererScene, minSide: number): void {
+    const ctx = this.context;
+    const progress = scene.perfectAge / 1.15;
+    const radius = minSide * (0.08 + progress * 0.27);
+    ctx.save();
+    ctx.globalAlpha = 1 - progress;
+    ctx.strokeStyle = '#fff4b8';
+    ctx.lineWidth = Math.max(3, minSide * 0.006);
+    ctx.beginPath();
+    ctx.arc(this.width / 2, this.height * 0.43, radius, 0, Math.PI * 2);
+    ctx.stroke();
+    this.text(scene.perfectText, this.width / 2, this.height * 0.39, Math.max(23, minSide * 0.07), 'center', '#fff2b0');
+    ctx.restore();
+  }
+
+  private drawLayerBanner(round: RoundSnapshot, scene: RendererScene, minSide: number): void {
+    const ctx = this.context;
+    const alpha = Math.min(0.88, scene.layerFlash * 1.4);
+    ctx.save();
+    ctx.globalAlpha = alpha;
+    ctx.fillStyle = '#162344';
+    ctx.fillRect(0, this.height * 0.39, this.width, this.height * 0.18);
+    this.text(`LAYER ${round.layer}: ${round.layerName.toUpperCase()}`, this.width / 2, this.height * 0.49, Math.max(22, minSide * 0.062), 'center', '#fff8db');
+    ctx.restore();
+  }
+
+  private drawScreen(scene: RendererScene, minSide: number): void {
+    const ctx = this.context;
+    const centerX = this.width / 2;
+    const centerY = this.height / 2;
+    const big = Math.max(36, minSide * 0.105);
+    const medium = Math.max(20, minSide * 0.047);
+    if (scene.screen === 'play') return;
+
+    ctx.save();
+    ctx.fillStyle = scene.screen === 'attract' ? '#111a3470' : '#111a34bd';
+    ctx.fillRect(0, 0, this.width, this.height);
+
+    if (scene.screen === 'attract') {
+      this.text('SKYLINE STACK', centerX, centerY - minSide * 0.12, big, 'center', '#fff8e4');
+      this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.02, medium, 'center', '#d2f3ff');
+      const blink = Math.sin(scene.elapsed * 3.2) > -0.15;
+      if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.1, medium, 'center', '#ffe8a6');
+      this.text('60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, this.height * 0.91, Math.max(13, medium * 0.62), 'center', '#ffffff');
+      this.drawLeaderboard(scene, minSide, centerY + minSide * 0.24, false);
+    } else if (scene.screen === 'countdown') {
+      const countdown = Math.max(1, Math.ceil(scene.round.countdownRemaining));
+      this.text(countdown.toString(), centerX, centerY + big * 0.35, big * 2.2, 'center', '#fff5ce');
+      this.text('GET READY', centerX, centerY + big * 1.25, medium, 'center');
+    } else if (scene.screen === 'game-over') {
+      this.text('TOWER COMPLETE', centerX, centerY - minSide * 0.29, big * 0.75, 'center', '#fff5ce');
+      const reason = scene.round.endReason === 'missed' ? 'THE BLOCK SLIPPED AWAY' : 'TIME IS UP';
+      this.text(reason, centerX, centerY - minSide * 0.21, medium, 'center', '#d8edff');
+      this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, centerY - minSide * 0.11, big, 'center');
+      const rows = [
+        `FLOORS  ${scene.breakdown.floors}  ·  PERFECTS  ${scene.breakdown.perfects}  +${scene.breakdown.perfectBonus}`,
+        `LAYERS  ${scene.breakdown.layers}  +${scene.breakdown.layerBonus}  ·  TIME  +${scene.breakdown.timeBonus}`,
+        ...(scene.breakdown.summitBonus > 0 ? [`CLOUD NINE BONUS  +${scene.breakdown.summitBonus}`] : []),
+      ];
+      rows.forEach((row, index) => this.text(row, centerX, centerY + minSide * (index * 0.065), Math.max(15, medium * 0.78), 'center'));
+      this.text('PRESS TO CONTINUE', centerX, centerY + minSide * 0.23, medium * 0.8, 'center', '#ffe8a6');
+    } else if (scene.screen === 'initials') {
+      this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');
+      this.text(scene.initials.split('').join('  '), centerX, centerY + minSide * 0.01, big * 1.35, 'center');
+      this.text('TAP: NEXT LETTER', centerX, centerY + minSide * 0.13, medium * 0.8, 'center');
+      const holdWidth = this.width * 0.42;
+      ctx.fillStyle = '#ffffff55';
+      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth, 8);
+      ctx.fillStyle = '#ffe8a6';
+      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth * scene.holdProgress, 8);
+      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.24, Math.max(14, medium * 0.68), 'center');
+    } else if (scene.screen === 'leaderboard') {
+      this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
+      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.22, true);
+      this.text('PRESS TO PLAY AGAIN', centerX, this.height - minSide * 0.12, medium * 0.82, 'center', '#ffe8a6');
+    }
+    ctx.restore();
+  }
+
+  private drawLeaderboard(scene: RendererScene, minSide: number, startY: number, full: boolean): void {
+    const ctx = this.context;
+    if (!scene.leaderboard.length) {
+      this.text('BE THE FIRST ON THE BOARD', this.width / 2, startY + minSide * 0.035, Math.max(14, minSide * 0.035), 'center');
+      return;
+    }
+    const count = full ? Math.min(10, scene.leaderboard.length) : 1;
+    const index = full ? 0 : scene.leaderboardIndex % scene.leaderboard.length;
+    for (let row = 0; row < count; row += 1) {
+      const entryIndex = full ? row : index;
+      const entry = scene.leaderboard[entryIndex]!;
+      const y = startY + row * minSide * 0.06;
+      const highlighted = scene.highlightedEntry?.initials === entry.initials
+        && scene.highlightedEntry.score === entry.score;
+      ctx.fillStyle = highlighted ? '#f5d477' : '#ffffffdd';
+      this.text(`${String(entryIndex + 1).padStart(2, '0')}   ${entry.initials}   ${entry.score.toLocaleString()}`, this.width / 2, y, Math.max(15, minSide * (full ? 0.034 : 0.04)), 'center', highlighted ? '#ffe89b' : '#ffffff');
+    }
+  }
+
+  private text(
+    value: string,
+    x: number,
+    y: number,
+    size: number,
+    align: CanvasTextAlign,
+    color = '#ffffff',
+  ): void {
+    const ctx = this.context;
+    ctx.save();
+    ctx.font = `800 ${size}px system-ui, sans-serif`;
+    ctx.textAlign = align;
+    ctx.textBaseline = 'middle';
+    ctx.lineJoin = 'round';
+    ctx.lineWidth = Math.max(3, size * 0.13);
+    ctx.strokeStyle = '#111a35';
+    ctx.strokeText(value, x, y, this.width * 0.9);
+    ctx.fillStyle = color;
+    ctx.fillText(value, x, y, this.width * 0.9);
+    ctx.restore();
+  }
+
+  private roundRect(x: number, y: number, width: number, height: number, radius: number): void {
+    const ctx = this.context;
+    ctx.beginPath();
+    ctx.roundRect(x, y, Math.max(0, width), Math.max(0, height), radius);
+  }
+}
```

### Edited src/main.ts +358 -2

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,5 +1,361 @@
+import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
+import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
+import { Leaderboard, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
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
+
 const canvas = document.querySelector<HTMLCanvasElement>('#game');
+if (!canvas) throw new Error('The game canvas is missing.');
 
-if (!canvas) {
-  throw new Error('The game canvas is missing.');
+const params = new URLSearchParams(window.location.search);
+const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;
+const fixedSeed = parsedSeed !== null && Number.isFinite(parsedSeed) ? parsedSeed >>> 0 : null;
+const eventKey = params.get('event')?.trim() || 'default';
+let seedCursor = fixedSeed ?? (Date.now() >>> 0);
+
+function nextRoundSeed(): number {
+  if (fixedSeed !== null) return fixedSeed;
+  const next = nextRandom(seedCursor);
+  seedCursor = next.seed;
+  return next.seed;
 }
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
+  round = pressRound(createRound(nextRoundSeed()));
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
+  audio.countdown(3);
+}
+
+function enterResults(): void {
+  screenElapsed = 0;
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
+function onInput(event: PressEvent): void {
+  if (event.player !== 0) return;
+  if (screen === 'attract') {
+    beginRound();
+    return;
+  }
+  if (screen === 'play') {
+    const moving = round.movingBlock;
+    if (!moving) return;
+    const target = round.blocks[round.blocks.length - 1]!;
+    const result = dropBlock(moving, target, round.perfectStreak, { worldWidth: WORLD_WIDTH });
+    round = pressRound(round);
+    if (round.phase === 'over') {
+      audio.drop();
+      if (result.chopped.length > 0) audio.chop();
+      return;
+    }
+    audio.drop();
+    if (result.chopped.length > 0) {
+      audio.chop();
+      debris.push(...result.chopped.map((piece) => ({ piece, floor: round.floors, age: 0 })));
+    }
+    if (result.perfect) {
+      perfects += 1;
+      perfectText = `PERFECT x${round.combo}`;
+      perfectAge = 0;
+      audio.perfect(round.combo);
+    } else {
+      perfectAge = -1;
+    }
+    if (round.layerBreaks > 0 && round.floors % 6 === 0) {
+      layerFlash = 0.8;
+      audio.layerBreak(getRoundSnapshot(round).layer);
+    }
+    return;
+  }
+  if (screen === 'game-over') {
+    enterResults();
+    return;
+  }
+  if (screen === 'leaderboard') {
+    screen = 'attract';
+    screenElapsed = 0;
+    return;
+  }
+  if (screen === 'initials' && event.source !== 'keyboard') {
+    initialsGesture = { started: performance.now(), player: event.player };
+  }
+}
+
+function onKey(key: string): void {
+  if (screen === 'initials') {
+    initials = typeInitialKey(initials, key);
+    saveInitials();
+    return;
+  }
+  if (key.toLowerCase() === 'm') audio.toggleMute();
+}
+
+const input: InputController = createInput(canvas, {
+  isDuel: () => false,
+  onPress: onInput,
+  onKey,
+  onGesture: () => audio.unlock(),
+});
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
+    const remaining = Math.ceil(round.timeRemaining);
+    if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
+    previousWarningSecond = remaining;
+  }
+  if (round.phase === 'over') {
+    screen = 'game-over';
+    screenElapsed = 0;
+    audio.gameOver();
+    if (isHighScore(round.score)) candidateEntry = { initials: 'AAA', score: round.score, timestamp: Date.now() };
+  }
+}
+
+function update(dt: number): void {
+  elapsed += dt;
+  screenElapsed += dt;
+  perfectAge = perfectAge < 0 ? perfectAge : perfectAge + dt;
+  layerFlash = Math.max(0, layerFlash - dt);
+  debris = debris.map((piece) => ({ ...piece, age: piece.age + dt })).filter((piece) => piece.age < 1.4);
+  if (screen === 'attract') updateDemo(dt);
+  updateRoundState(dt);
+  if (screen === 'game-over' && screenElapsed >= 8) enterResults();
+  if (screen === 'leaderboard' && screenElapsed >= 10) {
+    screen = 'attract';
+    screenElapsed = 0;
+  }
+  const currentRound = screen === 'attract' ? demoRound : round;
+  audio.update(dt, getRoundSnapshot(currentRound).layer, screen === 'attract' || screen === 'countdown' || screen === 'play');
+}
+
+function getBreakdown(): RendererScene['breakdown'] {
+  return {
+    floors: round.floors,
+    perfects,
+    perfectBonus: round.perfectBonus,
+    layers: round.layerBreaks,
+    layerBonus: round.layerBreaks * 100,
+    timeBonus: round.timeBonus,
+    summitBonus: round.reachedCloudNine ? 500 : 0,
+  };
+}
+
+function render(dt: number): void {
+  const demoSnapshot = getRoundSnapshot(demoRound);
+  const roundSnapshot = getRoundSnapshot(round);
+  const entries = getEntries();
+  const scene: RendererScene = {
+    screen,
+    round: roundSnapshot,
+    displayRound: demoSnapshot,
+    elapsed,
+    debris,
+    perfectText,
+    perfectAge,
+    layerFlash,
+    breakdown: getBreakdown(),
+    leaderboard: entries,
+    leaderboardIndex: entries.length ? Math.floor(elapsed / 8) % entries.length : 0,
+    highlightedEntry,
+    initials: initials.value,
+    holdProgress,
+    muted: audio.isMuted,
+  };
+  renderer.render(scene, dt);
+}
+
+let lastFrame = 0;
+let accumulator = 0;
+
+function frame(timestamp: number): void {
+  requestAnimationFrame(frame);
+  input.pollGamepads();
+  if (document.hidden) {
+    lastFrame = 0;
+    accumulator = 0;
+    return;
+  }
+  const now = timestamp / 1000;
+  if (lastFrame === 0) lastFrame = now;
+  const delta = Math.min(0.25, Math.max(0, now - lastFrame));
+  lastFrame = now;
+  accumulator += delta;
+  let steps = 0;
+  while (accumulator >= STEP && steps < 30) {
+    update(STEP);
+    accumulator -= STEP;
+    steps += 1;
+  }
+  if (steps === 30) accumulator = 0;
+  updateInitialsGesture(performance.now(), input.getHoldState());
+  render(delta);
+}
+
+document.addEventListener('visibilitychange', () => {
+  if (document.hidden) {
+    lastFrame = 0;
+    accumulator = 0;
+  }
+});
+
+requestAnimationFrame(frame);
+
+window.addEventListener('beforeunload', () => {
+  input.destroy();
+  renderer.destroy();
+});
```

### Edited 4 files

#### src/input/input.ts

```diff
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -110,7 +110,7 @@
         const player = routePress({ source: 'gamepad', index, buttons: down }, options.isDuel());
         if (player === null) continue;
         currentlyHeld[player] = true;
-        for (const buttonIndex of down) {
+        for (const buttonIndex of down.filter((button) => [0, 1, 2, 3, 9].includes(button))) {
           const buttonId = `${index}:${buttonIndex}`;
           if (pressedGamepadButtons.has(buttonId)) continue;
           pressedGamepadButtons.add(buttonId);
```

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -1,4 +1,3 @@
-import { SKY_LAYERS } from '../core/layers';
 import type { RoundSnapshot } from '../core/round';
 import type { Block, DebrisPiece } from '../core/stack';
 import type { LeaderboardEntry } from '../core/leaderboard';

@@ -78,7 +77,6 @@
 
   render(scene: RendererScene, dt: number): void {
     this.resize();
-    const ctx = this.context;
     const minSide = Math.min(this.width, this.height);
     const round = scene.screen === 'attract' ? scene.displayRound : scene.round;
     const layerIndex = Math.max(0, Math.min(8, round.layer - 1));

@@ -98,7 +96,7 @@
       const block = round.blocks[index]!;
       this.drawBlock(block, index, contentLeft, contentWidth, ground, blockHeight, minSide);
     }
-    if (round.movingBlock && (scene.screen === 'play' || scene.screen === 'countdown')) {
+    if (round.movingBlock && (scene.screen === 'play' || scene.screen === 'countdown' || scene.screen === 'attract')) {
       this.drawBlock(
         round.movingBlock,
         round.floors + 1,
```

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -83,6 +83,7 @@
 let holdProgress = 0;
 let highlightedEntry: LeaderboardEntry | null = null;
 let candidateEntry: LeaderboardEntry | null = null;
+let ignoreNextKeyboardPress = false;
 
 function getEntries(): LeaderboardEntry[] {
   return board.get(eventKey);

@@ -157,6 +158,10 @@
 }
 
 function onInput(event: PressEvent): void {
+  if (event.source === 'keyboard' && ignoreNextKeyboardPress) {
+    ignoreNextKeyboardPress = false;
+    return;
+  }
   if (event.player !== 0) return;
   if (screen === 'attract') {
     beginRound();

@@ -207,12 +212,17 @@
 }
 
 function onKey(key: string): void {
+  if (key.toLowerCase() === 'm') {
+    audio.toggleMute();
+    return;
+  }
   if (screen === 'initials') {
+    const normalized = key.toLowerCase();
+    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup'].includes(normalized);
     initials = typeInitialKey(initials, key);
     saveInitials();
     return;
   }
-  if (key.toLowerCase() === 'm') audio.toggleMute();
 }
 
 const input: InputController = createInput(canvas, {
```

#### index.html

```diff
--- a/index.html
+++ b/index.html
@@ -19,6 +19,8 @@
         display: block;
         width: 100%;
         height: 100%;
+        touch-action: none;
+        user-select: none;
       }
     </style>
   </head>
```

### Failed to run npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

src/audio/synth.ts(20,9): error TS18047: 'context' is possibly 'null'.
src/audio/synth.ts(20,45): error TS18047: 'context' is possibly 'null'.
src/render/renderer.ts(170,11): error TS6133: 'ctx' is declared but its value is never read.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  9 passed (9)
      Tests  27 passed (27)
   Start at  03:57:22
   Duration  2.97s (transform 247ms, setup 0ms, import 483ms, tests 51ms, environment 1ms)
```

```text
All 27 tests across 9 test files passed.
```

### Edited 2 files

#### src/audio/synth.ts

```diff
--- a/src/audio/synth.ts
+++ b/src/audio/synth.ts
@@ -17,7 +17,7 @@
 
   unlock(): void {
     const context = this.ensureContext();
-    if (context.state === 'suspended') void context.resume().catch(() => undefined);
+    if (context?.state === 'suspended') void context.resume().catch(() => undefined);
   }
 
   toggleMute(): boolean {
```

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -167,7 +167,6 @@
   }
 
   private drawClouds(elapsed: number): void {
-    const ctx = this.context;
     const bands = [
       { y: 0.3, scale: 0.7, speed: 5, opacity: 0.13, size: 0.19 },
       { y: 0.48, scale: 1, speed: 11, opacity: 0.2, size: 0.25 },
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 17 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.61 kB │ gzip:  0.37 kB
dist/assets/index-C9iiGgDv.js  27.74 kB │ gzip: 10.53 kB

✓ built in 246ms
```

```text
The production build completed successfully, including TypeScript checks and asset generation.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  9 passed (9)
      Tests  27 passed (27)
   Start at  03:57:35
   Duration  3.12s (transform 195ms, setup 0ms, import 430ms, tests 46ms, environment 1ms)
```

```text
All 27 tests passed across 9 test files.
```

### Edited src/input/input.ts +8 -3

#### src/input/input.ts

```diff
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -46,13 +46,13 @@
 
   const keydown = (event: KeyboardEvent): void => {
     if (event.ctrlKey || event.metaKey || event.altKey) return;
-    options.onKey?.(event.key);
     const token = event.key.toLowerCase();
     if (heldKeys.has(token)) return;
+    heldKeys.add(token);
+    options.onKey?.(event.key);
     const player = routePress({ source: 'keyboard', key: event.key }, options.isDuel());
     if (player === null) return;
     event.preventDefault();
-    heldKeys.add(token);
     keyPlayers.set(token, player);
     signalGesture();
     emit(player, 'keyboard', event.key);

@@ -100,7 +100,12 @@
     pollGamepads(): void {
       const pads = navigator.getGamepads?.();
       const currentlyHeld: [boolean, boolean] = [false, false];
-      if (!pads) return;
+      if (!pads) {
+        heldGamepads[0] = false;
+        heldGamepads[1] = false;
+        pressedGamepadButtons.clear();
+        return;
+      }
       for (let index = 0; index < pads.length; index += 1) {
         const pad = pads[index];
         if (!pad || !pad.connected) continue;
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 17 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.61 kB │ gzip:  0.37 kB
dist/assets/index-BQvEGVBd.js  27.78 kB │ gzip: 10.55 kB

✓ built in 151ms
```

```text
The production build completed successfully.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  9 passed (9)
      Tests  27 passed (27)
   Start at  03:58:11
   Duration  2.93s (transform 192ms, setup 0ms, import 457ms, tests 50ms, environment 1ms)
```

```text
All 27 tests across 9 test files passed.
```

### Ran git status --short

```text
 M index.html
 M src/main.ts
?? src/audio/
?? src/core/inputmap.ts
?? src/input/
?? src/render/
?? tests/inputmap.test.ts
```

```text
Git status shows changes to two tracked files and several new source and test files.
```
