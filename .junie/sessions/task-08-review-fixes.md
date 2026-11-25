# Junie CLI session — Task 08: fix all findings from Junie's own code review

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-044750-1b25

Note: when this prompt was built in the shell, the backtick-quoted commands in the pasted review text and in item 4 were swallowed by shell substitution, so item 4 reached Junie as "Run the FULL  and  until both pass". Junie ran the full `npm test` and `npm run build` anyway, as .junie/guidelines.md requires.

## Prompt given to Junie (as received)

```text
Read .junie/guidelines.md. TASK 8 of Skyline Stack: fix every issue from your own code review (junie --review over 3fee5c1..HEAD). The review result was:

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

Fix all of them:
1. Leaderboard: make the per-event map safe for prototype-named keys (Object.create(null) maps and/or own-property checks, also when deserialising), so ?event=constructor / __proto__ / toString work. Add regression tests for get/add/clear with those keys.
2. Keyboard initials: letters O and M (and D) must be typeable on the INITIALS screen — global shortcuts (M mute, O operator hold, D duel toggle) must not fire while INITIALS is active. Clear the stale keyboard suppression flag when the operator panel closes by touch. Put shortcut dispatch rules in a pure tested helper if practical.
3. Kiosk wake lock: listen for the sentinel's 'release' event, clear the reference, and re-acquire when the page is visible and kiosk mode is on (rate-limited, failures ignored).
4. Run the FULL  and  until both pass. Do not commit. Do not create files outside this directory.
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

### Searched **/*flow*

```text
.junie/sessions/task-05-flow-fix.md
src/core/flow.ts
tests/flow.test.ts
```

### Searched **/*leaderboard*

```text
src/core/leaderboard.ts
tests/leaderboard.test.ts
```

### Searched **/*initials*

```text
.junie/sessions/task-06-initials.md
src/core/initials.ts
tests/initials.test.ts
```

### Searched **/*kiosk*

```text
src/core/kiosk.ts
tests/kiosk.test.ts
```

### Read src/core/kiosk.ts

### Read src/core/initials.ts

### Read tests/leaderboard.test.ts

### Read src/core/leaderboard.ts

### Read package.json

### Read tests/kiosk.test.ts

### Read tests/initials.test.ts

### Read src/main.ts [1-111]

### Searched operator|ArrowDown|keydown|suppression|wake|release

```text
No matches found
```

### Searched tests/*.test.ts

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

### Searched requestWakeLock|release|visibilitychange|operatorOpen|operator

```text
src/main.ts [112—123]
src/main.ts [207—211]
src/main.ts [226—272]
src/main.ts [277—281]
src/main.ts [321—326]
src/main.ts [352—362]
src/main.ts [400—412]
src/main.ts [622—626]
src/main.ts [662—672]
src/main.ts [682—691]
src/render/renderer.ts [47—51]
src/render/renderer.ts [127—131]
src/render/renderer.ts [744—748]
src/render/renderer.ts [758—765]
src/render/renderer.ts [768—772]
```

### Searched wakeLock|WakeLock|visibilitychange|keydown|keyup|operator|suppression|suppress|initialsGesture|kioskMode

```text
src/main.ts [44—48]
src/main.ts [106—110]
src/main.ts [112—116]
src/main.ts [113—117]
src/main.ts [114—118]
src/main.ts [115—119]
src/main.ts [116—120]
src/main.ts [119—123]
src/main.ts [171—175]
src/main.ts [172—176]
src/main.ts [176—180]
src/main.ts [177—181]
src/main.ts [181—185]
src/main.ts [185—189]
src/main.ts [191—195]
src/main.ts [204—208]
src/main.ts [205—209]
src/main.ts [206—210]
src/main.ts [207—211]
src/main.ts [209—213]
src/main.ts [211—215]
src/main.ts [213—217]
src/main.ts [219—223]
src/main.ts [223—227]
src/main.ts [226—230]
src/main.ts [227—231]
src/main.ts [228—232]
src/main.ts [231—235]
src/main.ts [232—236]
src/main.ts [234—238]
src/main.ts [237—241]
src/main.ts [239—243]
src/main.ts [242—246]
src/main.ts [245—249]
src/main.ts [248—252]
src/main.ts [249—253]
src/main.ts [253—257]
src/main.ts [256—260]
src/main.ts [257—261]
src/main.ts [260—264]
src/main.ts [262—266]
src/main.ts [264—268]
src/main.ts [268—272]
src/main.ts [277—281]
src/main.ts [321—325]
src/main.ts [322—326]
src/main.ts [344—348]
src/main.ts [352—356]
src/main.ts [354—358]
src/main.ts [358—362]
src/main.ts [372—376]
src/main.ts [382—386]
src/main.ts [383—387]
src/main.ts [384—388]
src/main.ts [385—389]
src/main.ts [387—391]
src/main.ts [400—404]
src/main.ts [405—409]
src/main.ts [406—410]
src/main.ts [407—411]
src/main.ts [408—412]
src/main.ts [415—419]
src/main.ts [420—424]
src/main.ts [440—444]
src/main.ts [506—510]
src/main.ts [559—563]
src/main.ts [622—626]
src/main.ts [662—666]
src/main.ts [663—667]
src/main.ts [664—668]
src/main.ts [666—670]
src/main.ts [667—671]
src/main.ts [668—672]
src/main.ts [678—682]
src/main.ts [682—686]
src/main.ts [686—690]
src/main.ts [687—691]
src/main.ts [688—692]
src/main.ts [690—694]
src/main.ts [691—695]
```

### Read src/core/flow.ts

### Read src/main.ts [170-702]

### Read src/input/input.ts

### Read tests/flow.test.ts

### Read tests/inputmap.test.ts

### Edited tests/leaderboard.test.ts +19

#### tests/leaderboard.test.ts

```diff
--- a/tests/leaderboard.test.ts
+++ b/tests/leaderboard.test.ts
@@ -77,4 +77,23 @@
     expect(leaderboard.get('one')).toEqual([]);
     expect(leaderboard.get('two')).toHaveLength(1);
   });
+
+  it('supports prototype-named event keys when reading, adding, and clearing', () => {
+    const storage = new MemoryStorage();
+    const leaderboard = new Leaderboard(storage);
+    const keys = ['constructor', '__proto__', 'toString'];
+    for (const [index, key] of keys.entries()) {
+      const entry = { initials: 'KEY', score: index + 1, timestamp: index + 1 };
+      expect(leaderboard.add(key, entry)).toBe(true);
+      expect(leaderboard.get(key)).toEqual([entry]);
+    }
+
+    const restored = deserializeLeaderboards(storage.getItem('skyline-stack-leaderboard'));
+    for (const key of keys) {
+      expect(Object.prototype.hasOwnProperty.call(restored, key)).toBe(true);
+      expect(restored[key]).toHaveLength(1);
+      leaderboard.clear(key);
+      expect(leaderboard.get(key)).toEqual([]);
+    }
+  });
 });
```

### Edited tests/keyboard-shortcuts.test.ts +19

#### tests/keyboard-shortcuts.test.ts

```diff
--- a/tests/keyboard-shortcuts.test.ts
+++ b/tests/keyboard-shortcuts.test.ts
@@ -1,0 +1,19 @@
+import { describe, expect, it } from 'vitest';
+import { getKeyboardAction } from '../src/core/keyboard-shortcuts';
+
+describe('keyboard shortcut dispatch', () => {
+  it('routes all initials letters through initials entry before global shortcuts', () => {
+    for (const key of ['O', 'M', 'D']) {
+      expect(getKeyboardAction('initials', key)).toBe('initials-entry');
+      expect(getKeyboardAction('initials', key, true)).toBe('initials-entry');
+    }
+  });
+
+  it('keeps global shortcuts and operator navigation available on other screens', () => {
+    expect(getKeyboardAction('attract', 'D')).toBe('toggle-duel');
+    expect(getKeyboardAction('play', 'M')).toBe('toggle-mute');
+    expect(getKeyboardAction('play', 'O')).toBe('operator-hold');
+    expect(getKeyboardAction('play', 'ArrowDown', true)).toBe('operator-control');
+    expect(getKeyboardAction('play', 'x')).toBe('none');
+  });
+});
```

### Edited tests/kiosk.test.ts +25 -1

#### tests/kiosk.test.ts

```diff
--- a/tests/kiosk.test.ts
+++ b/tests/kiosk.test.ts
@@ -1,5 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import { shouldReturnToAttract } from '../src/core/kiosk';
+import { shouldRequestWakeLock, shouldReturnToAttract } from '../src/core/kiosk';
 
 describe('kiosk idle timeout', () => {
   it('returns from idle non-play screens but never interrupts play', () => {

@@ -8,3 +8,27 @@
     expect(shouldReturnToAttract('play', 60)).toBe(false);
   });
 });
+
+describe('kiosk wake-lock recovery', () => {
+  const readyState = {
+    kioskMode: true,
+    visible: true,
+    hasLock: false,
+    pending: false,
+    now: 10_000,
+    lastAttemptAt: 0,
+  };
+
+  it('requests a lock only while kiosk mode is visible and no request or lock exists', () => {
+    expect(shouldRequestWakeLock(readyState)).toBe(true);
+    expect(shouldRequestWakeLock({ ...readyState, kioskMode: false })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, visible: false })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, hasLock: true })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, pending: true })).toBe(false);
+  });
+
+  it('rate-limits retries after a recent request attempt', () => {
+    expect(shouldRequestWakeLock({ ...readyState, now: 4_999 })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, now: 5_000 })).toBe(true);
+  });
+});
```

### Failed to run npm test -- tests/leaderboard.test.ts tests/keyboard-shortcuts.test.ts tests/kiosk.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/leaderboard.test.ts tests/keyboard-shortcuts.test.ts tests/kiosk.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame

 ❯ tests/leaderboard.test.ts (5 tests | 1 failed) 9ms
     × supports prototype-named event keys when reading, adding, and clearing 3ms
 ❯ tests/kiosk.test.ts (3 tests | 2 failed) 5ms
     × requests a lock only while kiosk mode is visible and no request or lock exists 2ms
     × rate-limits retries after a recent request attempt 1ms
 ❯ tests/keyboard-shortcuts.test.ts (0 test)

⎯⎯⎯⎯⎯⎯ Failed Suites 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/keyboard-shortcuts.test.ts [ tests/keyboard-shortcuts.test.ts ]
Error: Cannot find module '../src/core/keyboard-shortcuts' imported from /workspace/work/hackathons/cloud9/cloud9-minigame/tests/keyboard-shortcuts.test.ts
 ❯ tests/keyboard-shortcuts.test.ts:2:1
      1| import { describe, expect, it } from 'vitest';
      2| import { getKeyboardAction } from '../src/core/keyboard-shortcuts';
       | ^
      3|
      4| describe('keyboard shortcut dispatch', () => {

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯


⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/kiosk.test.ts > kiosk wake-lock recovery > requests a lock only while kiosk mode is visible and no request or lock exists
TypeError: shouldRequestWakeLock is not a function
 ❯ tests/kiosk.test.ts:23:12
     21|
     22|   it('requests a lock only while kiosk mode is visible and no request …
     23|     expect(shouldRequestWakeLock(readyState)).toBe(true);
       |            ^
     24|     expect(shouldRequestWakeLock({ ...readyState, kioskMode: false }))…
     25|     expect(shouldRequestWakeLock({ ...readyState, visible: false })).t…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/kiosk.test.ts > kiosk wake-lock recovery > rate-limits retries after a recent request attempt
TypeError: shouldRequestWakeLock is not a function
 ❯ tests/kiosk.test.ts:31:12
     29|
     30|   it('rate-limits retries after a recent request attempt', () => {
     31|     expect(shouldRequestWakeLock({ ...readyState, now: 4_999 })).toBe(…
       |            ^
     32|     expect(shouldRequestWakeLock({ ...readyState, now: 5_000 })).toBe(…
     33|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/leaderboard.test.ts > leaderboard > supports prototype-named event keys when reading, adding, and clearing
TypeError: (leaderboards[eventKey] ?? []) is not iterable
 ❯ Leaderboard.add src/core/leaderboard.ts:86:64
     84|     if (!eventKey.trim() || !normalized) return false;
     85|     const leaderboards = deserializeLeaderboards(this.storage.getItem(…
     86|     const entries = sortEntries([...(leaderboards[eventKey] ?? []), no…
       |                                                                ^
     87|     leaderboards[eventKey] = entries;
     88|     this.storage.setItem(this.storageKey, serializeLeaderboards(leader…
 ❯ tests/leaderboard.test.ts:87:26

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  3 failed (3)
      Tests  3 failed | 5 passed (8)
   Start at  04:49:29
   Duration  750ms (transform 61ms, setup 0ms, import 92ms, tests 14ms, environment 0ms)
```

### Edited src/core/leaderboard.ts +1 -1

#### src/core/leaderboard.ts

```diff
--- a/src/core/leaderboard.ts
+++ b/src/core/leaderboard.ts
@@ -56,7 +56,7 @@
   try {
     const parsed: unknown = JSON.parse(serialized);
     if (!isRecord(parsed)) return {};
-    const leaderboards: EventLeaderboards = {};
+    const leaderboards = Object.create(null) as EventLeaderboards;
     for (const [eventKey, value] of Object.entries(parsed)) {
       if (!Array.isArray(value)) continue;
       const entries = value.map(parseEntry).filter((entry): entry is LeaderboardEntry => entry !== null);
```

### Edited src/core/leaderboard.ts +8 -4

#### src/core/leaderboard.ts

```diff
--- a/src/core/leaderboard.ts
+++ b/src/core/leaderboard.ts
@@ -38,6 +38,10 @@
   return typeof value === 'object' && value !== null && !Array.isArray(value);
 }
 
+function emptyLeaderboards(): EventLeaderboards {
+  return Object.create(null) as EventLeaderboards;
+}
+
 function parseEntry(value: unknown): LeaderboardEntry | null {
   if (!isRecord(value)) return null;
   const { initials, score, timestamp } = value;

@@ -52,11 +56,11 @@
 }
 
 export function deserializeLeaderboards(serialized: string | null): EventLeaderboards {
-  if (!serialized) return {};
+  if (!serialized) return emptyLeaderboards();
   try {
     const parsed: unknown = JSON.parse(serialized);
-    if (!isRecord(parsed)) return {};
-    const leaderboards = Object.create(null) as EventLeaderboards;
+    if (!isRecord(parsed)) return emptyLeaderboards();
+    const leaderboards = emptyLeaderboards();
     for (const [eventKey, value] of Object.entries(parsed)) {
       if (!Array.isArray(value)) continue;
       const entries = value.map(parseEntry).filter((entry): entry is LeaderboardEntry => entry !== null);

@@ -64,7 +68,7 @@
     }
     return leaderboards;
   } catch {
-    return {};
+    return emptyLeaderboards();
   }
 }
```

### Edited src/core/keyboard-shortcuts.ts +24

#### src/core/keyboard-shortcuts.ts

```diff
--- a/src/core/keyboard-shortcuts.ts
+++ b/src/core/keyboard-shortcuts.ts
@@ -1,0 +1,24 @@
+import type { AppScreen } from './flow';
+
+export type KeyboardAction =
+  | 'operator-control'
+  | 'initials-entry'
+  | 'operator-hold'
+  | 'toggle-duel'
+  | 'toggle-mute'
+  | 'none';
+
+export function getKeyboardAction(
+  screen: AppScreen,
+  key: string,
+  operatorOpen = false,
+): KeyboardAction {
+  if (screen === 'initials') return 'initials-entry';
+  if (operatorOpen) return 'operator-control';
+
+  const normalized = key.toLowerCase();
+  if (normalized === 'o') return 'operator-hold';
+  if (normalized === 'd' && screen === 'attract') return 'toggle-duel';
+  if (normalized === 'm') return 'toggle-mute';
+  return 'none';
+}
```

### Edited src/core/kiosk.ts +19

#### src/core/kiosk.ts

```diff
--- a/src/core/kiosk.ts
+++ b/src/core/kiosk.ts
@@ -1,5 +1,15 @@
 export const KIOSK_IDLE_SECONDS = 20;
+export const WAKE_LOCK_RETRY_INTERVAL_MS = 5_000;
 
+export interface WakeLockRequestState {
+  kioskMode: boolean;
+  visible: boolean;
+  hasLock: boolean;
+  pending: boolean;
+  now: number;
+  lastAttemptAt: number;
+}
+
 /** Kiosk screens return to attract after inactivity, but never interrupt active play. */
 export function shouldReturnToAttract(
   screen: string,

@@ -8,3 +18,12 @@
 ): boolean {
   return screen !== 'play' && idleSeconds >= Math.max(0, timeout);
 }
+
+export function shouldRequestWakeLock(state: WakeLockRequestState): boolean {
+  return state.kioskMode
+    && state.visible
+    && !state.hasLock
+    && !state.pending
+    && Number.isFinite(state.now)
+    && state.now - state.lastAttemptAt >= WAKE_LOCK_RETRY_INTERVAL_MS;
+}
```

### Edited src/main.ts +75 -16

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -13,7 +13,12 @@
 import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
 import { getDuelOutcome, type DuelWinner } from './core/duel';
 import { enteredScreen, nextScreen, type AppScreen, type ScreenFlowAction } from './core/flow';
-import { shouldReturnToAttract } from './core/kiosk';
+import {
+  shouldRequestWakeLock,
+  shouldReturnToAttract,
+  WAKE_LOCK_RETRY_INTERVAL_MS,
+} from './core/kiosk';
+import { getKeyboardAction } from './core/keyboard-shortcuts';
 import { nextRandom } from './core/rng';
 import {
   GAME_OVER_INPUT_LOCKOUT_SECONDS,

@@ -86,6 +91,11 @@
 const renderer = new CanvasRenderer(canvas);
 const STEP = 1 / 120;
 
+interface WakeLockSentinelLike {
+  release(): Promise<void>;
+  addEventListener(type: 'release', listener: () => void, options?: { once?: boolean }): void;
+}
+
 let screen: AppScreen = 'attract';
 let round: RoundState = createRound(nextRoundSeed());
 let duelRound: RoundState = createRound(round.seed);

@@ -118,7 +128,10 @@
 let operatorPointerStarted = 0;
 let kioskIdleSeconds = 0;
 let inputActivity = false;
-let wakeLock: { release: () => Promise<void> } | null = null;
+let wakeLock: WakeLockSentinelLike | null = null;
+let wakeLockRequestPending = false;
+let lastWakeLockAttemptAt = Number.NEGATIVE_INFINITY;
+let wakeLockRetryTimer: number | null = null;
 let kioskGestureStarted = false;
 let cloudNineAge = -1;
 

@@ -203,16 +216,52 @@
   activateGesture();
 }
 
+function scheduleWakeLockRetry(): void {
+  if (!kioskMode || document.hidden || wakeLockRetryTimer !== null) return;
+  const remaining = WAKE_LOCK_RETRY_INTERVAL_MS - (performance.now() - lastWakeLockAttemptAt);
+  wakeLockRetryTimer = window.setTimeout(() => {
+    wakeLockRetryTimer = null;
+    void acquireWakeLock();
+  }, Math.max(0, remaining));
+}
+
 async function acquireWakeLock(): Promise<void> {
-  if (!kioskMode || wakeLock) return;
+  if (!kioskMode || document.hidden || wakeLock || wakeLockRequestPending) return;
   const wakeLockNavigator = navigator as Navigator & {
-    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
+    wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
   };
   if (!wakeLockNavigator.wakeLock) return;
+  const now = performance.now();
+  if (!shouldRequestWakeLock({
+    kioskMode,
+    visible: !document.hidden,
+    hasLock: wakeLock !== null,
+    pending: wakeLockRequestPending,
+    now,
+    lastAttemptAt: lastWakeLockAttemptAt,
+  })) {
+    scheduleWakeLockRetry();
+    return;
+  }
+
+  wakeLockRequestPending = true;
+  lastWakeLockAttemptAt = now;
   try {
-    wakeLock = await wakeLockNavigator.wakeLock.request('screen');
+    const sentinel = await wakeLockNavigator.wakeLock.request('screen');
+    if (document.hidden) {
+      void sentinel.release().catch(() => undefined);
+      return;
+    }
+    wakeLock = sentinel;
+    sentinel.addEventListener('release', () => {
+      if (wakeLock === sentinel) wakeLock = null;
+      if (!document.hidden) void acquireWakeLock();
+    }, { once: true });
   } catch {
     wakeLock = null;
+  } finally {
+    wakeLockRequestPending = false;
+    if (!wakeLock && !document.hidden) scheduleWakeLockRetry();
   }
 }
 

@@ -230,6 +279,12 @@
   operatorConfirmClear = false;
 }
 
+function closeOperatorPanel(): void {
+  operatorOpen = false;
+  operatorConfirmClear = false;
+  ignoreNextKeyboardPress = false;
+}
+
 function activateOperator(index: number): void {
   operatorSelected = index;
   if (index === 0) {

@@ -247,8 +302,7 @@
     operatorConfirmClear = false;
     duelEnabled = !duelEnabled;
   } else {
-    operatorOpen = false;
-    operatorConfirmClear = false;
+    closeOperatorPanel();
   }
 }
 

@@ -255,8 +309,7 @@
 function handleOperatorKey(key: string): void {
   const normalized = key.toLowerCase();
   if (normalized === 'escape') {
-    operatorOpen = false;
-    operatorConfirmClear = false;
+    closeOperatorPanel();
   } else if (normalized === 'arrowup' || normalized === 'arrowdown') {
     const direction = normalized === 'arrowup' ? -1 : 1;
     operatorSelected = (operatorSelected + direction + 4) % 4;

@@ -350,25 +403,26 @@
 const INITIALS_BUTTON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
 
 function onKey(key: string): void {
-  const normalized = key.toLowerCase();
-  if (operatorOpen) {
+  const action = getKeyboardAction(screen, key, operatorOpen);
+  if (action === 'operator-control') {
+    const normalized = key.toLowerCase();
     ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup', 'arrowdown'].includes(normalized);
     handleOperatorKey(key);
     return;
   }
-  if (normalized === 'o') {
+  if (action === 'operator-hold') {
     operatorKeyStarted = performance.now();
     return;
   }
-  if (normalized === 'd' && screen === 'attract') {
+  if (action === 'toggle-duel') {
     duelEnabled = !duelEnabled;
     return;
   }
-  if (key.toLowerCase() === 'm') {
+  if (action === 'toggle-mute') {
     audio.toggleMute();
     return;
   }
-  if (screen === 'initials') {
+  if (action === 'initials-entry') {
     const normalized = key.toLowerCase();
     if (INITIALS_BUTTON_KEYS.has(normalized)) {
       initialsGesture = { started: performance.now(), player: 0, key: normalized };

@@ -685,9 +739,14 @@
   if (document.hidden) {
     lastFrame = 0;
     accumulator = 0;
+    if (wakeLockRetryTimer !== null) {
+      window.clearTimeout(wakeLockRetryTimer);
+      wakeLockRetryTimer = null;
+    }
     if (wakeLock) {
-      void wakeLock.release().catch(() => undefined);
+      const releasedWakeLock = wakeLock;
       wakeLock = null;
+      void releasedWakeLock.release().catch(() => undefined);
     }
   } else if (kioskMode) {
     void acquireWakeLock();
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 23 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 1.49 kB │ gzip:  0.69 kB
dist/assets/index-D3bHnpRr.js  45.82 kB │ gzip: 16.59 kB

✓ built in 83ms
```

```text
The TypeScript check and Vite production build completed successfully.
```

### Ran npm test -- tests/leaderboard.test.ts tests/keyboard-shortcuts.test.ts tests/kiosk.test.ts tests/initials.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/leaderboard.test.ts tests/keyboard-shortcuts.test.ts tests/kiosk.test.ts tests/initials.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  4 passed (4)
      Tests  15 passed (15)
   Start at  04:50:25
   Duration  1.60s (transform 114ms, setup 0ms, import 225ms, tests 23ms, environment 0ms)
```

```text
All four focused test files passed, with 15 tests passing overall. The TypeScript/Vite build is still running.
```

### Ran git diff --check && git status --short && git diff --stat

```text
 M src/core/kiosk.ts
 M src/core/leaderboard.ts
 M src/main.ts
 M tests/kiosk.test.ts
 M tests/leaderboard.test.ts
?? .junie/sessions/review-01.md
?? src/core/keyboard-shortcuts.ts
?? tests/keyboard-shortcuts.test.ts
 src/core/kiosk.ts         | 19 ++++++++++
 src/core/leaderboard.ts   | 12 ++++---
 src/main.ts               | 91 ++++++++++++++++++++++++++++++++++++++---------
 tests/kiosk.test.ts       | 26 +++++++++++++-
 tests/leaderboard.test.ts | 19 ++++++++++
 5 files changed, 146 insertions(+), 21 deletions(-)
```

```text
The diff check passed, and the working tree contains modified and untracked files. The full test suite and build are still running.
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 23 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 1.49 kB │ gzip:  0.69 kB
dist/assets/index-D3bHnpRr.js  45.82 kB │ gzip: 16.59 kB

✓ built in 130ms
```

```text
The production build completed successfully, including TypeScript checks and Vite bundling.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  14 passed (14)
      Tests  56 passed (56)
   Start at  04:50:40
   Duration  4.27s (transform 230ms, setup 0ms, import 590ms, tests 126ms, environment 1ms)
```

```text
The full test suite passed: all 56 tests across 14 files succeeded.
```

### Read src/core/keyboard-shortcuts.ts

### Read tests/keyboard-shortcuts.test.ts

### Ran git diff -- src/core/leaderboard.ts src/core/kiosk.ts src/main.ts tests/leaderboard.test.ts tests/kiosk.test.ts

```text
diff --git a/src/core/kiosk.ts b/src/core/kiosk.ts
index b35851b..771cce1 100644
--- a/src/core/kiosk.ts
+++ b/src/core/kiosk.ts
@@ -1,4 +1,14 @@
 export const KIOSK_IDLE_SECONDS = 20;
+export const WAKE_LOCK_RETRY_INTERVAL_MS = 5_000;
+
+export interface WakeLockRequestState {
+  kioskMode: boolean;
+  visible: boolean;
+  hasLock: boolean;
+  pending: boolean;
+  now: number;
+  lastAttemptAt: number;
+}
 
 /** Kiosk screens return to attract after inactivity, but never interrupt active play. */
 export function shouldReturnToAttract(
@@ -7,4 +17,13 @@ export function shouldReturnToAttract(
   timeout = KIOSK_IDLE_SECONDS,
 ): boolean {
   return screen !== 'play' && idleSeconds >= Math.max(0, timeout);
+}
+
+export function shouldRequestWakeLock(state: WakeLockRequestState): boolean {
+  return state.kioskMode
+    && state.visible
+    && !state.hasLock
+    && !state.pending
+    && Number.isFinite(state.now)
+    && state.now - state.lastAttemptAt >= WAKE_LOCK_RETRY_INTERVAL_MS;
 }
\ No newline at end of file
diff --git a/src/core/leaderboard.ts b/src/core/leaderboard.ts
index 83508a5..3935da6 100644
--- a/src/core/leaderboard.ts
+++ b/src/core/leaderboard.ts
@@ -38,6 +38,10 @@ function isRecord(value: unknown): value is Record<string, unknown> {
   return typeof value === 'object' && value !== null && !Array.isArray(value);
 }
 
+function emptyLeaderboards(): EventLeaderboards {
+  return Object.create(null) as EventLeaderboards;
+}
+
 function parseEntry(value: unknown): LeaderboardEntry | null {
   if (!isRecord(value)) return null;
   const { initials, score, timestamp } = value;
@@ -52,11 +56,11 @@ export function serializeLeaderboards(leaderboards: EventLeaderboards): string {
 }
 
 export function deserializeLeaderboards(serialized: string | null): EventLeaderboards {
-  if (!serialized) return {};
+  if (!serialized) return emptyLeaderboards();
   try {
     const parsed: unknown = JSON.parse(serialized);
-    if (!isRecord(parsed)) return {};
-    const leaderboards: EventLeaderboards = {};
+    if (!isRecord(parsed)) return emptyLeaderboards();
+    const leaderboards = emptyLeaderboards();
     for (const [eventKey, value] of Object.entries(parsed)) {
       if (!Array.isArray(value)) continue;
       const entries = value.map(parseEntry).filter((entry): entry is LeaderboardEntry => entry !== null);
@@ -64,7 +68,7 @@ export function deserializeLeaderboards(serialized: string | null): EventLeaderb
     }
     return leaderboards;
   } catch {
-    return {};
+    return emptyLeaderboards();
   }
 }
 
diff --git a/src/main.ts b/src/main.ts
index 4ac06bb..58f80a4 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -13,7 +13,12 @@ import {
 import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
 import { getDuelOutcome, type DuelWinner } from './core/duel';
 import { enteredScreen, nextScreen, type AppScreen, type ScreenFlowAction } from './core/flow';
-import { shouldReturnToAttract } from './core/kiosk';
+import {
+  shouldRequestWakeLock,
+  shouldReturnToAttract,
+  WAKE_LOCK_RETRY_INTERVAL_MS,
+} from './core/kiosk';
+import { getKeyboardAction } from './core/keyboard-shortcuts';
 import { nextRandom } from './core/rng';
 import {
   GAME_OVER_INPUT_LOCKOUT_SECONDS,
@@ -86,6 +91,11 @@ const audio = new SynthAudio(params.get('mute') === '1');
 const renderer = new CanvasRenderer(canvas);
 const STEP = 1 / 120;
 
+interface WakeLockSentinelLike {
+  release(): Promise<void>;
+  addEventListener(type: 'release', listener: () => void, options?: { once?: boolean }): void;
+}
+
 let screen: AppScreen = 'attract';
 let round: RoundState = createRound(nextRoundSeed());
 let duelRound: RoundState = createRound(round.seed);
@@ -118,7 +128,10 @@ let operatorKeyStarted = 0;
 let operatorPointerStarted = 0;
 let kioskIdleSeconds = 0;
 let inputActivity = false;
-let wakeLock: { release: () => Promise<void> } | null = null;
+let wakeLock: WakeLockSentinelLike | null = null;
+let wakeLockRequestPending = false;
+let lastWakeLockAttemptAt = Number.NEGATIVE_INFINITY;
+let wakeLockRetryTimer: number | null = null;
 let kioskGestureStarted = false;
 let cloudNineAge = -1;
 
@@ -203,16 +216,52 @@ function noteActivity(): void {
   activateGesture();
 }
 
+function scheduleWakeLockRetry(): void {
+  if (!kioskMode || document.hidden || wakeLockRetryTimer !== null) return;
+  const remaining = WAKE_LOCK_RETRY_INTERVAL_MS - (performance.now() - lastWakeLockAttemptAt);
+  wakeLockRetryTimer = window.setTimeout(() => {
+    wakeLockRetryTimer = null;
+    void acquireWakeLock();
+  }, Math.max(0, remaining));
+}
+
 async function acquireWakeLock(): Promise<void> {
-  if (!kioskMode || wakeLock) return;
+  if (!kioskMode || document.hidden || wakeLock || wakeLockRequestPending) return;
   const wakeLockNavigator = navigator as Navigator & {
-    wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> };
+    wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
   };
   if (!wakeLockNavigator.wakeLock) return;
+  const now = performance.now();
+  if (!shouldRequestWakeLock({
+    kioskMode,
+    visible: !document.hidden,
+    hasLock: wakeLock !== null,
+    pending: wakeLockRequestPending,
+    now,
+    lastAttemptAt: lastWakeLockAttemptAt,
+  })) {
+    scheduleWakeLockRetry();
+    return;
+  }
+
+  wakeLockRequestPending = true;
+  lastWakeLockAttemptAt = now;
   try {
-    wakeLock = await wakeLockNavigator.wakeLock.request('screen');
+    const sentinel = await wakeLockNavigator.wakeLock.request('screen');
+    if (document.hidden) {
+      void sentinel.release().catch(() => undefined);
+      return;
+    }
+    wakeLock = sentinel;
+    sentinel.addEventListener('release', () => {
+      if (wakeLock === sentinel) wakeLock = null;
+      if (!document.hidden) void acquireWakeLock();
+    }, { once: true });
   } catch {
     wakeLock = null;
+  } finally {
+    wakeLockRequestPending = false;
+    if (!wakeLock && !document.hidden) scheduleWakeLockRetry();
   }
 }
 
@@ -230,6 +279,12 @@ function openOperatorPanel(): void {
   operatorConfirmClear = false;
 }
 
+function closeOperatorPanel(): void {
+  operatorOpen = false;
+  operatorConfirmClear = false;
+  ignoreNextKeyboardPress = false;
+}
+
 function activateOperator(index: number): void {
   operatorSelected = index;
   if (index === 0) {
@@ -247,16 +302,14 @@ function activateOperator(index: number): void {
     operatorConfirmClear = false;
     duelEnabled = !duelEnabled;
   } else {
-    operatorOpen = false;
-    operatorConfirmClear = false;
+    closeOperatorPanel();
   }
 }
 
 function handleOperatorKey(key: string): void {
   const normalized = key.toLowerCase();
   if (normalized === 'escape') {
-    operatorOpen = false;
-    operatorConfirmClear = false;
+    closeOperatorPanel();
   } else if (normalized === 'arrowup' || normalized === 'arrowdown') {
     const direction = normalized === 'arrowup' ? -1 : 1;
     operatorSelected = (operatorSelected + direction + 4) % 4;
@@ -350,25 +403,26 @@ function onInput(event: PressEvent): void {
 const INITIALS_BUTTON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
 
 function onKey(key: string): void {
-  const normalized = key.toLowerCase();
-  if (operatorOpen) {
+  const action = getKeyboardAction(screen, key, operatorOpen);
+  if (action === 'operator-control') {
+    const normalized = key.toLowerCase();
     ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup', 'arrowdown'].includes(normalized);
     handleOperatorKey(key);
     return;
   }
-  if (normalized === 'o') {
+  if (action === 'operator-hold') {
     operatorKeyStarted = performance.now();
     return;
   }
-  if (normalized === 'd' && screen === 'attract') {
+  if (action === 'toggle-duel') {
     duelEnabled = !duelEnabled;
     return;
   }
-  if (key.toLowerCase() === 'm') {
+  if (action === 'toggle-mute') {
     audio.toggleMute();
     return;
   }
-  if (screen === 'initials') {
+  if (action === 'initials-entry') {
     const normalized = key.toLowerCase();
     if (INITIALS_BUTTON_KEYS.has(normalized)) {
       initialsGesture = { started: performance.now(), player: 0, key: normalized };
@@ -685,9 +739,14 @@ document.addEventListener('visibilitychange', () => {
   if (document.hidden) {
     lastFrame = 0;
     accumulator = 0;
+    if (wakeLockRetryTimer !== null) {
+      window.clearTimeout(wakeLockRetryTimer);
+      wakeLockRetryTimer = null;
+    }
     if (wakeLock) {
-      void wakeLock.release().catch(() => undefined);
+      const releasedWakeLock = wakeLock;
       wakeLock = null;
+      void releasedWakeLock.release().catch(() => undefined);
     }
   } else if (kioskMode) {
     void acquireWakeLock();
diff --git a/tests/kiosk.test.ts b/tests/kiosk.test.ts
index 9ef54bf..9fcebc0 100644
--- a/tests/kiosk.test.ts
+++ b/tests/kiosk.test.ts
@@ -1,5 +1,5 @@
 import { describe, expect, it } from 'vitest';
-import { shouldReturnToAttract } from '../src/core/kiosk';
+import { shouldRequestWakeLock, shouldReturnToAttract } from '../src/core/kiosk';
 
 describe('kiosk idle timeout', () => {
   it('returns from idle non-play screens but never interrupts play', () => {
@@ -7,4 +7,28 @@ describe('kiosk idle timeout', () => {
     expect(shouldReturnToAttract('attract', 19.9)).toBe(false);
     expect(shouldReturnToAttract('play', 60)).toBe(false);
   });
+});
+
+describe('kiosk wake-lock recovery', () => {
+  const readyState = {
+    kioskMode: true,
+    visible: true,
+    hasLock: false,
+    pending: false,
+    now: 10_000,
+    lastAttemptAt: 0,
+  };
+
+  it('requests a lock only while kiosk mode is visible and no request or lock exists', () => {
+    expect(shouldRequestWakeLock(readyState)).toBe(true);
+    expect(shouldRequestWakeLock({ ...readyState, kioskMode: false })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, visible: false })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, hasLock: true })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, pending: true })).toBe(false);
+  });
+
+  it('rate-limits retries after a recent request attempt', () => {
+    expect(shouldRequestWakeLock({ ...readyState, now: 4_999 })).toBe(false);
+    expect(shouldRequestWakeLock({ ...readyState, now: 5_000 })).toBe(true);
+  });
 });
\ No newline at end of file
diff --git a/tests/leaderboard.test.ts b/tests/leaderboard.test.ts
index 86cb999..38f66e6 100644
--- a/tests/leaderboard.test.ts
+++ b/tests/leaderboard.test.ts
@@ -77,4 +77,23 @@ describe('leaderboard', () => {
     expect(leaderboard.get('one')).toEqual([]);
     expect(leaderboard.get('two')).toHaveLength(1);
   });
+
+  it('supports prototype-named event keys when reading, adding, and clearing', () => {
+    const storage = new MemoryStorage();
+    const leaderboard = new Leaderboard(storage);
+    const keys = ['constructor', '__proto__', 'toString'];
+    for (const [index, key] of keys.entries()) {
+      const entry = { initials: 'KEY', score: index + 1, timestamp: index + 1 };
+      expect(leaderboard.add(key, entry)).toBe(true);
+      expect(leaderboard.get(key)).toEqual([entry]);
+    }
+
+    const restored = deserializeLeaderboards(storage.getItem('skyline-stack-leaderboard'));
+    for (const key of keys) {
+      expect(Object.prototype.hasOwnProperty.call(restored, key)).toBe(true);
+      expect(restored[key]).toHaveLength(1);
+      leaderboard.clear(key);
+      expect(leaderboard.get(key)).toEqual([]);
+    }
+  });
 });
\ No newline at end of file
```

```text
The diff includes prototype-safe leaderboard deserialization, kiosk wake-lock recovery, and updates to keyboard handling and operator panel state. The preceding validation passed all 56 tests and the production build, with no diff-check issues.
```

### Searched EventLeaderboards\s*=\s*\{|emptyLeaderboards|leaderboards\[eventKey\]

```text
src/core/leaderboard.ts [39—43]
src/core/leaderboard.ts [57—61]
src/core/leaderboard.ts [60—64]
src/core/leaderboard.ts [61—65]
src/core/leaderboard.ts [65—69]
src/core/leaderboard.ts [69—73]
src/core/leaderboard.ts [88—92]
src/core/leaderboard.ts [89—93]
src/core/leaderboard.ts [100—104]
```

### Searched operatorOpen\s*=\s*false|ignoreNextKeyboardPress\s*=\s*false|addEventListener\('release'

```text
src/main.ts [121—125]
src/main.ts [122—126]
src/main.ts [254—258]
src/main.ts [281—285]
src/main.ts [283—287]
src/main.ts [371—375]
```

### Read src/main.ts [195-761]

### Edited src/main.ts +5 -5

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -279,13 +279,13 @@
   operatorConfirmClear = false;
 }
 
-function closeOperatorPanel(): void {
+function closeOperatorPanel(preserveKeyboardSuppression = false): void {
   operatorOpen = false;
   operatorConfirmClear = false;
-  ignoreNextKeyboardPress = false;
+  if (!preserveKeyboardSuppression) ignoreNextKeyboardPress = false;
 }
 
-function activateOperator(index: number): void {
+function activateOperator(index: number, preserveKeyboardSuppression = false): void {
   operatorSelected = index;
   if (index === 0) {
     if (operatorConfirmClear) {

@@ -302,7 +302,7 @@
     operatorConfirmClear = false;
     duelEnabled = !duelEnabled;
   } else {
-    closeOperatorPanel();
+    closeOperatorPanel(preserveKeyboardSuppression);
   }
 }
 

@@ -314,7 +314,7 @@
     const direction = normalized === 'arrowup' ? -1 : 1;
     operatorSelected = (operatorSelected + direction + 4) % 4;
   } else if (normalized === 'enter' || normalized === ' ' || normalized === 'space') {
-    activateOperator(operatorSelected);
+    activateOperator(operatorSelected, true);
   } else if (/^[1-4]$/.test(normalized)) {
     activateOperator(Number(normalized) - 1);
   }
```

### Ran git diff --check

```text
The diff check completed successfully with no issues reported. The full tests and build are still running.
```

### Ran npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

vite v8.3.8 building client environment for production...
transforming...
✓ 23 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                 1.49 kB │ gzip:  0.70 kB
dist/assets/index-DALAjNJD.js  45.84 kB │ gzip: 16.59 kB

✓ built in 135ms
```

```text
The production build completed successfully with no errors.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  14 passed (14)
      Tests  56 passed (56)
   Start at  04:51:31
   Duration  4.36s (transform 326ms, setup 0ms, import 692ms, tests 114ms, environment 1ms)
```

```text
The full test suite passed: all 14 test files and 56 tests succeeded.
```
