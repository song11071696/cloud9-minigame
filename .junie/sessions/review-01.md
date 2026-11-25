# Junie CLI session — Code review (junie --review) over all Junie task commits

Junie CLI 26.11.3, headless `--review` mode, Junie Lite (free tier). Session: session-261125-044216-e82s

Command: `junie --review "Review the whole game: the last 7 commits (3fee5c1..HEAD). Focus on correctness bugs in src/core and src/main.ts, input edge cases on touch/gamepad/keyboard, kiosk robustness, memory leaks in the render loop, and anything that would break during an all-day booth session."`

## Review result

● TASK RESULT
**Verdict**: Changes requested — `?event=constructor` crashes the game during its first render.
**Goal**: Deliver a booth-ready stacking game with duel, kiosk/operator controls, initials entry, and per-event leaderboards.
**Quality**: Core logic is separated and has focused tests; UI shortcut dispatch and kiosk wake-lock recovery have edge cases not covered by integration tests.
**Issues**:
- Critical: A sanitized `constructor` event key resolves to an inherited property and crashes leaderboard reads.
- Keyboard initials cannot enter O or M; operator navigation can also leave a stale suppression flag after ArrowDown then touch-close.
- A browser-released wake lock is not cleared or retried during a visible session.
**Validation**: `npm test -- tests/inputmap.test.ts tests/initials.test.ts tests/flow.test.ts tests/kiosk.test.ts tests/screen-lockout.test.ts tests/duel.test.ts` passed (6 files, 25 tests); `npm run build` passed. A temporary diagnostic in `tests/leaderboard.test.ts` failed as expected with `TypeError: entries.map is not a function` for `constructor`; it was removed, and the post-cleanup `npm test -- tests/leaderboard.test.ts` passed (4 tests). Working tree is clean. Delegated core and renderer/audio audits were read-only and ran no tests; no render/audio leak was evidenced, but those paths lack direct tests in the changed test set. Full suite and CI results were not run/available.
# FILES

## Junie transcript (verbatim export)

# Session transcript

### Ran Fetching PR comments

```text
No PR comments were available for the local changes.
```

### Ran git diff --stat --no-color --no-ext-diff --no-textconv 3fee5c1..HEAD

```text
 .junie/sessions/task-02-playable.md   | 1668 ++++++++++++++++++
 .junie/sessions/task-03-booth.md      | 2987 +++++++++++++++++++++++++++++++++
 .junie/sessions/task-04-polish.md     | 1087 ++++++++++++
 .junie/sessions/task-05-flow-fix.md   |  749 +++++++++
 .junie/sessions/task-06-initials.md   | 1426 ++++++++++++++++
 .junie/sessions/task-07-results-ui.md |  710 ++++++++
 index.html                            |   14 +
 src/audio/synth.ts                    |  173 ++
 src/core/attract.ts                   |    6 +-
 src/core/duel.ts                      |   18 +
 src/core/flow.ts                      |   48 +
 src/core/initials.ts                  |   15 +
 src/core/inputmap.ts                  |   34 +
 src/core/kiosk.ts                     |   10 +
 src/core/leaderboard.ts               |   11 +
 src/core/round.ts                     |    2 +-
 src/core/screen-lockout.ts            |   19 +
 src/core/stack.ts                     |    4 +-
 src/input/input.ts                    |  171 ++
 src/main.ts                           |  705 +++++++-
 src/render/renderer.ts                |  890 ++++++++++
 tests/attract.test.ts                 |   31 +
 tests/duel.test.ts                    |   17 +
 tests/flow.test.ts                    |  111 ++
 tests/initials.test.ts                |   23 +
 tests/inputmap.test.ts                |   25 +
 tests/kiosk.test.ts                   |   10 +
 tests/leaderboard.test.ts             |    7 +
 tests/round.test.ts                   |   21 +
 tests/screen-lockout.test.ts          |   31 +
 tests/stack.test.ts                   |   12 +
 tsconfig.json                         |    1 +
 32 files changed, 11026 insertions(+), 10 deletions(-)
```

```text
The commit range contains changes across 32 files, with 11,026 insertions and 10 deletions. The diff summary was retrieved successfully.
```

### Ran git status --short

```text
The working tree is clean, with no uncommitted changes.
```

### Ran git rev-parse HEAD

```text
331b98109b5164ce1b710745809b96cc6a4e6a50
```

```text
The current revision was verified as `331b98109b5164ce1b710745809b96cc6a4e6a50`.
```

### Searched onInput|beginRound|enterResults|operator|kiosk|inputActivity|updateInitialsGesture|idle

```text
src/core/attract.ts [8—13]
src/core/attract.ts [24—39]
src/core/initials.ts [13—18]
src/core/kiosk.ts [4—10]
src/main.ts [14—18]
src/main.ts [44—48]
src/main.ts [112—124]
src/main.ts [132—136]
src/main.ts [149—153]
src/main.ts [155—159]
src/main.ts [171—175]
src/main.ts [198—203]
src/main.ts [205—209]
src/main.ts [219—224]
src/main.ts [227—253]
src/main.ts [256—266]
src/main.ts [316—330]
src/main.ts [352—356]
src/main.ts [358—362]
src/main.ts [400—417]
src/main.ts [420—425]
src/main.ts [491—495]
src/main.ts [559—570]
src/main.ts [622—626]
src/main.ts [662—671]
src/main.ts [678—682]
src/main.ts [690—694]
src/render/renderer.ts [47—51]
src/render/renderer.ts [127—131]
src/render/renderer.ts [759—765]
src/render/renderer.ts [768—772]
tests/attract.test.ts [15—19]
tests/kiosk.test.ts [1—7]
```

### Read src/main.ts [1-702]

### Read src/input/input.ts

### Read src/core/flow.ts

### Read src/core/screen-lockout.ts

### Read tests/initials.test.ts

### Read src/core/initials.ts

### Read package.json

### Ran git log --oneline --decorate 3fee5c1..HEAD

```text
331b981 (HEAD -> main) Junie task 07: panelled result screens, reason-specific game over, large leaderboard rows, inline favicon + meta
0706a4a Junie task 06: arcade-button (Space/Enter) initials tap/hold, active slot highlight, 15 s initials auto-save, 2 s game-over lockout
17266e2 Junie task 05: fix freeze after a miss; pure level-triggered screen flow (src/core/flow.ts) + regression tests
2200a9c Junie task 04: result-screen lockout, attract cards, stronger demo bot, Cloud Nine celebration, ?test=1 hook
523df2d Junie task 03: playtest fixes, kiosk mode, per-event boards, 2P duel, operator panel
ec42c6f Junie task 02: input (kbd/touch/gamepad), Web Audio synth, canvas renderer, screens + leaderboard flow
```

```text
The commit history shows six recent task commits covering game flow, input, kiosk and duel modes, result screens, leaderboards, and related fixes.
```

### Ran git diff --unified=4 --no-color --no-ext-diff --no-textconv 3fee5c1..HEAD -- src/main.ts src/input/input.ts

```text
diff --git a/src/input/input.ts b/src/input/input.ts
new file mode 100644
index 0000000..97d4b98
--- /dev/null
+++ b/src/input/input.ts
@@ -0,0 +1,171 @@
+import { routePress, type PlayerIndex } from '../core/inputmap';
+
+export interface PressEvent {
+  type: 'press';
+  player: PlayerIndex;
+  source: 'keyboard' | 'pointer' | 'gamepad';
+  key?: string;
+  x?: number;
+  y?: number;
+}
+
+export interface InputOptions {
+  isDuel: () => boolean;
+  onPress: (event: PressEvent) => void;
+  onKey?: (key: string) => void;
+  onKeyUp?: (key: string) => void;
+  onGesture?: () => void;
+  onActivity?: () => void;
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
+  const emit = (player: PlayerIndex, source: PressEvent['source'], key?: string, x?: number, y?: number): void => {
+    const now = performance.now();
+    if (now - lastPress[player] < DEBOUNCE_MS) return;
+    lastPress[player] = now;
+    options.onPress({
+      type: 'press', player, source,
+      ...(key ? { key } : {}),
+      ...(x === undefined ? {} : { x }),
+      ...(y === undefined ? {} : { y }),
+    });
+  };
+
+  const keydown = (event: KeyboardEvent): void => {
+    if (event.ctrlKey || event.metaKey || event.altKey) return;
+    const token = event.key.toLowerCase();
+    options.onActivity?.();
+    signalGesture();
+    if (heldKeys.has(token)) return;
+    heldKeys.add(token);
+    options.onKey?.(event.key);
+    const player = routePress({ source: 'keyboard', key: event.key }, options.isDuel());
+    if (player === null) return;
+    event.preventDefault();
+    keyPlayers.set(token, player);
+    signalGesture();
+    emit(player, 'keyboard', event.key);
+  };
+
+  const keyup = (event: KeyboardEvent): void => {
+    const token = event.key.toLowerCase();
+    if (!heldKeys.delete(token)) return;
+    keyPlayers.delete(token);
+    options.onKeyUp?.(event.key);
+  };
+
+  const pointerdown = (event: PointerEvent): void => {
+    options.onActivity?.();
+    const bounds = canvas.getBoundingClientRect();
+    signalGesture();
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
+    emit(player, 'pointer', undefined, event.clientX - bounds.left, event.clientY - bounds.top);
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
+      if (!pads) {
+        heldGamepads[0] = false;
+        heldGamepads[1] = false;
+        pressedGamepadButtons.clear();
+        return;
+      }
+      for (let index = 0; index < pads.length; index += 1) {
+        const pad = pads[index];
+        if (!pad || !pad.connected) continue;
+        const down = pad.buttons
+          .map((button, buttonIndex) => button.pressed ? buttonIndex : -1)
+          .filter((buttonIndex) => buttonIndex >= 0);
+        if (down.length > 0) {
+          options.onActivity?.();
+          signalGesture();
+        }
+        const player = routePress({ source: 'gamepad', index, buttons: down }, options.isDuel());
+        if (player === null) continue;
+        currentlyHeld[player] = true;
+        for (const buttonIndex of down.filter((button) => [0, 1, 2, 3, 9].includes(button))) {
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
\ No newline at end of file
diff --git a/src/main.ts b/src/main.ts
index 675089b..4ac06bb 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -1,5 +1,702 @@
-const canvas = document.querySelector<HTMLCanvasElement>('#game');
+import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
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
+import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
+import { getDuelOutcome, type DuelWinner } from './core/duel';
+import { enteredScreen, nextScreen, type AppScreen, type ScreenFlowAction } from './core/flow';
+import { shouldReturnToAttract } from './core/kiosk';
+import { nextRandom } from './core/rng';
+import {
+  GAME_OVER_INPUT_LOCKOUT_SECONDS,
+  getScreenLockoutProgress,
+  SCREEN_INPUT_LOCKOUT_SECONDS,
+} from './core/screen-lockout';
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
+import { CanvasRenderer, type DebrisAnimation, type RendererScene } from './render/renderer';
+import packageInfo from '../package.json';
 
-if (!canvas) {
-  throw new Error('The game canvas is missing.');
-}
\ No newline at end of file
+const canvasElement = document.querySelector<HTMLCanvasElement>('#game');
+if (!canvasElement) throw new Error('The game canvas is missing.');
+const canvas: HTMLCanvasElement = canvasElement;
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
+let initialsGesture: { started: number; player: 0 | 1; key?: string } | null = null;
+let holdProgress = 0;
+let initialsIdleSeconds = 0;
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
+let cloudNineAge = -1;
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
+  applyScreenFlow('start');
+  previousCountdown = 3;
+  previousWarningSecond = ROUND_SECONDS;
+  perfects = 0;
+  perfectText = '';
+  perfectAge = -1;
+  layerFlash = 0;
+  cloudNineAge = -1;
+  debris = [];
+  candidateEntry = null;
+  highlightedEntry = null;
+  kioskIdleSeconds = 0;
+  audio.countdown(3);
+}
+
+function returnToAttract(): void {
+  applyScreenFlow('return');
+  kioskIdleSeconds = 0;
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
+  applyScreenFlow('initials-complete');
+}
+
+function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]): void {
+  if (screen !== 'initials' || !initialsGesture) {
+    holdProgress = 0;
+    return;
+  }
+  const duration = Math.max(0, (now - initialsGesture.started) / 1000);
+  if (initialsGesture.key) {
+    holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
+    return;
+  }
+  const isHeld = holds[initialsGesture.player];
+  holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
+  if (isHeld && duration >= INITIALS_HOLD_SECONDS) {
+    initials = holdInitials(initials);
+    initialsGesture = null;
+    holdProgress = 0;
+    saveInitials();
+  } else if (!isHeld) {
+    if (duration < INITIALS_HOLD_SECONDS) initials = tapInitials(initials);
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
+  if (screen === 'initials') initialsIdleSeconds = 0;
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
+  if (!activeRound.reachedCloudNine && updated.reachedCloudNine) {
+    cloudNineAge = 0;
+    audio.cloudNine();
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
+    applyScreenFlow('advance');
+    return;
+  }
+  if (screen === 'leaderboard') {
+    if (event.player !== 0) return;
+    applyScreenFlow('advance');
+    return;
+  }
+  if (screen === 'initials' && event.player === 0 && event.source !== 'keyboard') {
+    initialsGesture = { started: performance.now(), player: event.player };
+  }
+}
+
+const INITIALS_BUTTON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
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
+    if (INITIALS_BUTTON_KEYS.has(normalized)) {
+      initialsGesture = { started: performance.now(), player: 0, key: normalized };
+      holdProgress = 0;
+      return;
+    }
+    initials = typeInitialKey(initials, key);
+    saveInitials();
+    return;
+  }
+}
+
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
+window.addEventListener('pointercancel', () => { operatorPointerStarted = 0; });
+window.addEventListener('keyup', (event) => {
+  if (event.key.toLowerCase() === 'o') operatorKeyStarted = 0;
+});
+
+const input: InputController = createInput(canvas, {
+  isDuel: () => duelEnabled || duelSession,
+  onPress: onInput,
+  onKey,
+  onKeyUp,
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
+  const oldDuelPhase = duelRound.phase;
+  round = updateRound(round, dt);
+  if (duelSession) duelRound = updateRound(duelRound, dt);
+  if (oldPhase === 'countdown' && round.phase === 'countdown') {
+    const countdown = Math.ceil(3 - round.phaseElapsed);
+    if (countdown < previousCountdown && countdown >= 1) audio.countdown(countdown);
+    previousCountdown = countdown;
+  }
+  const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
+  const timerWasPlaying = duelSession && round.phase === 'over' ? oldDuelPhase === 'playing' : oldPhase === 'playing';
+  if (timerWasPlaying && timerRound.phase === 'playing') {
+    const remaining = Math.ceil(timerRound.timeRemaining);
+    if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
+    previousWarningSecond = remaining;
+  }
+}
+
+function transitionTo(next: AppScreen): void {
+  const previous = screen;
+  if (previous === next) return;
+  screen = next;
+  screenElapsed = 0;
+
+  if (enteredScreen(previous, next, 'play')) audio.countdown(0);
+  if (enteredScreen(previous, next, 'game-over')) {
+    kioskIdleSeconds = 0;
+    audio.gameOver();
+    if (duelSession) {
+      const outcome = getDuelOutcome(
+        [round.score, duelRound.score],
+        [round.endReason === 'missed', duelRound.endReason === 'missed'],
+        [round.phase === 'over', duelRound.phase === 'over'],
+      );
+      duelWinner = outcome.winner;
+    } else if (isHighScore(round.score)) {
+      candidateEntry = { initials: 'AAA', score: round.score, timestamp: Date.now() };
+    }
+  }
+  if (enteredScreen(previous, next, 'initials')) {
+    initials = createInitialsState();
+    initialsGesture = null;
+    holdProgress = 0;
+    initialsIdleSeconds = 0;
+    audio.highScore();
+  }
+  if (enteredScreen(previous, next, 'attract')) {
+    duelSession = false;
+    duelWinner = null;
+    candidateEntry = null;
+  }
+}
+
+function applyScreenFlow(action?: ScreenFlowAction): void {
+  const next = nextScreen({
+    screen,
+    roundPhase: round.phase,
+    duelSession,
+    duelPhases: [round.phase, duelRound.phase],
+    duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
+    screenElapsed,
+    hasCandidateEntry: candidateEntry !== null,
+    lockoutSeconds: screen === 'game-over' && !duelSession
+      ? GAME_OVER_INPUT_LOCKOUT_SECONDS
+      : SCREEN_INPUT_LOCKOUT_SECONDS,
+    ...(action ? { action } : {}),
+  });
+  transitionTo(next);
+}
+
+function update(dt: number): void {
+  elapsed += dt;
+  screenElapsed += dt;
+  perfectAge = perfectAge < 0 ? perfectAge : perfectAge + dt;
+  if (cloudNineAge >= 0) {
+    cloudNineAge += dt;
+    if (cloudNineAge >= 3.5) {
+      cloudNineAge = -1;
+    }
+  }
+  layerFlash = Math.max(0, layerFlash - dt);
+  debris = debris.map((piece) => ({ ...piece, age: piece.age + dt })).filter((piece) => piece.age < 1.4);
+  if (screen === 'attract') updateDemo(dt);
+  updateRoundState(dt);
+  applyScreenFlow();
+  if (screen === 'initials') {
+    initialsIdleSeconds += dt;
+    if (shouldAutoSaveInitials(initialsIdleSeconds)) {
+      initials = completeInitials(initials);
+      saveInitials();
+    }
+  } else {
+    initialsIdleSeconds = 0;
+  }
+  if (kioskMode) {
+    if (inputActivity) kioskIdleSeconds = 0;
+    else if (screen === 'play') kioskIdleSeconds = 0;
+    else kioskIdleSeconds += dt;
+    inputActivity = false;
+    if (shouldReturnToAttract(screen, kioskIdleSeconds)) {
+      returnToAttract();
+      kioskIdleSeconds = 0;
+    }
+  }
+  const currentRound = screen === 'attract' ? demoRound : duelSession && round.phase === 'over' ? duelRound : round;
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
+    todayBest: entries[0] ?? null,
+    eventName,
+    initials: initials.value,
+    initialsCursor: initials.cursor,
+    holdProgress,
+    muted: audio.isMuted,
+    reducedMotion,
+    duelMode: duelEnabled,
+    duelRounds: duelSession ? [getRoundSnapshot(round), getRoundSnapshot(duelRound)] : null,
+    duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
+    duelWinner,
+    lockoutProgress: screen === 'game-over' || screen === 'leaderboard'
+      ? getScreenLockoutProgress(
+        screenElapsed,
+        screen === 'game-over' && !duelSession
+          ? GAME_OVER_INPUT_LOCKOUT_SECONDS
+          : SCREEN_INPUT_LOCKOUT_SECONDS,
+      )
+      : 1,
+    cloudNineAge,
+    operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
+  };
+  renderer.render(scene, dt);
+}
+
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
+        duel: duelSession || duelEnabled,
+      });
+    },
+  });
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
+  const holdNow = performance.now();
+  if (operatorKeyStarted > 0 && holdNow - operatorKeyStarted >= 3000) {
+    operatorKeyStarted = 0;
+    openOperatorPanel();
+  }
+  if (operatorPointerStarted > 0 && holdNow - operatorPointerStarted >= 3000) {
+    operatorPointerStarted = 0;
+    openOperatorPanel();
+  }
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
+    if (wakeLock) {
+      void wakeLock.release().catch(() => undefined);
+      wakeLock = null;
+    }
+  } else if (kioskMode) {
+    void acquireWakeLock();
+  }
+});
+
+requestAnimationFrame(frame);
+
+window.addEventListener('beforeunload', () => {
+  input.destroy();
+  renderer.destroy();
+});
\ No newline at end of file
```

```text
The diff completed without errors. A likely initials-entry issue remains: the M key triggers mute before initials input is checked, preventing players from entering M.
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
dist/index.html                 1.49 kB │ gzip:  0.69 kB
dist/assets/index-QxI1c8f6.js  44.78 kB │ gzip: 16.18 kB

✓ built in 119ms
```

```text
The production build completed successfully, including TypeScript checks. Focused input tests were still running.
```

### Ran npm test -- tests/inputmap.test.ts tests/initials.test.ts tests/flow.test.ts tests/kiosk.test.ts tests/screen-lockout.test.ts tests/duel.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/inputmap.test.ts tests/initials.test.ts tests/flow.test.ts tests/kiosk.test.ts tests/screen-lockout.test.ts tests/duel.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  6 passed (6)
      Tests  25 passed (25)
   Start at  04:43:41
   Duration  2.13s (transform 177ms, setup 0ms, import 341ms, tests 25ms, environment 0ms)
```

```text
All six focused test files passed, with 25 tests passing.
```

### Subagent core-review junie-lite/gpt-6-luna finished

## Candidate finding
- **[P2] Prevent sanitized event keys from colliding with object properties** — `src/core/leaderboard.ts:22` (new line)
- **Impact:** An event name such as `constructor` sanitizes to `constructor`. With no leaderboard stored for that event, `Leaderboard.get('constructor')` reads the inherited `Object` constructor from the plain-object map and later calls `.map` on it; `add('constructor', ...)` attempts to spread that non-iterable function. Either operation can throw instead of handling the event.
- **Evidence:** The new sanitizer lowercases and retains `constructor`; the existing `get`/`add` methods index a normal `{}`-backed record without own-property checks. This is a **reading-only** conclusion; I did not execute it.
- **Suggested review comment:** “Could we make the leaderboard map safe for prototype-named event keys? For example, initialize deserialized maps with `Object.create(null)` (and/or use own-property checks). `sanitizeEventKey('constructor')` currently returns a key that collides with the inherited `constructor` property, so a fresh leaderboard `get`/`add` can throw.”
- **Recommended test:** Add cases to `tests/leaderboard.test.ts` covering `sanitizeEventKey('constructor')` followed by `get` and `add` on empty storage. Run `npm test -- tests/leaderboard.test.ts`.
No other evidence-backed candidate findings from the reviewed scope. **No tests were run due to read-only mode.**

### Subagent render-audio-review junie-lite/gpt-6-luna finished

## Candidate finding
- **P2 — READY screen renders only a dim overlay, with no prompt** — `src/render/renderer.ts:508-537` (especially lines 508, 510, and 514-537). `drawScreen()` returns for `play`, then draws a full-screen overlay for every other screen, but has branches only for `attract`, `countdown`, `game-over`, `initials`, and `leaderboard`. The specified app flow includes `READY`; when that state reaches this renderer, it receives the overlay but no screen content or instruction, leaving players without a clear indication to start. **Suggested review comment:** “Please handle the `ready` screen here (or avoid applying the overlay to unhandled screens): as written, READY gets the dark overlay but no ready/tap prompt.” **Suggested replacement:** add an explicit `else if (scene.screen === 'ready')` branch that draws a “READY” heading and “TAP / PRESS TO START” prompt before the overlay block is restored.
## Resource review and coverage
I did not find a sufficiently evidenced render-loop memory leak: the renderer retains only camera values and removes its resize listener in `destroy()`. Synth voices and chop sources are stopped after finite durations; the code does not explicitly disconnect their nodes, but I cannot establish from this code alone that the stopped, unreferenced nodes accumulate in supported browsers, so I am not reporting that as a confirmed candidate.
No tests in the changed test set directly reference `CanvasRenderer`, `SynthAudio`, `AudioContext`, or renderer calls, leaving these rendering and audio lifecycle paths untested by the changed tests. **No tests were run due to read-only mode.** HEAD was verified as `331b98109b5164ce1b710745809b96cc6a4e6a50`.

### Searched type AppScreen|AppScreen =|screen === 'ready'|screen: 'ready'|'ready'

```text
src/core/flow.ts [1—5]
src/core/round.ts [13—17]
src/core/round.ts [51—55]
src/core/round.ts [77—81]
src/core/round.ts [111—115]
src/main.ts [13—17]
src/main.ts [87—91]
```

### Read tests/leaderboard.test.ts

### Read src/core/leaderboard.ts

### Read src/render/renderer.ts [1-111]

### Edited tests/leaderboard.test.ts +6

#### tests/leaderboard.test.ts

```diff
--- a/tests/leaderboard.test.ts
+++ b/tests/leaderboard.test.ts
@@ -31,6 +31,12 @@
     expect(sanitizeEventKey('!!!')).toBe('default');
     expect(sanitizeEventKey('My_event/Day')).toBe('my-event-day');
   });
+  it('handles event names that match inherited object properties', () => {
+    const leaderboard = new Leaderboard(new MemoryStorage());
+    const eventKey = sanitizeEventKey('constructor');
+    expect(() => leaderboard.get(eventKey)).not.toThrow();
+    expect(() => leaderboard.add(eventKey, { initials: 'ABC', score: 1, timestamp: 1 })).not.toThrow();
+  });
   it('validates initials, sorts by score and earlier timestamp, and keeps top ten per event', () => {
     const storage = new MemoryStorage();
     const leaderboard = new Leaderboard(storage);
```

### Failed to run npm test -- tests/leaderboard.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/leaderboard.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame

 ❯ tests/leaderboard.test.ts (5 tests | 1 failed) 10ms
     × handles event names that match inherited object properties 4ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/leaderboard.test.ts > leaderboard > handles event names that match inherited object properties
AssertionError: expected [Function] to not throw an error but 'TypeError: entries.map is not a funct…' was thrown

- Expected:
undefined

+ Received:
"TypeError: entries.map is not a function"

 ❯ tests/leaderboard.test.ts:37:49
     35|     const leaderboard = new Leaderboard(new MemoryStorage());
     36|     const eventKey = sanitizeEventKey('constructor');
     37|     expect(() => leaderboard.get(eventKey)).not.toThrow();
       |                                                 ^
     38|     expect(() => leaderboard.add(eventKey, { initials: 'ABC', score: 1…
     39|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 4 passed (5)
   Start at  04:44:35
   Duration  271ms (transform 32ms, setup 0ms, import 52ms, tests 10ms, environment 0ms)
```

### Edited tests/leaderboard.test.ts -6

#### tests/leaderboard.test.ts

```diff
--- a/tests/leaderboard.test.ts
+++ b/tests/leaderboard.test.ts
@@ -31,12 +31,6 @@
     expect(sanitizeEventKey('!!!')).toBe('default');
     expect(sanitizeEventKey('My_event/Day')).toBe('my-event-day');
   });
-  it('handles event names that match inherited object properties', () => {
-    const leaderboard = new Leaderboard(new MemoryStorage());
-    const eventKey = sanitizeEventKey('constructor');
-    expect(() => leaderboard.get(eventKey)).not.toThrow();
-    expect(() => leaderboard.add(eventKey, { initials: 'ABC', score: 1, timestamp: 1 })).not.toThrow();
-  });
   it('validates initials, sorts by score and earlier timestamp, and keeps top ten per event', () => {
     const storage = new MemoryStorage();
     const leaderboard = new Leaderboard(storage);
```

### Ran git status --short

```text
The working tree is clean. Baseline leaderboard tests are still running.
```

### Ran git diff -- tests/leaderboard.test.ts

```text
The leaderboard test file has no uncommitted changes. The baseline leaderboard tests are still running.
```

### Ran npm test -- tests/leaderboard.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/leaderboard.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  04:45:30
   Duration  285ms (transform 29ms, setup 0ms, import 50ms, tests 6ms, environment 0ms)
```

```text
The leaderboard test suite passed: 1 test file and all 4 tests succeeded.
```

## Junie

A critical inline review comment was posted on the leaderboard code, reporting that the `constructor` event value can crash startup and recommending safe handling of reserved event keys.

## Junie

An inline review comment was posted noting that global shortcuts intercept O and M during initials entry, and requesting context-aware shortcut handling.

## Junie

An inline review comment was posted identifying a wake-lock recovery issue and recommending clearing released sentinels so a later gesture can reacquire the lock.

## Junie

An inline review comment was posted identifying that ArrowDown can leave keyboard input suppressed after the operator panel is closed by touch, and suggesting a fix.

### Ran git status --short

```text
The working tree is clean; no uncommitted changes are reported.
```
