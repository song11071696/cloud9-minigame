# Junie CLI session — Task 06: arcade-button initials, active-slot highlight, initials auto-save, longer game-over lockout, attract CTA/padding

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-043054-sp0p

## Prompt given to Junie

```text
Read .junie/guidelines.md and the current code. TASK 6 of Skyline Stack: third playtest pass (headless smoke test + screenshots).

1. INITIALS with a keyboard-mapped arcade button: booth arcade buttons usually go through a USB encoder that sends Space or Enter. Right now Space/Enter do nothing on the INITIALS screen (only pointer/gamepad do tap/hold). Make Space/Enter/ArrowUp behave exactly like the one button: short press = next letter, hold >= 0.6 s = confirm letter (use keydown/keyup timing; ignore key auto-repeat). Typing letters A-Z/0-9 still works, Backspace goes back one slot.
2. INITIALS readability: clearly highlight the active slot (underline bar + slightly larger + accent colour) and show the hold-progress bar under the active slot only while holding.
3. INITIALS abandonment: if no input for 15 s on INITIALS, auto-save the entry with the letters chosen so far (pad with the current letters) and go to the LEADERBOARD. Pure helper + vitest test.
4. GAME OVER lockout: raise to 2.0 s (duel result and leaderboard stay 1.2 s) so mashers still see their result. Update the tests.
5. ATTRACT title card: the blinking call-to-action 'TAP / PRESS ANY BUTTON TO PLAY' must be on the title card (it is missing on the card version), large and centred under the subtitle.
6. ATTRACT leaderboard card: its heading 'SKYLINE HALL OF HEIGHT' overlaps the panel's top border; add proper top padding so headings sit fully inside panels on all cards, in both 1280x720 and 768x1024 viewports.
7. Run `npm test` and `npm run build` until both pass. Do not commit. Do not create files outside this directory.
```

## Junie transcript (verbatim export)

# Session transcript

### Read .junie/guidelines.md

### Searched src/**/*.ts

```text
src/audio/synth.ts
src/core/attract.ts
src/core/duel.ts
src/core/flow.ts
src/core/initials.ts
src/core/inputmap.ts
src/core/kiosk.ts
src/core/layers.ts
src/core/leaderboard.ts
src/core/rng.ts
src/core/round.ts
src/core/scoring.ts
src/core/screen-lockout.ts
src/core/stack.ts
src/input/input.ts
src/main.ts
src/render/renderer.ts
```

### Searched tests/**/*.ts

```text
tests/attract.test.ts
tests/duel.test.ts
tests/flow.test.ts
tests/initials.test.ts
tests/inputmap.test.ts
tests/kiosk.test.ts
tests/layers.test.ts
tests/leaderboard.test.ts
tests/rng.test.ts
tests/round.test.ts
tests/scoring.test.ts
tests/screen-lockout.test.ts
tests/stack.test.ts
```

### Searched INITIALS|initials|GAME.?OVER|game.?over|SKYLINE HALL|TAP / PRESS|leaderboard card|lockout

```text
src/audio/synth.ts [98—102]
src/core/flow.ts [1—6]
src/core/flow.ts [12—16]
src/core/flow.ts [20—24]
src/core/flow.ts [26—42]
src/core/initials.ts [1—5]
src/core/initials.ts [7—15]
src/core/initials.ts [20—24]
src/core/initials.ts [26—32]
src/core/leaderboard.ts [3—7]
src/core/leaderboard.ts [27—32]
src/core/leaderboard.ts [41—49]
src/core/screen-lockout.ts [1—7]
src/core/screen-lockout.ts [13—18]
src/main.ts [1—4]
src/main.ts [6—10]
src/main.ts [92—97]
src/main.ts [144—151]
src/main.ts [154—179]
src/main.ts [315—319]
src/main.ts [324—329]
src/main.ts [348—356]
src/main.ts [453—459]
src/main.ts [464—472]
src/main.ts [487—491]
src/main.ts [553—557]
src/main.ts [561—566]
src/main.ts [621—625]
src/render/renderer.ts [36—40]
src/render/renderer.ts [44—48]
src/render/renderer.ts [507—511]
src/render/renderer.ts [525—536]
src/render/renderer.ts [541—549]
src/render/renderer.ts [578—585]
src/render/renderer.ts [649—653]
src/render/renderer.ts [708—715]
```

### Searched initials|lockout|attract|SKYLINE HALL

```text
tests/attract.test.ts [1—18]
tests/flow.test.ts [12—16]
tests/flow.test.ts [61—65]
tests/flow.test.ts [68—72]
tests/initials.test.ts [1—18]
tests/initials.test.ts [20—24]
tests/kiosk.test.ts [1—10]
tests/leaderboard.test.ts [2—6]
tests/leaderboard.test.ts [32—77]
tests/screen-lockout.test.ts [1—18]
```

### Read package.json

### Searched drawAttract|attract|SKYLINE HALL|TAP / PRESS|leaderboard|panel|initials

```text
src/render/renderer.ts [1—5]
src/render/renderer.ts [31—35]
src/render/renderer.ts [32—36]
src/render/renderer.ts [33—37]
src/render/renderer.ts [34—38]
src/render/renderer.ts [36—40]
src/render/renderer.ts [90—94]
src/render/renderer.ts [115—119]
src/render/renderer.ts [130—134]
src/render/renderer.ts [388—392]
src/render/renderer.ts [497—501]
src/render/renderer.ts [500—504]
src/render/renderer.ts [501—505]
src/render/renderer.ts [530—534]
src/render/renderer.ts [532—536]
src/render/renderer.ts [540—544]
src/render/renderer.ts [541—545]
src/render/renderer.ts [543—547]
src/render/renderer.ts [550—554]
src/render/renderer.ts [560—564]
src/render/renderer.ts [561—565]
src/render/renderer.ts [562—566]
src/render/renderer.ts [568—572]
src/render/renderer.ts [578—582]
src/render/renderer.ts [581—585]
src/render/renderer.ts [583—587]
src/render/renderer.ts [658—662]
src/render/renderer.ts [664—668]
src/render/renderer.ts [670—674]
src/render/renderer.ts [672—676]
src/render/renderer.ts [675—679]
src/render/renderer.ts [683—687]
src/render/renderer.ts [690—694]
src/render/renderer.ts [698—702]
src/render/renderer.ts [702—706]
src/render/renderer.ts [703—707]
src/render/renderer.ts [706—710]
src/render/renderer.ts [708—712]
src/render/renderer.ts [711—715]
```

### Searched initials|onKey|keydown|keyup|press|lockout|screenElapsed|update

```text
src/main.ts [1—3]
src/main.ts [1—4]
src/main.ts [6—10]
src/main.ts [10—14]
src/main.ts [12—16]
src/main.ts [17—21]
src/main.ts [80—84]
src/main.ts [84—88]
src/main.ts [92—96]
src/main.ts [93—97]
src/main.ts [97—101]
src/main.ts [120—124]
src/main.ts [121—125]
src/main.ts [144—148]
src/main.ts [145—149]
src/main.ts [147—151]
src/main.ts [154—158]
src/main.ts [157—161]
src/main.ts [158—162]
src/main.ts [162—166]
src/main.ts [163—167]
src/main.ts [166—170]
src/main.ts [167—171]
src/main.ts [169—173]
src/main.ts [171—175]
src/main.ts [172—176]
src/main.ts [173—177]
src/main.ts [175—179]
src/main.ts [249—253]
src/main.ts [270—274]
src/main.ts [271—275]
src/main.ts [272—276]
src/main.ts [277—281]
src/main.ts [281—285]
src/main.ts [283—287]
src/main.ts [287—291]
src/main.ts [291—295]
src/main.ts [293—297]
src/main.ts [297—301]
src/main.ts [298—302]
src/main.ts [299—303]
src/main.ts [324—328]
src/main.ts [325—329]
src/main.ts [329—333]
src/main.ts [332—336]
src/main.ts [348—352]
src/main.ts [350—354]
src/main.ts [351—355]
src/main.ts [352—356]
src/main.ts [371—375]
src/main.ts [377—381]
src/main.ts [378—382]
src/main.ts [403—407]
src/main.ts [408—412]
src/main.ts [412—416]
src/main.ts [418—422]
src/main.ts [421—425]
src/main.ts [423—427]
src/main.ts [426—430]
src/main.ts [430—434]
src/main.ts [431—435]
src/main.ts [450—454]
src/main.ts [464—468]
src/main.ts [467—471]
src/main.ts [468—472]
src/main.ts [485—489]
src/main.ts [487—491]
src/main.ts [493—497]
src/main.ts [495—499]
src/main.ts [505—509]
src/main.ts [506—510]
src/main.ts [519—523]
src/main.ts [553—557]
src/main.ts [561—565]
src/main.ts [562—566]
src/main.ts [616—620]
src/main.ts [621—625]
```

### Read src/input/input.ts

### Read tests/flow.test.ts

### Read src/core/initials.ts

### Read src/core/flow.ts

### Read tests/initials.test.ts

### Read src/core/screen-lockout.ts

### Read tests/screen-lockout.test.ts

### Read vite.config.ts

### Read src/main.ts [1-645]

### Read src/render/renderer.ts [10-744]

### Read src/core/inputmap.ts

### Edited 6 files

#### src/core/initials.ts

```diff
--- a/src/core/initials.ts
+++ b/src/core/initials.ts
@@ -1,4 +1,6 @@
 const INITIAL_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
+export const INITIALS_HOLD_SECONDS = 0.6;
+export const INITIALS_IDLE_TIMEOUT_SECONDS = 15;
 
 export interface InitialsState {
   value: string;

@@ -6,10 +8,23 @@
   complete: boolean;
 }
 
+export function getInitialsButtonAction(heldSeconds: number): 'tap' | 'hold' {
+  return Number.isFinite(heldSeconds) && heldSeconds >= INITIALS_HOLD_SECONDS ? 'hold' : 'tap';
+}
+
+export function shouldAutoSaveInitials(idleSeconds: number): boolean {
+  return Number.isFinite(idleSeconds) && idleSeconds >= INITIALS_IDLE_TIMEOUT_SECONDS;
+}
+
 export function createInitialsState(): InitialsState {
   return { value: 'AAA', cursor: 0, complete: false };
 }
 
+export function completeInitials(state: InitialsState): InitialsState {
+  if (state.complete) return state;
+  return { value: state.value.slice(0, 3).padEnd(3, 'A'), cursor: 3, complete: true };
+}
+
 export function tapInitials(state: InitialsState): InitialsState {
   if (state.complete) return state;
   const characters = state.value.split('');
```

#### src/input/input.ts

```diff
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -13,6 +13,7 @@
   isDuel: () => boolean;
   onPress: (event: PressEvent) => void;
   onKey?: (key: string) => void;
+  onKeyUp?: (key: string) => void;
   onGesture?: () => void;
   onActivity?: () => void;
 }

@@ -70,8 +71,9 @@
 
   const keyup = (event: KeyboardEvent): void => {
     const token = event.key.toLowerCase();
-    heldKeys.delete(token);
+    if (!heldKeys.delete(token)) return;
     keyPlayers.delete(token);
+    options.onKeyUp?.(event.key);
   };
 
   const pointerdown = (event: PointerEvent): void => {
```

#### src/core/screen-lockout.ts

```diff
--- a/src/core/screen-lockout.ts
+++ b/src/core/screen-lockout.ts
@@ -1,4 +1,5 @@
 export const SCREEN_INPUT_LOCKOUT_SECONDS = 1.2;
+export const GAME_OVER_INPUT_LOCKOUT_SECONDS = 2;
 
 export function getScreenLockoutProgress(
   elapsed: number,
```

#### tests/initials.test.ts

```diff
--- a/tests/initials.test.ts
+++ b/tests/initials.test.ts
@@ -1,8 +1,12 @@
 import { describe, expect, it } from 'vitest';
 import {
+  completeInitials,
   createInitialsState,
+  getInitialsButtonAction,
   holdInitials,
+  INITIALS_HOLD_SECONDS,
   tapInitials,
+  shouldAutoSaveInitials,
   typeInitialKey,
 } from '../src/core/initials';
 

@@ -26,4 +30,17 @@
     expect(state).toEqual({ value: 'Q2A', cursor: 3, complete: true });
     expect(typeInitialKey(state, 'Z')).toBe(state);
   });
+
+  it('distinguishes short presses from holds at the configured threshold', () => {
+    expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS - 0.001)).toBe('tap');
+    expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS)).toBe('hold');
+  });
+
+  it('auto-saves the current initials after 15 seconds of inactivity', () => {
+    const partial = typeInitialKey(createInitialsState(), 'q');
+    expect(shouldAutoSaveInitials(14.999)).toBe(false);
+    expect(shouldAutoSaveInitials(15)).toBe(true);
+    expect(shouldAutoSaveInitials(Number.NaN)).toBe(false);
+    expect(completeInitials(partial)).toEqual({ value: 'QAA', cursor: 3, complete: true });
+  });
 });
```

#### tests/screen-lockout.test.ts

```diff
--- a/tests/screen-lockout.test.ts
+++ b/tests/screen-lockout.test.ts
@@ -1,5 +1,10 @@
 import { describe, expect, it } from 'vitest';
-import { getScreenLockoutProgress, isScreenInputLocked } from '../src/core/screen-lockout';
+import {
+  GAME_OVER_INPUT_LOCKOUT_SECONDS,
+  getScreenLockoutProgress,
+  isScreenInputLocked,
+  SCREEN_INPUT_LOCKOUT_SECONDS,
+} from '../src/core/screen-lockout';
 
 describe('screen input lockout', () => {
   it('locks input until the duration elapses and reports fill progress', () => {

@@ -16,4 +21,11 @@
     expect(getScreenLockoutProgress(0, 0)).toBe(1);
     expect(isScreenInputLocked(Number.POSITIVE_INFINITY)).toBe(true);
   });
+
+  it('keeps leaderboard and duel lockouts at 1.2 seconds but extends game over to 2 seconds', () => {
+    expect(SCREEN_INPUT_LOCKOUT_SECONDS).toBe(1.2);
+    expect(GAME_OVER_INPUT_LOCKOUT_SECONDS).toBe(2);
+    expect(isScreenInputLocked(1.999, GAME_OVER_INPUT_LOCKOUT_SECONDS)).toBe(true);
+    expect(isScreenInputLocked(2, GAME_OVER_INPUT_LOCKOUT_SECONDS)).toBe(false);
+  });
 });
```

#### tests/flow.test.ts

```diff
--- a/tests/flow.test.ts
+++ b/tests/flow.test.ts
@@ -11,7 +11,7 @@
     duelOut: [false, false],
     screenElapsed: 0,
     hasCandidateEntry: false,
-    lockoutSeconds: 1.2,
+    lockoutSeconds: 2,
     ...overrides,
   };
 }

@@ -64,9 +64,15 @@
     expect(nextScreen(flowState({ screen: 'game-over', action: 'advance' }))).toBe('game-over');
     expect(nextScreen(flowState({
       screen: 'game-over',
-      screenElapsed: 1.2,
+      screenElapsed: 1.999,
       hasCandidateEntry: true,
       action: 'advance',
+    }))).toBe('game-over');
+    expect(nextScreen(flowState({
+      screen: 'game-over',
+      screenElapsed: 2,
+      hasCandidateEntry: true,
+      action: 'advance',
     }))).toBe('initials');
   });
```

### Edited src/main.ts +66 -9

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,12 +1,26 @@
 import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
-import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
+import {
+  completeInitials,
+  createInitialsState,
+  getInitialsButtonAction,
+  holdInitials,
+  INITIALS_HOLD_SECONDS,
+  shouldAutoSaveInitials,
+  tapInitials,
+  typeInitialKey,
+  type InitialsState,
+} from './core/initials';
 import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
 import { getDuelOutcome, type DuelWinner } from './core/duel';
 import { enteredScreen, nextScreen, type AppScreen, type ScreenFlowAction } from './core/flow';
 import { shouldReturnToAttract } from './core/kiosk';
 import { nextRandom } from './core/rng';
-import { getScreenLockoutProgress, SCREEN_INPUT_LOCKOUT_SECONDS } from './core/screen-lockout';
 import {
+  GAME_OVER_INPUT_LOCKOUT_SECONDS,
+  getScreenLockoutProgress,
+  SCREEN_INPUT_LOCKOUT_SECONDS,
+} from './core/screen-lockout';
+import {
   createRound,
   getRoundSnapshot,
   pressRound,

@@ -71,7 +85,6 @@
 const audio = new SynthAudio(params.get('mute') === '1');
 const renderer = new CanvasRenderer(canvas);
 const STEP = 1 / 120;
-const INITIAL_HOLD_SECONDS = 0.6;
 
 let screen: AppScreen = 'attract';
 let round: RoundState = createRound(nextRoundSeed());

@@ -92,8 +105,9 @@
 let layerFlash = 0;
 let debris: DebrisAnimation[] = [];
 let initials: InitialsState = createInitialsState();
-let initialsGesture: { started: number; player: 0 | 1 } | null = null;
+let initialsGesture: { started: number; player: 0 | 1; key?: string } | null = null;
 let holdProgress = 0;
+let initialsIdleSeconds = 0;
 let highlightedEntry: LeaderboardEntry | null = null;
 let candidateEntry: LeaderboardEntry | null = null;
 let ignoreNextKeyboardPress = false;

@@ -162,9 +176,13 @@
     return;
   }
   const duration = Math.max(0, (now - initialsGesture.started) / 1000);
+  if (initialsGesture.key) {
+    holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
+    return;
+  }
   const isHeld = holds[initialsGesture.player];
-  holdProgress = Math.min(1, duration / INITIAL_HOLD_SECONDS);
-  if (isHeld && duration >= INITIAL_HOLD_SECONDS) {
+  holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
+  if (isHeld && duration >= INITIALS_HOLD_SECONDS) {
     initials = holdInitials(initials);
     initialsGesture = null;
     holdProgress = 0;

@@ -181,6 +199,7 @@
 function noteActivity(): void {
   inputActivity = true;
   kioskIdleSeconds = 0;
+  if (screen === 'initials') initialsIdleSeconds = 0;
   activateGesture();
 }
 

@@ -328,6 +347,8 @@
   }
 }
 
+const INITIALS_BUTTON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
+
 function onKey(key: string): void {
   const normalized = key.toLowerCase();
   if (operatorOpen) {

@@ -349,7 +370,11 @@
   }
   if (screen === 'initials') {
     const normalized = key.toLowerCase();
-    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup'].includes(normalized);
+    if (INITIALS_BUTTON_KEYS.has(normalized)) {
+      initialsGesture = { started: performance.now(), player: 0, key: normalized };
+      holdProgress = 0;
+      return;
+    }
     initials = typeInitialKey(initials, key);
     saveInitials();
     return;

@@ -356,6 +381,17 @@
   }
 }
 
+function onKeyUp(key: string): void {
+  if (screen !== 'initials' || !initialsGesture?.key) return;
+  if (initialsGesture.key !== key.toLowerCase()) return;
+  const duration = (performance.now() - initialsGesture.started) / 1000;
+  initials = getInitialsButtonAction(duration) === 'hold' ? holdInitials(initials) : tapInitials(initials);
+  initialsGesture = null;
+  holdProgress = 0;
+  initialsIdleSeconds = 0;
+  saveInitials();
+}
+
 const onCornerPointerDown = (event: PointerEvent): void => {
   const bounds = canvas.getBoundingClientRect();
   const x = event.clientX - bounds.left;

@@ -378,6 +414,7 @@
   isDuel: () => duelEnabled || duelSession,
   onPress: onInput,
   onKey,
+  onKeyUp,
   onGesture: activateGesture,
   onActivity: noteActivity,
 });

@@ -468,6 +505,9 @@
   }
   if (enteredScreen(previous, next, 'initials')) {
     initials = createInitialsState();
+    initialsGesture = null;
+    holdProgress = 0;
+    initialsIdleSeconds = 0;
     audio.highScore();
   }
   if (enteredScreen(previous, next, 'attract')) {

@@ -486,7 +526,9 @@
     duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
     screenElapsed,
     hasCandidateEntry: candidateEntry !== null,
-    lockoutSeconds: SCREEN_INPUT_LOCKOUT_SECONDS,
+    lockoutSeconds: screen === 'game-over' && !duelSession
+      ? GAME_OVER_INPUT_LOCKOUT_SECONDS
+      : SCREEN_INPUT_LOCKOUT_SECONDS,
     ...(action ? { action } : {}),
   });
   transitionTo(next);

@@ -507,6 +549,15 @@
   if (screen === 'attract') updateDemo(dt);
   updateRoundState(dt);
   applyScreenFlow();
+  if (screen === 'initials') {
+    initialsIdleSeconds += dt;
+    if (shouldAutoSaveInitials(initialsIdleSeconds)) {
+      initials = completeInitials(initials);
+      saveInitials();
+    }
+  } else {
+    initialsIdleSeconds = 0;
+  }
   if (kioskMode) {
     if (inputActivity) kioskIdleSeconds = 0;
     else if (screen === 'play') kioskIdleSeconds = 0;

@@ -553,6 +604,7 @@
     todayBest: entries[0] ?? null,
     eventName,
     initials: initials.value,
+    initialsCursor: initials.cursor,
     holdProgress,
     muted: audio.isMuted,
     reducedMotion,

@@ -561,7 +613,12 @@
     duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
     duelWinner,
     lockoutProgress: screen === 'game-over' || screen === 'leaderboard'
-      ? getScreenLockoutProgress(screenElapsed)
+      ? getScreenLockoutProgress(
+        screenElapsed,
+        screen === 'game-over' && !duelSession
+          ? GAME_OVER_INPUT_LOCKOUT_SECONDS
+          : SCREEN_INPUT_LOCKOUT_SECONDS,
+      )
       : 1,
     cloudNineAge,
     operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
```

### Edited src/render/renderer.ts +28 -13

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -36,6 +36,7 @@
   todayBest: LeaderboardEntry | null;
   eventName: string;
   initials: string;
+  initialsCursor: number;
   holdProgress: number;
   muted: boolean;
   reducedMotion: boolean;

@@ -531,14 +532,27 @@
       this.drawLockoutProgress(scene.lockoutProgress, minSide);
     } else if (scene.screen === 'initials') {
       this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');
-      this.text(scene.initials.split('').join('  '), centerX, centerY + minSide * 0.01, big * 1.35, 'center');
-      this.text('TAP: NEXT LETTER', centerX, centerY + minSide * 0.13, medium * 0.8, 'center');
-      const holdWidth = this.width * 0.42;
-      ctx.fillStyle = '#ffffff55';
-      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth, 8);
-      ctx.fillStyle = '#ffe8a6';
-      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth * scene.holdProgress, 8);
-      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.24, Math.max(14, medium * 0.68), 'center');
+      const slotSpacing = minSide * 0.15;
+      const slotY = centerY + minSide * 0.01;
+      scene.initials.split('').forEach((character, index) => {
+        const active = index === scene.initialsCursor && scene.initialsCursor < 3;
+        const slotX = centerX + (index - 1) * slotSpacing;
+        this.text(character, slotX, slotY, big * (active ? 1.5 : 1.35), 'center', active ? '#ffe8a6' : '#ffffff');
+        if (!active) return;
+        const barWidth = minSide * 0.105;
+        const barHeight = Math.max(5, minSide * 0.009);
+        ctx.fillStyle = '#ffe8a6';
+        ctx.fillRect(slotX - barWidth / 2, centerY + minSide * 0.105, barWidth, barHeight);
+        if (scene.holdProgress > 0) {
+          const progressY = centerY + minSide * 0.135;
+          ctx.fillStyle = '#ffffff55';
+          ctx.fillRect(slotX - barWidth / 2, progressY, barWidth, barHeight);
+          ctx.fillStyle = '#ffe8a6';
+          ctx.fillRect(slotX - barWidth / 2, progressY, barWidth * scene.holdProgress, barHeight);
+        }
+      });
+      this.text('TAP / SHORT PRESS: NEXT LETTER', centerX, centerY + minSide * 0.22, medium * 0.8, 'center');
+      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.3, Math.max(14, medium * 0.68), 'center');
     } else if (scene.screen === 'leaderboard') {
       this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
       this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.25, Math.max(13, minSide * 0.024), 'center', '#e7f5ff');

@@ -562,6 +576,7 @@
     const panelWidth = this.width * 0.86;
     const panelHeight = this.height * 0.68;
     const panelTop = this.height * 0.16;
+    const panelHeaderY = panelTop + minSide * 0.12;
     ctx.save();
     ctx.fillStyle = '#08152de0';
     ctx.strokeStyle = '#f6d88c88';

@@ -577,15 +592,15 @@
       this.text('SKYLINE STACK', centerX, centerY - minSide * 0.14, big, 'center', '#fff8e4');
       this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.015, medium, 'center', '#d2f3ff');
       const blink = scene.reducedMotion || Math.sin(scene.elapsed * 3.2) > -0.15;
-      if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.13, medium, 'center', '#ffe8a6');
+      if (blink) this.text('TAP / PRESS ANY BUTTON TO PLAY', centerX, centerY + minSide * 0.13, Math.max(24, minSide * 0.06), 'center', '#ffe8a6');
       this.text(scene.duelMode ? 'DUEL MODE · P1 LEFT / P2 RIGHT' : '60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, centerY + minSide * 0.27, Math.max(14, medium * 0.62), 'center');
     } else if (card === 1) {
-      this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.3, Math.max(28, big * 0.72), 'center', '#fff2ac');
-      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.23, Math.max(14, minSide * 0.026), 'center', '#e7f5ff');
-      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.15, true, 6);
+      this.text('SKYLINE HALL OF HEIGHT', centerX, panelHeaderY, Math.max(28, big * 0.72), 'center', '#fff2ac');
+      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, panelHeaderY + minSide * 0.075, Math.max(14, minSide * 0.026), 'center', '#e7f5ff');
+      this.drawLeaderboard(scene, minSide, panelHeaderY + minSide * 0.16, true, 6);
       this.text('TAP TO TAKE YOUR PLACE', centerX, centerY + minSide * 0.31, Math.max(14, medium * 0.64), 'center', '#ffe8a6');
     } else {
-      this.text('HOW TO PLAY', centerX, centerY - minSide * 0.29, Math.max(30, big * 0.72), 'center', '#fff2ac');
+      this.text('HOW TO PLAY', centerX, panelHeaderY, Math.max(30, big * 0.72), 'center', '#fff2ac');
       const rows = [
         { y: centerY - minSide * 0.1, text: '1  TAP to drop the block', secondLine: null, icon: 0 },
         { y: centerY + minSide * 0.08, text: '2  Line it up — overhang is sliced off', secondLine: null, icon: 1 },
```

### Edited 2 files

#### tests/initials.test.ts

```diff
--- a/tests/initials.test.ts
+++ b/tests/initials.test.ts
@@ -31,6 +31,12 @@
     expect(typeInitialKey(state, 'Z')).toBe(state);
   });
 
+  it('moves back one slot and clears that slot with Backspace', () => {
+    let state = typeInitialKey(createInitialsState(), 'q');
+    state = typeInitialKey(state, 'Backspace');
+    expect(state).toEqual({ value: 'AAA', cursor: 0, complete: false });
+  });
+
   it('distinguishes short presses from holds at the configured threshold', () => {
     expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS - 0.001)).toBe('tap');
     expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS)).toBe('hold');
```

#### tests/flow.test.ts

```diff
--- a/tests/flow.test.ts
+++ b/tests/flow.test.ts
@@ -76,6 +76,22 @@
     }))).toBe('initials');
   });
 
+  it('keeps duel results and leaderboard on the shorter lockout', () => {
+    expect(nextScreen(flowState({
+      screen: 'game-over',
+      duelSession: true,
+      lockoutSeconds: 1.2,
+      screenElapsed: 1.2,
+      action: 'advance',
+    }))).toBe('attract');
+    expect(nextScreen(flowState({
+      screen: 'leaderboard',
+      lockoutSeconds: 1.2,
+      screenElapsed: 1.199,
+      action: 'advance',
+    }))).toBe('leaderboard');
+  });
+
   it('identifies entry side effects only on the transition into a screen', () => {
     let screen = flowState().screen;
     let sideEffects = 0;
```

### Ran git diff -- src/core/initials.ts src/input/input.ts src/core/screen-lockout.ts src/main.ts src/render/renderer.ts tests/initials.test.ts tests/screen-lockout.test.ts tests/flow.test.ts

```text
diff --git a/src/core/initials.ts b/src/core/initials.ts
index 23990c4..fdb0d36 100644
--- a/src/core/initials.ts
+++ b/src/core/initials.ts
@@ -1,4 +1,6 @@
 const INITIAL_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
+export const INITIALS_HOLD_SECONDS = 0.6;
+export const INITIALS_IDLE_TIMEOUT_SECONDS = 15;
 
 export interface InitialsState {
   value: string;
@@ -6,10 +8,23 @@ export interface InitialsState {
   complete: boolean;
 }
 
+export function getInitialsButtonAction(heldSeconds: number): 'tap' | 'hold' {
+  return Number.isFinite(heldSeconds) && heldSeconds >= INITIALS_HOLD_SECONDS ? 'hold' : 'tap';
+}
+
+export function shouldAutoSaveInitials(idleSeconds: number): boolean {
+  return Number.isFinite(idleSeconds) && idleSeconds >= INITIALS_IDLE_TIMEOUT_SECONDS;
+}
+
 export function createInitialsState(): InitialsState {
   return { value: 'AAA', cursor: 0, complete: false };
 }
 
+export function completeInitials(state: InitialsState): InitialsState {
+  if (state.complete) return state;
+  return { value: state.value.slice(0, 3).padEnd(3, 'A'), cursor: 3, complete: true };
+}
+
 export function tapInitials(state: InitialsState): InitialsState {
   if (state.complete) return state;
   const characters = state.value.split('');
diff --git a/src/core/screen-lockout.ts b/src/core/screen-lockout.ts
index 86313fe..3e29ffc 100644
--- a/src/core/screen-lockout.ts
+++ b/src/core/screen-lockout.ts
@@ -1,4 +1,5 @@
 export const SCREEN_INPUT_LOCKOUT_SECONDS = 1.2;
+export const GAME_OVER_INPUT_LOCKOUT_SECONDS = 2;
 
 export function getScreenLockoutProgress(
   elapsed: number,
diff --git a/src/input/input.ts b/src/input/input.ts
index 0d9fe6a..97d4b98 100644
--- a/src/input/input.ts
+++ b/src/input/input.ts
@@ -13,6 +13,7 @@ export interface InputOptions {
   isDuel: () => boolean;
   onPress: (event: PressEvent) => void;
   onKey?: (key: string) => void;
+  onKeyUp?: (key: string) => void;
   onGesture?: () => void;
   onActivity?: () => void;
 }
@@ -70,8 +71,9 @@ export function createInput(canvas: HTMLCanvasElement, options: InputOptions): I
 
   const keyup = (event: KeyboardEvent): void => {
     const token = event.key.toLowerCase();
-    heldKeys.delete(token);
+    if (!heldKeys.delete(token)) return;
     keyPlayers.delete(token);
+    options.onKeyUp?.(event.key);
   };
 
   const pointerdown = (event: PointerEvent): void => {
diff --git a/src/main.ts b/src/main.ts
index ad20ce8..896ab6b 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,11 +1,25 @@
 import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
-import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
+import {
+  completeInitials,
+  createInitialsState,
+  getInitialsButtonAction,
+  holdInitials,
+  INITIALS_HOLD_SECONDS,
+  shouldAutoSaveInitials,
+  tapInitials,
+  typeInitialKey,
+  type InitialsState,
+} from './core/initials';
 import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
 import { getDuelOutcome, type DuelWinner } from './core/duel';
 import { enteredScreen, nextScreen, type AppScreen, type ScreenFlowAction } from './core/flow';
 import { shouldReturnToAttract } from './core/kiosk';
 import { nextRandom } from './core/rng';
-import { getScreenLockoutProgress, SCREEN_INPUT_LOCKOUT_SECONDS } from './core/screen-lockout';
+import {
+  GAME_OVER_INPUT_LOCKOUT_SECONDS,
+  getScreenLockoutProgress,
+  SCREEN_INPUT_LOCKOUT_SECONDS,
+} from './core/screen-lockout';
 import {
   createRound,
   getRoundSnapshot,
@@ -71,7 +85,6 @@ const board = new Leaderboard(safeStorage);
 const audio = new SynthAudio(params.get('mute') === '1');
 const renderer = new CanvasRenderer(canvas);
 const STEP = 1 / 120;
-const INITIAL_HOLD_SECONDS = 0.6;
 
 let screen: AppScreen = 'attract';
 let round: RoundState = createRound(nextRoundSeed());
@@ -92,8 +105,9 @@ let perfectAge = -1;
 let layerFlash = 0;
 let debris: DebrisAnimation[] = [];
 let initials: InitialsState = createInitialsState();
-let initialsGesture: { started: number; player: 0 | 1 } | null = null;
+let initialsGesture: { started: number; player: 0 | 1; key?: string } | null = null;
 let holdProgress = 0;
+let initialsIdleSeconds = 0;
 let highlightedEntry: LeaderboardEntry | null = null;
 let candidateEntry: LeaderboardEntry | null = null;
 let ignoreNextKeyboardPress = false;
@@ -162,9 +176,13 @@ function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]):
     return;
   }
   const duration = Math.max(0, (now - initialsGesture.started) / 1000);
+  if (initialsGesture.key) {
+    holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
+    return;
+  }
   const isHeld = holds[initialsGesture.player];
-  holdProgress = Math.min(1, duration / INITIAL_HOLD_SECONDS);
-  if (isHeld && duration >= INITIAL_HOLD_SECONDS) {
+  holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
+  if (isHeld && duration >= INITIALS_HOLD_SECONDS) {
     initials = holdInitials(initials);
     initialsGesture = null;
     holdProgress = 0;
@@ -181,6 +199,7 @@ function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]):
 function noteActivity(): void {
   inputActivity = true;
   kioskIdleSeconds = 0;
+  if (screen === 'initials') initialsIdleSeconds = 0;
   activateGesture();
 }
 
@@ -328,6 +347,8 @@ function onInput(event: PressEvent): void {
   }
 }
 
+const INITIALS_BUTTON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
+
 function onKey(key: string): void {
   const normalized = key.toLowerCase();
   if (operatorOpen) {
@@ -349,13 +370,28 @@ function onKey(key: string): void {
   }
   if (screen === 'initials') {
     const normalized = key.toLowerCase();
-    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup'].includes(normalized);
+    if (INITIALS_BUTTON_KEYS.has(normalized)) {
+      initialsGesture = { started: performance.now(), player: 0, key: normalized };
+      holdProgress = 0;
+      return;
+    }
     initials = typeInitialKey(initials, key);
     saveInitials();
     return;
   }
 }
 
+function onKeyUp(key: string): void {
+  if (screen !== 'initials' || !initialsGesture?.key) return;
+  if (initialsGesture.key !== key.toLowerCase()) return;
+  const duration = (performance.now() - initialsGesture.started) / 1000;
+  initials = getInitialsButtonAction(duration) === 'hold' ? holdInitials(initials) : tapInitials(initials);
+  initialsGesture = null;
+  holdProgress = 0;
+  initialsIdleSeconds = 0;
+  saveInitials();
+}
+
 const onCornerPointerDown = (event: PointerEvent): void => {
   const bounds = canvas.getBoundingClientRect();
   const x = event.clientX - bounds.left;
@@ -378,6 +414,7 @@ const input: InputController = createInput(canvas, {
   isDuel: () => duelEnabled || duelSession,
   onPress: onInput,
   onKey,
+  onKeyUp,
   onGesture: activateGesture,
   onActivity: noteActivity,
 });
@@ -468,6 +505,9 @@ function transitionTo(next: AppScreen): void {
   }
   if (enteredScreen(previous, next, 'initials')) {
     initials = createInitialsState();
+    initialsGesture = null;
+    holdProgress = 0;
+    initialsIdleSeconds = 0;
     audio.highScore();
   }
   if (enteredScreen(previous, next, 'attract')) {
@@ -486,7 +526,9 @@ function applyScreenFlow(action?: ScreenFlowAction): void {
     duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
     screenElapsed,
     hasCandidateEntry: candidateEntry !== null,
-    lockoutSeconds: SCREEN_INPUT_LOCKOUT_SECONDS,
+    lockoutSeconds: screen === 'game-over' && !duelSession
+      ? GAME_OVER_INPUT_LOCKOUT_SECONDS
+      : SCREEN_INPUT_LOCKOUT_SECONDS,
     ...(action ? { action } : {}),
   });
   transitionTo(next);
@@ -507,6 +549,15 @@ function update(dt: number): void {
   if (screen === 'attract') updateDemo(dt);
   updateRoundState(dt);
   applyScreenFlow();
+  if (screen === 'initials') {
+    initialsIdleSeconds += dt;
+    if (shouldAutoSaveInitials(initialsIdleSeconds)) {
+      initials = completeInitials(initials);
+      saveInitials();
+    }
+  } else {
+    initialsIdleSeconds = 0;
+  }
   if (kioskMode) {
     if (inputActivity) kioskIdleSeconds = 0;
     else if (screen === 'play') kioskIdleSeconds = 0;
@@ -553,6 +604,7 @@ function render(dt: number): void {
     todayBest: entries[0] ?? null,
     eventName,
     initials: initials.value,
+    initialsCursor: initials.cursor,
     holdProgress,
     muted: audio.isMuted,
     reducedMotion,
@@ -561,7 +613,12 @@ function render(dt: number): void {
     duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
     duelWinner,
     lockoutProgress: screen === 'game-over' || screen === 'leaderboard'
-      ? getScreenLockoutProgress(screenElapsed)
+      ? getScreenLockoutProgress(
+        screenElapsed,
+        screen === 'game-over' && !duelSession
+          ? GAME_OVER_INPUT_LOCKOUT_SECONDS
+          : SCREEN_INPUT_LOCKOUT_SECONDS,
+      )
       : 1,
     cloudNineAge,
     operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
diff --git a/src/render/renderer.ts b/src/render/renderer.ts
index 03012b3..9f4320c 100644
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -36,6 +36,7 @@ export interface RendererScene {
   todayBest: LeaderboardEntry | null;
   eventName: string;
   initials: string;
+  initialsCursor: number;
   holdProgress: number;
   muted: boolean;
   reducedMotion: boolean;
@@ -531,14 +532,27 @@ export class CanvasRenderer {
       this.drawLockoutProgress(scene.lockoutProgress, minSide);
     } else if (scene.screen === 'initials') {
       this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');
-      this.text(scene.initials.split('').join('  '), centerX, centerY + minSide * 0.01, big * 1.35, 'center');
-      this.text('TAP: NEXT LETTER', centerX, centerY + minSide * 0.13, medium * 0.8, 'center');
-      const holdWidth = this.width * 0.42;
-      ctx.fillStyle = '#ffffff55';
-      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth, 8);
-      ctx.fillStyle = '#ffe8a6';
-      ctx.fillRect(centerX - holdWidth / 2, centerY + minSide * 0.17, holdWidth * scene.holdProgress, 8);
-      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.24, Math.max(14, medium * 0.68), 'center');
+      const slotSpacing = minSide * 0.15;
+      const slotY = centerY + minSide * 0.01;
+      scene.initials.split('').forEach((character, index) => {
+        const active = index === scene.initialsCursor && scene.initialsCursor < 3;
+        const slotX = centerX + (index - 1) * slotSpacing;
+        this.text(character, slotX, slotY, big * (active ? 1.5 : 1.35), 'center', active ? '#ffe8a6' : '#ffffff');
+        if (!active) return;
+        const barWidth = minSide * 0.105;
+        const barHeight = Math.max(5, minSide * 0.009);
+        ctx.fillStyle = '#ffe8a6';
+        ctx.fillRect(slotX - barWidth / 2, centerY + minSide * 0.105, barWidth, barHeight);
+        if (scene.holdProgress > 0) {
+          const progressY = centerY + minSide * 0.135;
+          ctx.fillStyle = '#ffffff55';
+          ctx.fillRect(slotX - barWidth / 2, progressY, barWidth, barHeight);
+          ctx.fillStyle = '#ffe8a6';
+          ctx.fillRect(slotX - barWidth / 2, progressY, barWidth * scene.holdProgress, barHeight);
+        }
+      });
+      this.text('TAP / SHORT PRESS: NEXT LETTER', centerX, centerY + minSide * 0.22, medium * 0.8, 'center');
+      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.3, Math.max(14, medium * 0.68), 'center');
     } else if (scene.screen === 'leaderboard') {
       this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
       this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.25, Math.max(13, minSide * 0.024), 'center', '#e7f5ff');
@@ -562,6 +576,7 @@ export class CanvasRenderer {
     const panelWidth = this.width * 0.86;
     const panelHeight = this.height * 0.68;
     const panelTop = this.height * 0.16;
+    const panelHeaderY = panelTop + minSide * 0.12;
     ctx.save();
     ctx.fillStyle = '#08152de0';
     ctx.strokeStyle = '#f6d88c88';
@@ -577,15 +592,15 @@ export class CanvasRenderer {
       this.text('SKYLINE STACK', centerX, centerY - minSide * 0.14, big, 'center', '#fff8e4');
       this.text('Stack to Cloud Nine', centerX, centerY - minSide * 0.015, medium, 'center', '#d2f3ff');
       const blink = scene.reducedMotion || Math.sin(scene.elapsed * 3.2) > -0.15;
-      if (blink) this.text('TAP / PRESS ANY BUTTON', centerX, centerY + minSide * 0.13, medium, 'center', '#ffe8a6');
+      if (blink) this.text('TAP / PRESS ANY BUTTON TO PLAY', centerX, centerY + minSide * 0.13, Math.max(24, minSide * 0.06), 'center', '#ffe8a6');
       this.text(scene.duelMode ? 'DUEL MODE · P1 LEFT / P2 RIGHT' : '60 SECONDS · ONE BUTTON · NINE LAYERS', centerX, centerY + minSide * 0.27, Math.max(14, medium * 0.62), 'center');
     } else if (card === 1) {
-      this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.3, Math.max(28, big * 0.72), 'center', '#fff2ac');
-      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.23, Math.max(14, minSide * 0.026), 'center', '#e7f5ff');
-      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.15, true, 6);
+      this.text('SKYLINE HALL OF HEIGHT', centerX, panelHeaderY, Math.max(28, big * 0.72), 'center', '#fff2ac');
+      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, panelHeaderY + minSide * 0.075, Math.max(14, minSide * 0.026), 'center', '#e7f5ff');
+      this.drawLeaderboard(scene, minSide, panelHeaderY + minSide * 0.16, true, 6);
       this.text('TAP TO TAKE YOUR PLACE', centerX, centerY + minSide * 0.31, Math.max(14, medium * 0.64), 'center', '#ffe8a6');
     } else {
-      this.text('HOW TO PLAY', centerX, centerY - minSide * 0.29, Math.max(30, big * 0.72), 'center', '#fff2ac');
+      this.text('HOW TO PLAY', centerX, panelHeaderY, Math.max(30, big * 0.72), 'center', '#fff2ac');
       const rows = [
         { y: centerY - minSide * 0.1, text: '1  TAP to drop the block', secondLine: null, icon: 0 },
         { y: centerY + minSide * 0.08, text: '2  Line it up — overhang is sliced off', secondLine: null, icon: 1 },
diff --git a/tests/flow.test.ts b/tests/flow.test.ts
index 6219672..1bbc8e6 100644
--- a/tests/flow.test.ts
+++ b/tests/flow.test.ts
@@ -11,7 +11,7 @@ function flowState(overrides: Partial<ScreenFlowState> = {}): ScreenFlowState {
     duelOut: [false, false],
     screenElapsed: 0,
     hasCandidateEntry: false,
-    lockoutSeconds: 1.2,
+    lockoutSeconds: 2,
     ...overrides,
   };
 }
@@ -64,12 +64,34 @@ describe('app screen flow', () => {
     expect(nextScreen(flowState({ screen: 'game-over', action: 'advance' }))).toBe('game-over');
     expect(nextScreen(flowState({
       screen: 'game-over',
-      screenElapsed: 1.2,
+      screenElapsed: 1.999,
+      hasCandidateEntry: true,
+      action: 'advance',
+    }))).toBe('game-over');
+    expect(nextScreen(flowState({
+      screen: 'game-over',
+      screenElapsed: 2,
       hasCandidateEntry: true,
       action: 'advance',
     }))).toBe('initials');
   });
 
+  it('keeps duel results and leaderboard on the shorter lockout', () => {
+    expect(nextScreen(flowState({
+      screen: 'game-over',
+      duelSession: true,
+      lockoutSeconds: 1.2,
+      screenElapsed: 1.2,
+      action: 'advance',
+    }))).toBe('attract');
+    expect(nextScreen(flowState({
+      screen: 'leaderboard',
+      lockoutSeconds: 1.2,
+      screenElapsed: 1.199,
+      action: 'advance',
+    }))).toBe('leaderboard');
+  });
+
   it('identifies entry side effects only on the transition into a screen', () => {
     let screen = flowState().screen;
     let sideEffects = 0;
diff --git a/tests/initials.test.ts b/tests/initials.test.ts
index 4b91093..8853ca0 100644
--- a/tests/initials.test.ts
+++ b/tests/initials.test.ts
@@ -1,8 +1,12 @@
 import { describe, expect, it } from 'vitest';
 import {
+  completeInitials,
   createInitialsState,
+  getInitialsButtonAction,
   holdInitials,
+  INITIALS_HOLD_SECONDS,
   tapInitials,
+  shouldAutoSaveInitials,
   typeInitialKey,
 } from '../src/core/initials';
 
@@ -26,4 +30,23 @@ describe('initials entry', () => {
     expect(state).toEqual({ value: 'Q2A', cursor: 3, complete: true });
     expect(typeInitialKey(state, 'Z')).toBe(state);
   });
+
+  it('moves back one slot and clears that slot with Backspace', () => {
+    let state = typeInitialKey(createInitialsState(), 'q');
+    state = typeInitialKey(state, 'Backspace');
+    expect(state).toEqual({ value: 'AAA', cursor: 0, complete: false });
+  });
+
+  it('distinguishes short presses from holds at the configured threshold', () => {
+    expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS - 0.001)).toBe('tap');
+    expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS)).toBe('hold');
+  });
+
+  it('auto-saves the current initials after 15 seconds of inactivity', () => {
+    const partial = typeInitialKey(createInitialsState(), 'q');
+    expect(shouldAutoSaveInitials(14.999)).toBe(false);
+    expect(shouldAutoSaveInitials(15)).toBe(true);
+    expect(shouldAutoSaveInitials(Number.NaN)).toBe(false);
+    expect(completeInitials(partial)).toEqual({ value: 'QAA', cursor: 3, complete: true });
+  });
 });
\ No newline at end of file
diff --git a/tests/screen-lockout.test.ts b/tests/screen-lockout.test.ts
index 1106943..29a2ade 100644
--- a/tests/screen-lockout.test.ts
+++ b/tests/screen-lockout.test.ts
@@ -1,5 +1,10 @@
 import { describe, expect, it } from 'vitest';
-import { getScreenLockoutProgress, isScreenInputLocked } from '../src/core/screen-lockout';
+import {
+  GAME_OVER_INPUT_LOCKOUT_SECONDS,
+  getScreenLockoutProgress,
+  isScreenInputLocked,
+  SCREEN_INPUT_LOCKOUT_SECONDS,
+} from '../src/core/screen-lockout';
 
 describe('screen input lockout', () => {
   it('locks input until the duration elapses and reports fill progress', () => {
@@ -16,4 +21,11 @@ describe('screen input lockout', () => {
     expect(getScreenLockoutProgress(0, 0)).toBe(1);
     expect(isScreenInputLocked(Number.POSITIVE_INFINITY)).toBe(true);
   });
+
+  it('keeps leaderboard and duel lockouts at 1.2 seconds but extends game over to 2 seconds', () => {
+    expect(SCREEN_INPUT_LOCKOUT_SECONDS).toBe(1.2);
+    expect(GAME_OVER_INPUT_LOCKOUT_SECONDS).toBe(2);
+    expect(isScreenInputLocked(1.999, GAME_OVER_INPUT_LOCKOUT_SECONDS)).toBe(true);
+    expect(isScreenInputLocked(2, GAME_OVER_INPUT_LOCKOUT_SECONDS)).toBe(false);
+  });
 });
\ No newline at end of file
```

```text
The patch review completed successfully, showing updates to initials entry, input lockouts, rendering, and related regression tests. Tests and the production build were not run.
```

### Failed to run npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

src/main.ts(191,20): error TS2552: Cannot find name 'INITIAL_HOLD_SECONDS'. Did you mean 'INITIALS_HOLD_SECONDS'?
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  13 passed (13)
      Tests  51 passed (51)
   Start at  04:33:57
   Duration  5.47s (transform 330ms, setup 0ms, import 735ms, tests 127ms, environment 1ms)
```

```text
All 13 test files passed, with 51 tests passing.
```

### Read src/main.ts [170-290]

### Edited src/main.ts +1 -1

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -188,7 +188,7 @@
     holdProgress = 0;
     saveInitials();
   } else if (!isHeld) {
-    if (duration < INITIAL_HOLD_SECONDS) initials = tapInitials(initials);
+    if (duration < INITIALS_HOLD_SECONDS) initials = tapInitials(initials);
     else initials = holdInitials(initials);
     initialsGesture = null;
     holdProgress = 0;
```

### Failed to run command -v chromium || command -v chromium-browser || command -v google-chrome || command -v firefox

### Ran npm ls --depth=0

```text
skyline-stack@1.0.0 /workspace/work/hackathons/cloud9/cloud9-minigame
├── typescript@5.9.3
├── vite@8.3.8
└── vitest@4.1.12
```

```text
The dependency check completed successfully and showed only TypeScript, Vite, and Vitest installed. The build and test commands are still running.
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 22 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 0.71 kB │ gzip:  0.41 kB
dist/assets/index-ElDgf54D.js  41.96 kB │ gzip: 15.34 kB

✓ built in 220ms
```

```text
The production build completed successfully. The test process is still running.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  13 passed (13)
      Tests  51 passed (51)
   Start at  04:34:20
   Duration  5.65s (transform 315ms, setup 0ms, import 767ms, tests 146ms, environment 1ms)
```

```text
All tests passed: 13 test files and 51 tests completed successfully.
```

### Failed to run command -v chromium || command -v chromium-browser || command -v google-chrome || command -v firefox || command -v phantomjs || command -v wkhtmltoimage

### Ran npm run preview -- --host 127.0.0.1

```text

> skyline-stack@1.0.0 preview
> vite preview --host 127.0.0.1

Port 4173 is in use, trying another one...
  ➜  Local:   http://127.0.0.1:4174/
```

```text
The preview server started in the background on port 4174 because port 4173 was already in use.
```

### Ran curl -fsSI http://127.0.0.1:4174/

```text
HTTP/1.1 200 OK
Vary: Origin
Content-Type: text/html
Cache-Control: no-cache
Etag: W/"2ce-4OeOnyNGuxQ2j7R33vQK//0cpkk"
Date: Wed, 25 Nov 2026 04:35:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

```text
The preview server responded successfully with HTTP 200, confirming the page is being served.
```

### Ran git status --short

```text
 M src/core/initials.ts
 M src/core/screen-lockout.ts
 M src/input/input.ts
 M src/main.ts
 M src/render/renderer.ts
 M tests/flow.test.ts
 M tests/initials.test.ts
 M tests/screen-lockout.test.ts
```

```text
The working tree contains modifications across application code and tests. The preview server is still running; browser-based rendering remains unverified.
```

### Ran curl -fsSI http://127.0.0.1:4174/assets/index-ElDgf54D.js

```text
HTTP/1.1 200 OK
Vary: Origin
Content-Length: 41961
Content-Type: text/javascript
Last-Modified: Wed, 25 Nov 2026 04:34:23 GMT
ETag: W/"41961-1795581263040"
Cache-Control: no-cache
Date: Wed, 25 Nov 2026 04:35:11 GMT
Connection: keep-alive
Keep-Alive: timeout=5
```

```text
The bundled JavaScript asset is served successfully with HTTP 200. The app’s canvas rendering and screenshots remain unverified because no browser is installed.
```
