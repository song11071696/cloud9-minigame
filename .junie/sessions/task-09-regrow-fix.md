# Junie CLI session — Task 09: PERFECT x3 regrow fix

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-102530-1d37

## Prompt given to Junie (as received)

```text
Read .junie/guidelines.md. TASK 9 of Skyline Stack: playtest bug + booth polish.

1. BUG: "PERFECT x3 grows it back" never grows. In src/core/stack.ts dropBlock computes maximumWidth = Math.min(worldWidth, options.maxWidth ?? worldWidth, base.width). Because a perfect drop already has overlapWidth == base.width, the grow-back (overlapWidth + GROWTH_WIDTH) is always capped back to base.width, so the block never regrows. Fix: cap the regrown width at the layer/start maximum (INITIAL_BLOCK_WIDTH = 60, or options.maxWidth when given, and never wider than the world), NOT at base.width. Keep the landed block fully inside the world. Make src/core/round.ts (pressRound, around the dropBlock call) and any duel code that drops blocks pass maxWidth: INITIAL_BLOCK_WIDTH explicitly so the rule is visible at the call site.
2. Tests: add regression tests in tests/stack.test.ts (three perfect drops in a row on a narrowed base grow the block by GROWTH_WIDTH; growth never exceeds INITIAL_BLOCK_WIDTH; a non-perfect third drop does not grow; the grown block stays inside the world) and one in tests/round.test.ts proving that a round with a narrowed tower regains width after PERFECT x3. Update any existing test that encoded the old (buggy) cap.
3. Run the FULL `npm test` and `npm run build` until both pass. Do not commit. Do not create files outside this directory.
```

## Junie transcript (verbatim export)

# Session transcript

### Read src/core/round.ts

### Read tests/stack.test.ts

### Read package.json

### Read .junie/guidelines.md

### Read src/core/stack.ts

### Read tests/round.test.ts

### Searched src/**/*duel*

```text
src/core/duel.ts
```

### Searched dropBlock\(

```text
src/core/round.ts [83—87]
src/core/stack.ts [81—85]
src/main.ts [341—345]
```

### Searched dropBlock\(|GROWTH_WIDTH|perfectStreak|width.*60

```text
tests/attract.test.ts [19—24]
tests/flow.test.ts [20—24]
tests/round.test.ts [35—39]
tests/round.test.ts [41—45]
tests/round.test.ts [52—56]
tests/stack.test.ts [7—11]
tests/stack.test.ts [13—20]
tests/stack.test.ts [22—28]
tests/stack.test.ts [31—35]
tests/stack.test.ts [38—42]
tests/stack.test.ts [46—50]
tests/stack.test.ts [52—76]
```

### Searched INITIAL_BLOCK_WIDTH|import .*stack

```text
src/core/attract.ts [1—4]
src/core/stack.ts [1—4]
src/core/stack.ts [34—38]
src/main.ts [34—38]
src/render/renderer.ts [1—4]
```

### Read tests/duel.test.ts

### Read src/main.ts [310-430]

### Read src/core/duel.ts

### Edited tests/stack.test.ts +68 -7

#### tests/stack.test.ts

```diff
--- a/tests/stack.test.ts
+++ b/tests/stack.test.ts
@@ -1,5 +1,12 @@
 import { describe, expect, it } from 'vitest';
-import { advanceBlock, createBaseBlock, dropBlock } from '../src/core/stack';
+import {
+  advanceBlock,
+  createBaseBlock,
+  dropBlock,
+  GROWTH_WIDTH,
+  INITIAL_BLOCK_WIDTH,
+  WORLD_WIDTH,
+} from '../src/core/stack';
 import { createRound, pressRound, updateRound } from '../src/core/round';
 
 describe('stack mechanics', () => {

@@ -59,14 +66,68 @@
     expect(result.chopped).toEqual([]);
   });
 
-  it('grows width by two after three perfects and respects the cap', () => {
-    const narrowerBase = { x: 20, width: 60, direction: 1 as const };
-    const growing = dropBlock({ x: 20, width: 50, direction: 1 }, narrowerBase, 2);
-    const capped = dropBlock({ x: 20, width: 60, direction: 1 }, narrowerBase, 2);
-    expect(growing.block?.width).toBe(52);
-    expect(capped.block?.width).toBe(60);
+  it('grows a narrowed block after three consecutive perfect drops', () => {
+    let tower = { x: 25, width: 50, direction: 1 as const };
+    let perfectStreak = 0;
+
+    for (let drop = 0; drop < 3; drop += 1) {
+      const result = dropBlock(
+        { x: tower.x, width: tower.width, direction: 1 },
+        tower,
+        perfectStreak,
+        { maxWidth: INITIAL_BLOCK_WIDTH },
+      );
+      expect(result.landed).toBe(true);
+      tower = result.block!;
+      perfectStreak = result.perfectStreak;
+    }
+
+    expect(tower.width).toBe(50 + GROWTH_WIDTH);
   });
 
+  it('never grows beyond the initial block width', () => {
+    let tower = { x: 20, width: INITIAL_BLOCK_WIDTH - 1, direction: 1 as const };
+    let perfectStreak = 2;
+
+    for (let drop = 0; drop < 12; drop += 1) {
+      const result = dropBlock(
+        { x: tower.x, width: tower.width, direction: 1 },
+        tower,
+        perfectStreak,
+        { maxWidth: INITIAL_BLOCK_WIDTH },
+      );
+      tower = result.block!;
+      perfectStreak = result.perfectStreak;
+    }
+
+    expect(tower.width).toBe(INITIAL_BLOCK_WIDTH);
+  });
+
+  it('does not grow when the third drop in a streak is not perfect', () => {
+    const tower = { x: 25, width: 50, direction: 1 as const };
+    const result = dropBlock({ x: 27, width: 50, direction: 1 }, tower, 2, {
+      maxWidth: INITIAL_BLOCK_WIDTH,
+    });
+
+    expect(result.perfect).toBe(false);
+    expect(result.perfectStreak).toBe(0);
+    expect(result.block?.width).toBe(48);
+  });
+
+  it('keeps a regrown block fully inside the world', () => {
+    const edgeTower = { x: WORLD_WIDTH - 10, width: 10, direction: 1 as const };
+    const result = dropBlock(
+      { x: edgeTower.x, width: edgeTower.width, direction: 1 },
+      edgeTower,
+      2,
+      { maxWidth: INITIAL_BLOCK_WIDTH },
+    );
+
+    expect(result.block?.width).toBe(10 + GROWTH_WIDTH);
+    expect(result.block!.x).toBeGreaterThanOrEqual(0);
+    expect(result.block!.x + result.block!.width).toBeLessThanOrEqual(WORLD_WIDTH);
+  });
+
   it('detects a zero-overlap miss', () => {
     const result = dropBlock({ x: 80, width: 20, direction: 1 }, base, 4);
     expect(result.landed).toBe(false);
```

### Edited tests/round.test.ts +20

#### tests/round.test.ts

```diff
--- a/tests/round.test.ts
+++ b/tests/round.test.ts
@@ -7,6 +7,7 @@
   ROUND_SECONDS,
   updateRound,
 } from '../src/core/round';
+import { GROWTH_WIDTH } from '../src/core/stack';
 
 describe('round state machine', () => {
   it('moves from ready through countdown to play, then ends on time-up', () => {

@@ -32,6 +33,25 @@
     expect(round.movingBlock).not.toBeNull();
   });
 
+  it('regains width after three perfect drops on a narrowed tower', () => {
+    let round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS);
+    round = {
+      ...round,
+      blocks: [{ x: 25, width: 50, direction: 1 }],
+      movingBlock: { x: 25, width: 50, direction: 1 },
+    };
+
+    for (let drop = 0; drop < 3; drop += 1) {
+      const base = round.blocks.at(-1)!;
+      round = pressRound({
+        ...round,
+        movingBlock: { x: base.x, width: base.width, direction: 1 },
+      });
+    }
+
+    expect(round.blocks.at(-1)?.width).toBe(50 + GROWTH_WIDTH);
+  });
+
   it('scores a perfect press and ends when the next block misses', () => {
     let round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS);
     round = { ...round, movingBlock: { x: 20, width: 60, direction: 1 } };
```

### Failed to run npm test -- tests/stack.test.ts tests/round.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/stack.test.ts tests/round.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame

 ❯ tests/stack.test.ts (12 tests | 3 failed) 17ms
     × grows a narrowed block after three consecutive perfect drops 6ms
     × never grows beyond the initial block width 1ms
     × keeps a regrown block fully inside the world 1ms
 ❯ tests/round.test.ts (5 tests | 1 failed) 9ms
     × regains width after three perfect drops on a narrowed tower 5ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/round.test.ts > round state machine > regains width after three perfect drops on a narrowed tower
AssertionError: expected 50 to be 52 // Object.is equality

- Expected
+ Received

- 52
+ 50

 ❯ tests/round.test.ts:52:40
     50|     }
     51|
     52|     expect(round.blocks.at(-1)?.width).toBe(50 + GROWTH_WIDTH);
       |                                        ^
     53|   });
     54|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  tests/stack.test.ts > stack mechanics > grows a narrowed block after three consecutive perfect drops
AssertionError: expected 50 to be 52 // Object.is equality

- Expected
+ Received

- 52
+ 50

 ❯ tests/stack.test.ts:85:25
     83|     }
     84|
     85|     expect(tower.width).toBe(50 + GROWTH_WIDTH);
       |                         ^
     86|   });
     87|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  tests/stack.test.ts > stack mechanics > never grows beyond the initial block width
AssertionError: expected 59 to be 60 // Object.is equality

- Expected
+ Received

- 60
+ 59

 ❯ tests/stack.test.ts:103:25
    101|     }
    102|
    103|     expect(tower.width).toBe(INITIAL_BLOCK_WIDTH);
       |                         ^
    104|   });
    105|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  tests/stack.test.ts > stack mechanics > keeps a regrown block fully inside the world
AssertionError: expected 10 to be 12 // Object.is equality

- Expected
+ Received

- 12
+ 10

 ❯ tests/stack.test.ts:126:33
    124|     );
    125|
    126|     expect(result.block?.width).toBe(10 + GROWTH_WIDTH);
       |                                 ^
    127|     expect(result.block!.x).toBeGreaterThanOrEqual(0);
    128|     expect(result.block!.x + result.block!.width).toBeLessThanOrEqual(…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  2 failed (2)
      Tests  4 failed | 13 passed (17)
   Start at  10:26:31
   Duration  2.37s (transform 192ms, setup 0ms, import 291ms, tests 26ms, environment 0ms)

npm notice
npm notice New major version of npm available! 10.9.9 -> 12.2.3
npm notice Changelog: https://github.com/npm/cli/releases/tag/v12.2.3
npm notice To update run: npm install -g npm@12.2.3
npm notice
```

### Edited src/core/stack.ts +1 -1

#### src/core/stack.ts

```diff
--- a/src/core/stack.ts
+++ b/src/core/stack.ts
@@ -120,7 +120,7 @@
   const perfectStreak = perfect ? previousPerfectStreak + 1 : 0;
   const combo = perfect ? perfectStreak : 0;
   const shouldGrow = perfect && perfectStreak % PERFECTS_PER_GROWTH === 0;
-  const maximumWidth = Math.min(worldWidth, options.maxWidth ?? worldWidth, base.width);
+  const maximumWidth = Math.min(worldWidth, options.maxWidth ?? INITIAL_BLOCK_WIDTH);
   const grownWidth = shouldGrow
     ? Math.min(maximumWidth, overlapWidth + GROWTH_WIDTH)
     : overlapWidth;
```

### Edited src/core/round.ts +5 -1

#### src/core/round.ts

```diff
--- a/src/core/round.ts
+++ b/src/core/round.ts
@@ -5,6 +5,7 @@
   createBaseBlock,
   createMovingBlock,
   dropBlock,
+  INITIAL_BLOCK_WIDTH,
   WORLD_WIDTH,
   type Block,
 } from './stack';

@@ -82,7 +83,10 @@
   if (state.phase !== 'playing' || !state.movingBlock) return state;
 
   const base = state.blocks[state.blocks.length - 1]!;
-  const result = dropBlock(state.movingBlock, base, state.perfectStreak, { worldWidth: WORLD_WIDTH });
+  const result = dropBlock(state.movingBlock, base, state.perfectStreak, {
+    worldWidth: WORLD_WIDTH,
+    maxWidth: INITIAL_BLOCK_WIDTH,
+  });
   if (!result.landed || !result.block) {
     return { ...state, phase: 'over', movingBlock: null, endReason: 'missed' };
   }
```

### Edited src/main.ts +5 -2

#### src/main.ts

```diff
--- a/src/main.ts
+++ b/src/main.ts
@@ -33,7 +33,7 @@
   updateRound,
   type RoundState,
 } from './core/round';
-import { dropBlock, WORLD_WIDTH } from './core/stack';
+import { dropBlock, INITIAL_BLOCK_WIDTH, WORLD_WIDTH } from './core/stack';
 import { SynthAudio } from './audio/synth';
 import { createInput, type InputController, type PressEvent } from './input/input';
 import { CanvasRenderer, type DebrisAnimation, type RendererScene } from './render/renderer';

@@ -340,7 +340,10 @@
   if (activeRound.phase !== 'playing' || !activeRound.movingBlock) return;
   const moving = activeRound.movingBlock;
   const target = activeRound.blocks[activeRound.blocks.length - 1]!;
-  const result = dropBlock(moving, target, activeRound.perfectStreak, { worldWidth: WORLD_WIDTH });
+  const result = dropBlock(moving, target, activeRound.perfectStreak, {
+    worldWidth: WORLD_WIDTH,
+    maxWidth: INITIAL_BLOCK_WIDTH,
+  });
   const updated = pressRound(activeRound);
   if (player === 0) round = updated;
   else duelRound = updated;
```

### Ran npm test -- tests/stack.test.ts tests/round.test.ts

```text

> skyline-stack@1.0.0 test
> vitest run tests/stack.test.ts tests/round.test.ts


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  2 passed (2)
      Tests  17 passed (17)
   Start at  10:27:00
   Duration  635ms (transform 122ms, setup 0ms, import 187ms, tests 13ms, environment 0ms)
```

```text
The focused stack and round tests passed: 17 tests across 2 files.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  14 passed (14)
      Tests  60 passed (60)
   Start at  10:27:06
   Duration  3.93s (transform 239ms, setup 0ms, import 612ms, tests 100ms, environment 1ms)
```

```text
All tests passed: 14 test files and 60 tests. The production build is still running.
```

### Failed to run npm run build

```text

> skyline-stack@1.0.0 build
> tsc --noEmit && vite build

tests/stack.test.ts(81,7): error TS2322: Type 'Block' is not assignable to type '{ x: number; width: number; direction: 1; }'.
  Types of property 'direction' are incompatible.
    Type '1 | -1' is not assignable to type '1'.
      Type '-1' is not assignable to type '1'.
tests/stack.test.ts(99,7): error TS2322: Type 'Block' is not assignable to type '{ x: number; width: number; direction: 1; }'.
  Types of property 'direction' are incompatible.
    Type '1 | -1' is not assignable to type '1'.
      Type '-1' is not assignable to type '1'.
```

### Edited tests/stack.test.ts +3 -2

#### tests/stack.test.ts

```diff
--- a/tests/stack.test.ts
+++ b/tests/stack.test.ts
@@ -6,6 +6,7 @@
   GROWTH_WIDTH,
   INITIAL_BLOCK_WIDTH,
   WORLD_WIDTH,
+  type Block,
 } from '../src/core/stack';
 import { createRound, pressRound, updateRound } from '../src/core/round';
 

@@ -67,7 +68,7 @@
   });
 
   it('grows a narrowed block after three consecutive perfect drops', () => {
-    let tower = { x: 25, width: 50, direction: 1 as const };
+    let tower: Block = { x: 25, width: 50, direction: 1 };
     let perfectStreak = 0;
 
     for (let drop = 0; drop < 3; drop += 1) {

@@ -86,7 +87,7 @@
   });
 
   it('never grows beyond the initial block width', () => {
-    let tower = { x: 20, width: INITIAL_BLOCK_WIDTH - 1, direction: 1 as const };
+    let tower: Block = { x: 20, width: INITIAL_BLOCK_WIDTH - 1, direction: 1 };
     let perfectStreak = 2;
 
     for (let drop = 0; drop < 12; drop += 1) {
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
dist/assets/index-DK7TsPGG.js  45.86 kB │ gzip: 16.60 kB

✓ built in 1.15s
```

```text
The production build completed successfully, including TypeScript checks and asset generation.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  14 passed (14)
      Tests  60 passed (60)
   Start at  10:27:29
   Duration  4.41s (transform 273ms, setup 0ms, import 640ms, tests 121ms, environment 1ms)
```

```text
All 14 test files passed, with 60 tests passing overall.
```

### Ran git status --short && git diff -- src/core/stack.ts src/core/round.ts src/main.ts tests/stack.test.ts tests/round.test.ts

```text
 M src/core/round.ts
 M src/core/stack.ts
 M src/main.ts
 M tests/round.test.ts
 M tests/stack.test.ts
diff --git a/src/core/round.ts b/src/core/round.ts
index 2a6bd6a..b4ba964 100644
--- a/src/core/round.ts
+++ b/src/core/round.ts
@@ -5,6 +5,7 @@ import {
   createBaseBlock,
   createMovingBlock,
   dropBlock,
+  INITIAL_BLOCK_WIDTH,
   WORLD_WIDTH,
   type Block,
 } from './stack';
@@ -82,7 +83,10 @@ export function pressRound(state: RoundState): RoundState {
   if (state.phase !== 'playing' || !state.movingBlock) return state;
 
   const base = state.blocks[state.blocks.length - 1]!;
-  const result = dropBlock(state.movingBlock, base, state.perfectStreak, { worldWidth: WORLD_WIDTH });
+  const result = dropBlock(state.movingBlock, base, state.perfectStreak, {
+    worldWidth: WORLD_WIDTH,
+    maxWidth: INITIAL_BLOCK_WIDTH,
+  });
   if (!result.landed || !result.block) {
     return { ...state, phase: 'over', movingBlock: null, endReason: 'missed' };
   }
diff --git a/src/core/stack.ts b/src/core/stack.ts
index e65036c..82bcb15 100644
--- a/src/core/stack.ts
+++ b/src/core/stack.ts
@@ -120,7 +120,7 @@ export function dropBlock(
   const perfectStreak = perfect ? previousPerfectStreak + 1 : 0;
   const combo = perfect ? perfectStreak : 0;
   const shouldGrow = perfect && perfectStreak % PERFECTS_PER_GROWTH === 0;
-  const maximumWidth = Math.min(worldWidth, options.maxWidth ?? worldWidth, base.width);
+  const maximumWidth = Math.min(worldWidth, options.maxWidth ?? INITIAL_BLOCK_WIDTH);
   const grownWidth = shouldGrow
     ? Math.min(maximumWidth, overlapWidth + GROWTH_WIDTH)
     : overlapWidth;
diff --git a/src/main.ts b/src/main.ts
index 0a6a4e4..df0d710 100644
--- a/src/main.ts
+++ b/src/main.ts
@@ -33,7 +33,7 @@ import {
   updateRound,
   type RoundState,
 } from './core/round';
-import { dropBlock, WORLD_WIDTH } from './core/stack';
+import { dropBlock, INITIAL_BLOCK_WIDTH, WORLD_WIDTH } from './core/stack';
 import { SynthAudio } from './audio/synth';
 import { createInput, type InputController, type PressEvent } from './input/input';
 import { CanvasRenderer, type DebrisAnimation, type RendererScene } from './render/renderer';
@@ -340,7 +340,10 @@ function dropForPlayer(player: 0 | 1): void {
   if (activeRound.phase !== 'playing' || !activeRound.movingBlock) return;
   const moving = activeRound.movingBlock;
   const target = activeRound.blocks[activeRound.blocks.length - 1]!;
-  const result = dropBlock(moving, target, activeRound.perfectStreak, { worldWidth: WORLD_WIDTH });
+  const result = dropBlock(moving, target, activeRound.perfectStreak, {
+    worldWidth: WORLD_WIDTH,
+    maxWidth: INITIAL_BLOCK_WIDTH,
+  });
   const updated = pressRound(activeRound);
   if (player === 0) round = updated;
   else duelRound = updated;
diff --git a/tests/round.test.ts b/tests/round.test.ts
index fd1e668..843f1f1 100644
--- a/tests/round.test.ts
+++ b/tests/round.test.ts
@@ -7,6 +7,7 @@ import {
   ROUND_SECONDS,
   updateRound,
 } from '../src/core/round';
+import { GROWTH_WIDTH } from '../src/core/stack';
 
 describe('round state machine', () => {
   it('moves from ready through countdown to play, then ends on time-up', () => {
@@ -32,6 +33,25 @@ describe('round state machine', () => {
     expect(round.movingBlock).not.toBeNull();
   });
 
+  it('regains width after three perfect drops on a narrowed tower', () => {
+    let round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS);
+    round = {
+      ...round,
+      blocks: [{ x: 25, width: 50, direction: 1 }],
+      movingBlock: { x: 25, width: 50, direction: 1 },
+    };
+
+    for (let drop = 0; drop < 3; drop += 1) {
+      const base = round.blocks.at(-1)!;
+      round = pressRound({
+        ...round,
+        movingBlock: { x: base.x, width: base.width, direction: 1 },
+      });
+    }
+
+    expect(round.blocks.at(-1)?.width).toBe(50 + GROWTH_WIDTH);
+  });
+
   it('scores a perfect press and ends when the next block misses', () => {
     let round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS);
     round = { ...round, movingBlock: { x: 20, width: 60, direction: 1 } };
diff --git a/tests/stack.test.ts b/tests/stack.test.ts
index a941c0b..c88dc0f 100644
--- a/tests/stack.test.ts
+++ b/tests/stack.test.ts
@@ -1,5 +1,13 @@
 import { describe, expect, it } from 'vitest';
-import { advanceBlock, createBaseBlock, dropBlock } from '../src/core/stack';
+import {
+  advanceBlock,
+  createBaseBlock,
+  dropBlock,
+  GROWTH_WIDTH,
+  INITIAL_BLOCK_WIDTH,
+  WORLD_WIDTH,
+  type Block,
+} from '../src/core/stack';
 import { createRound, pressRound, updateRound } from '../src/core/round';
 
 describe('stack mechanics', () => {
@@ -59,12 +67,66 @@ describe('stack mechanics', () => {
     expect(result.chopped).toEqual([]);
   });
 
-  it('grows width by two after three perfects and respects the cap', () => {
-    const narrowerBase = { x: 20, width: 60, direction: 1 as const };
-    const growing = dropBlock({ x: 20, width: 50, direction: 1 }, narrowerBase, 2);
-    const capped = dropBlock({ x: 20, width: 60, direction: 1 }, narrowerBase, 2);
-    expect(growing.block?.width).toBe(52);
-    expect(capped.block?.width).toBe(60);
+  it('grows a narrowed block after three consecutive perfect drops', () => {
+    let tower: Block = { x: 25, width: 50, direction: 1 };
+    let perfectStreak = 0;
+
+    for (let drop = 0; drop < 3; drop += 1) {
+      const result = dropBlock(
+        { x: tower.x, width: tower.width, direction: 1 },
+        tower,
+        perfectStreak,
+        { maxWidth: INITIAL_BLOCK_WIDTH },
+      );
+      expect(result.landed).toBe(true);
+      tower = result.block!;
+      perfectStreak = result.perfectStreak;
+    }
+
+    expect(tower.width).toBe(50 + GROWTH_WIDTH);
+  });
+
+  it('never grows beyond the initial block width', () => {
+    let tower: Block = { x: 20, width: INITIAL_BLOCK_WIDTH - 1, direction: 1 };
+    let perfectStreak = 2;
+
+    for (let drop = 0; drop < 12; drop += 1) {
+      const result = dropBlock(
+        { x: tower.x, width: tower.width, direction: 1 },
+        tower,
+        perfectStreak,
+        { maxWidth: INITIAL_BLOCK_WIDTH },
+      );
+      tower = result.block!;
+      perfectStreak = result.perfectStreak;
+    }
+
+    expect(tower.width).toBe(INITIAL_BLOCK_WIDTH);
+  });
+
+  it('does not grow when the third drop in a streak is not perfect', () => {
+    const tower = { x: 25, width: 50, direction: 1 as const };
+    const result = dropBlock({ x: 27, width: 50, direction: 1 }, tower, 2, {
+      maxWidth: INITIAL_BLOCK_WIDTH,
+    });
+
+    expect(result.perfect).toBe(false);
+    expect(result.perfectStreak).toBe(0);
+    expect(result.block?.width).toBe(48);
+  });
+
+  it('keeps a regrown block fully inside the world', () => {
+    const edgeTower = { x: WORLD_WIDTH - 10, width: 10, direction: 1 as const };
+    const result = dropBlock(
+      { x: edgeTower.x, width: edgeTower.width, direction: 1 },
+      edgeTower,
+      2,
+      { maxWidth: INITIAL_BLOCK_WIDTH },
+    );
+
+    expect(result.block?.width).toBe(10 + GROWTH_WIDTH);
+    expect(result.block!.x).toBeGreaterThanOrEqual(0);
+    expect(result.block!.x + result.block!.width).toBeLessThanOrEqual(WORLD_WIDTH);
   });
 
   it('detects a zero-overlap miss', () => {
```

```text
The final working-tree review showed changes in the round, stack, main, and related test files. No commit was made.
```

### Edited tests/stack.test.ts +10 -2

#### tests/stack.test.ts

```diff
--- a/tests/stack.test.ts
+++ b/tests/stack.test.ts
@@ -76,7 +76,6 @@
         { x: tower.x, width: tower.width, direction: 1 },
         tower,
         perfectStreak,
-        { maxWidth: INITIAL_BLOCK_WIDTH },
       );
       expect(result.landed).toBe(true);
       tower = result.block!;

@@ -95,10 +94,10 @@
         { x: tower.x, width: tower.width, direction: 1 },
         tower,
         perfectStreak,
-        { maxWidth: INITIAL_BLOCK_WIDTH },
       );
       tower = result.block!;
       perfectStreak = result.perfectStreak;
+      expect(tower.width).toBeLessThanOrEqual(INITIAL_BLOCK_WIDTH);
     }
 
     expect(tower.width).toBe(INITIAL_BLOCK_WIDTH);

@@ -115,6 +114,15 @@
     expect(result.block?.width).toBe(48);
   });
 
+  it('respects an explicitly supplied maximum width', () => {
+    const tower = { x: 25, width: 50, direction: 1 as const };
+    const result = dropBlock({ x: tower.x, width: tower.width, direction: 1 }, tower, 2, {
+      maxWidth: 51,
+    });
+
+    expect(result.block?.width).toBe(51);
+  });
+
   it('keeps a regrown block fully inside the world', () => {
     const edgeTower = { x: WORLD_WIDTH - 10, width: 10, direction: 1 as const };
     const result = dropBlock(
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
dist/assets/index-DK7TsPGG.js  45.86 kB │ gzip: 16.60 kB

✓ built in 221ms
```

```text
The production build completed successfully. The full test suite is still running.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  14 passed (14)
      Tests  61 passed (61)
   Start at  10:28:01
   Duration  4.55s (transform 275ms, setup 0ms, import 665ms, tests 122ms, environment 1ms)
```

```text
All 61 tests across 14 test files passed.
```
