# Junie CLI session — Task 07: result-screen layout, reason-specific game over, big leaderboard rows, favicon + meta

Junie CLI 26.11.3, headless, Junie Lite (free tier). Session: session-261125-043707-nmoy

## Prompt given to Junie

```text
Read .junie/guidelines.md and the current code. TASK 7 of Skyline Stack: result-screen layout pass from playtest screenshots (1280x720).

1. GAME OVER and LEADERBOARD screens currently draw their headings on top of the dimmed gameplay HUD (score / floors / layer text and the timer ring at the top), so text overlaps. Hide the gameplay HUD entirely on GAME OVER, INITIALS and LEADERBOARD; draw these screens on a centred translucent rounded panel like the attract cards (same panel style/padding helper; headings fully inside the panel in 1280x720 and 768x1024).
2. GAME OVER heading must match the reason: miss -> 'TOWER TOPPLED!' with sub-line 'The block missed the tower'; time-up -> 'TIME!' with sub-line 'Your tower reached floor N'; if Cloud Nine was reached add a gold 'CLOUD NINE REACHED' badge. Keep the score breakdown, laid out as a clean 2-column table with big numbers.
3. LEADERBOARD screen: rows are tiny now. Render the top 10 as big rows (rank, initials, score; ~5% of min viewport dimension tall), gold/silver/bronze accents for ranks 1-3 (plus a rank number so colour is not the only cue), and animate the newly added row with a gentle pulse (no pulse with reduced motion). If the list is empty show 'NO SCORES YET · BE THE FIRST'. Replace the 'PLEASE WAIT' text with only the thin lockout progress line; after the lockout show 'PRESS TO CONTINUE'.
4. Add an inline SVG favicon (a small stacked-blocks glyph, data URI in index.html), <meta name="description">, and Open Graph title/description tags. No external assets.
5. Run `npm test` and `npm run build` until both pass. Do not commit. Do not create files outside this directory.
```

## Junie transcript (verbatim export)

# Session transcript

### Searched src/**/*

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

### Searched tests/**/*

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

### Read .junie/guidelines.md

### Read package.json

### Read index.html

### Searched GAME OVER|LEADERBOARD|PLEASE WAIT|press to continue|INITIALS|score breakdown|draw.*Panel|panel

```text
src/core/flow.ts [1—6]
src/core/flow.ts [20—24]
src/core/flow.ts [33—42]
src/core/initials.ts [1—7]
src/core/initials.ts [9—30]
src/core/initials.ts [35—39]
src/core/initials.ts [41—47]
src/core/leaderboard.ts [1—7]
src/core/leaderboard.ts [14—18]
src/core/leaderboard.ts [27—35]
src/core/leaderboard.ts [39—67]
src/core/leaderboard.ts [69—90]
src/core/leaderboard.ts [95—101]
src/main.ts [1—15]
src/main.ts [82—86]
src/main.ts [105—114]
src/main.ts [123—127]
src/main.ts [158—165]
src/main.ts [168—197]
src/main.ts [200—204]
src/main.ts [226—230]
src/main.ts [338—352]
src/main.ts [369—381]
src/main.ts [383—394]
src/main.ts [501—512]
src/main.ts [550—561]
src/main.ts [599—609]
src/main.ts [613—617]
src/main.ts [664—672]
src/main.ts [678—682]
src/render/renderer.ts [1—5]
src/render/renderer.ts [31—41]
src/render/renderer.ts [116—120]
src/render/renderer.ts [527—540]
src/render/renderer.ts [554—562]
src/render/renderer.ts [574—581]
src/render/renderer.ts [583—587]
src/render/renderer.ts [596—605]
src/render/renderer.ts [673—677]
src/render/renderer.ts [679—683]
src/render/renderer.ts [685—694]
src/render/renderer.ts [698—702]
src/render/renderer.ts [705—709]
src/render/renderer.ts [713—730]
```

### Read src/core/round.ts

### Read src/main.ts [1-702]

### Read src/core/screen-lockout.ts

### Read tests/screen-lockout.test.ts

### Read src/render/renderer.ts [1-759]

### Read tests/flow.test.ts

### Read vite.config.ts

### Ran git status --short

```text
The working tree is clean, with no uncommitted changes.
```

### Edited src/render/renderer.ts +16 -5

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -55,6 +55,14 @@
   glow: string;
 }
 
+interface PanelLayout {
+  left: number;
+  top: number;
+  width: number;
+  height: number;
+  padding: number;
+}
+
 const PALETTES: readonly Palette[] = [
   { top: '#51345f', bottom: '#f57f55', glow: '#ffcf83' },
   { top: '#523877', bottom: '#ff9b90', glow: '#ffe0a6' },

@@ -100,20 +108,23 @@
     this.drawSky(palette, round.layer, scene.elapsed);
     this.drawClouds(scene.elapsed);
     if (round.layer >= 7) this.drawStars(scene.elapsed, palette.glow);
+    const showGameHud = scene.screen !== 'game-over'
+      && scene.screen !== 'initials'
+      && scene.screen !== 'leaderboard';
     if (scene.duelRounds) {
       this.drawDuelTowers(scene, minSide, ground, blockHeight, dt);
-      this.drawDuelHud(scene, minSide);
+      if (showGameHud) this.drawDuelHud(scene, minSide);
     } else {
       const targetCamera = Math.max(0, round.floors * blockHeight - this.height * 0.3);
       this.camera += (targetCamera - this.camera) * (1 - Math.exp(-Math.max(0, dt) * 2.4));
       this.drawTower(round, scene, contentLeft, contentWidth, ground, blockHeight, minSide);
-      this.drawHud(round, scene, minSide);
+      if (showGameHud) this.drawHud(round, scene, minSide);
     }
     if (scene.screen === 'play') this.drawLayerPips(round, minSide);
 
-    if (scene.perfectAge >= 0 && scene.perfectAge < 1.15) this.drawPerfect(scene, minSide);
-    if (!scene.reducedMotion && scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
-    if (scene.cloudNineAge >= 0) this.drawCloudNineMoment(scene, minSide);
+    if (showGameHud && scene.perfectAge >= 0 && scene.perfectAge < 1.15) this.drawPerfect(scene, minSide);
+    if (showGameHud && !scene.reducedMotion && scene.layerFlash > 0) this.drawLayerBanner(round, scene, minSide);
+    if (showGameHud && scene.cloudNineAge >= 0) this.drawCloudNineMoment(scene, minSide);
     this.drawScreen(scene, minSide);
     if (scene.operator.open) this.drawOperatorPanel(scene, minSide);
   }
```

### Edited src/render/renderer.ts +114 -48

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -519,61 +519,127 @@
       this.text('GET READY', centerX, centerY + big * 1.25, medium, 'center');
       this.text('TAP when the block lines up · PERFECT drops grow it back', centerX, this.height * 0.79, Math.max(14, minSide * 0.035), 'center', '#fff2bd');
     } else if (scene.screen === 'game-over') {
-      if (scene.duelRounds && scene.duelWinner) {
-        const winnerText = scene.duelWinner === 'DRAW' ? 'DRAW' : `${scene.duelWinner} WINS`;
-        this.text(winnerText, centerX, centerY - minSide * 0.15, big * 1.05, 'center', '#fff2ac');
-        this.text(`P1  ${scene.duelRounds[0].score.toLocaleString()}   ·   P2  ${scene.duelRounds[1].score.toLocaleString()}`, centerX, centerY - minSide * 0.015, medium, 'center');
-        this.text('DUEL COMPLETE', centerX, centerY + minSide * 0.09, medium * 0.8, 'center', '#d8edff');
-      } else {
-        this.text('TOWER COMPLETE', centerX, centerY - minSide * 0.29, big * 0.75, 'center', '#fff5ce');
-        const reason = scene.round.endReason === 'missed' ? 'THE BLOCK SLIPPED AWAY' : 'TIME IS UP';
-        this.text(reason, centerX, centerY - minSide * 0.21, medium, 'center', '#d8edff');
-        this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, centerY - minSide * 0.11, big, 'center');
-        const rows = [
-          `FLOORS  ${scene.breakdown.floors}  ·  PERFECTS  ${scene.breakdown.perfects}  +${scene.breakdown.perfectBonus}`,
-          `LAYERS  ${scene.breakdown.layers}  +${scene.breakdown.layerBonus}  ·  TIME  +${scene.breakdown.timeBonus}`,
-          ...(scene.breakdown.summitBonus > 0 ? [`CLOUD NINE BONUS  +${scene.breakdown.summitBonus}`] : []),
-        ];
-        rows.forEach((row, index) => this.text(row, centerX, centerY + minSide * (index * 0.065), Math.max(15, medium * 0.78), 'center'));
+      this.drawGameOverPanel(scene, minSide, centerX, centerY);
+      if (scene.lockoutProgress >= 1) {
+        const prompt = scene.duelRounds ? 'PRESS TO RETURN · AUTO IN 6s' : 'PRESS TO CONTINUE';
+        this.text(prompt, centerX, this.height * 0.91, Math.max(18, minSide * 0.035), 'center', '#ffe8a6');
       }
-      const prompt = scene.lockoutProgress < 1
-        ? 'PLEASE WAIT'
-        : scene.duelRounds ? 'PRESS TO RETURN · AUTO IN 6s' : 'PRESS TO CONTINUE';
-      this.text(prompt, centerX, centerY + minSide * 0.23, medium * 0.8, 'center', '#ffe8a6');
-      this.drawLockoutProgress(scene.lockoutProgress, minSide);
+      if (scene.lockoutProgress < 1) this.drawLockoutProgress(scene.lockoutProgress, minSide);
     } else if (scene.screen === 'initials') {
-      this.text('NEW HIGH SCORE', centerX, centerY - minSide * 0.15, big * 0.82, 'center', '#fff2ac');
-      const slotSpacing = minSide * 0.15;
-      const slotY = centerY + minSide * 0.01;
-      scene.initials.split('').forEach((character, index) => {
-        const active = index === scene.initialsCursor && scene.initialsCursor < 3;
-        const slotX = centerX + (index - 1) * slotSpacing;
-        this.text(character, slotX, slotY, big * (active ? 1.5 : 1.35), 'center', active ? '#ffe8a6' : '#ffffff');
-        if (!active) return;
-        const barWidth = minSide * 0.105;
-        const barHeight = Math.max(5, minSide * 0.009);
-        ctx.fillStyle = '#ffe8a6';
-        ctx.fillRect(slotX - barWidth / 2, centerY + minSide * 0.105, barWidth, barHeight);
-        if (scene.holdProgress > 0) {
-          const progressY = centerY + minSide * 0.135;
-          ctx.fillStyle = '#ffffff55';
-          ctx.fillRect(slotX - barWidth / 2, progressY, barWidth, barHeight);
-          ctx.fillStyle = '#ffe8a6';
-          ctx.fillRect(slotX - barWidth / 2, progressY, barWidth * scene.holdProgress, barHeight);
-        }
-      });
-      this.text('TAP / SHORT PRESS: NEXT LETTER', centerX, centerY + minSide * 0.22, medium * 0.8, 'center');
-      this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.3, Math.max(14, medium * 0.68), 'center');
+      this.drawInitialsPanel(scene, minSide, centerX, centerY, big, medium);
     } else if (scene.screen === 'leaderboard') {
-      this.text('SKYLINE HALL OF HEIGHT', centerX, centerY - minSide * 0.31, big * 0.76, 'center', '#fff2ac');
-      this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, centerY - minSide * 0.25, Math.max(13, minSide * 0.024), 'center', '#e7f5ff');
-      this.drawLeaderboard(scene, minSide, centerY - minSide * 0.19, true);
-      this.text(scene.lockoutProgress < 1 ? 'PLEASE WAIT' : 'PRESS TO PLAY AGAIN', centerX, this.height - minSide * 0.12, medium * 0.82, 'center', '#ffe8a6');
-      this.drawLockoutProgress(scene.lockoutProgress, minSide);
+      this.drawLeaderboardPanel(scene, minSide, centerX);
+      if (scene.lockoutProgress >= 1) {
+        this.text('PRESS TO CONTINUE', centerX, this.height * 0.91, Math.max(18, minSide * 0.035), 'center', '#ffe8a6');
+      } else {
+        this.drawLockoutProgress(scene.lockoutProgress, minSide);
+      }
     }
     ctx.restore();
   }
 
+  private drawGameOverPanel(scene: RendererScene, minSide: number, centerX: number, centerY: number): void {
+    const panel = this.drawPanel(centerX, this.height * 0.045, this.width * 0.9, this.height * 0.91, minSide);
+    if (scene.duelRounds && scene.duelWinner) {
+      const winnerText = scene.duelWinner === 'DRAW' ? 'DRAW' : `${scene.duelWinner} WINS`;
+      this.text(winnerText, centerX, centerY - minSide * 0.12, Math.max(36, minSide * 0.09), 'center', '#fff2ac');
+      this.text(`P1  ${scene.duelRounds[0].score.toLocaleString()}   ·   P2  ${scene.duelRounds[1].score.toLocaleString()}`, centerX, centerY, Math.max(24, minSide * 0.052), 'center');
+      this.text('DUEL COMPLETE', centerX, centerY + minSide * 0.12, Math.max(20, minSide * 0.042), 'center', '#d8edff');
+      return;
+    }
+
+    const missed = scene.round.endReason === 'missed';
+    const headingY = panel.top + panel.height * 0.15;
+    const subtitleY = headingY + minSide * 0.075;
+    this.text(missed ? 'TOWER TOPPLED!' : 'TIME!', centerX, headingY, Math.max(34, minSide * 0.078), 'center', '#fff5ce');
+    this.text(
+      missed ? 'The block missed the tower' : `Your tower reached floor ${scene.round.floors}`,
+      centerX,
+      subtitleY,
+      Math.max(20, minSide * 0.04),
+      'center',
+      '#d8edff',
+    );
+
+    const hasCloudNine = scene.breakdown.summitBonus > 0;
+    if (hasCloudNine) {
+      const badgeWidth = Math.min(panel.width * 0.7, minSide * 5.2);
+      const badgeHeight = minSide * 0.052;
+      const badgeY = subtitleY + minSide * 0.07;
+      this.context.fillStyle = '#ffe08a';
+      this.roundRect(centerX - badgeWidth / 2, badgeY - badgeHeight / 2, badgeWidth, badgeHeight, badgeHeight * 0.3);
+      this.context.fill();
+      this.text('CLOUD NINE REACHED', centerX, badgeY, Math.max(17, minSide * 0.032), 'center', '#172344');
+    }
+
+    const scoreY = headingY + minSide * (hasCloudNine ? 0.235 : 0.19);
+    this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, scoreY, Math.max(31, minSide * 0.068), 'center', '#ffffff');
+    const rows = [
+      ['FLOORS BUILT', scene.breakdown.floors.toLocaleString()],
+      ['PERFECT DROPS', scene.breakdown.perfects.toLocaleString()],
+      ['PERFECT BONUS', `+${scene.breakdown.perfectBonus.toLocaleString()}`],
+      ['LAYERS BROKEN', scene.breakdown.layers.toLocaleString()],
+      ['LAYER BONUS', `+${scene.breakdown.layerBonus.toLocaleString()}`],
+      ['TIME BONUS', `+${scene.breakdown.timeBonus.toLocaleString()}`],
+      ...(hasCloudNine ? [['CLOUD NINE BONUS', `+${scene.breakdown.summitBonus.toLocaleString()}`]] : []),
+    ];
+    const rowHeight = minSide * 0.047;
+    const tableTop = scoreY + minSide * 0.085;
+    this.text('SCORE BREAKDOWN', centerX, tableTop - rowHeight * 0.72, Math.max(15, minSide * 0.026), 'center', '#b9d8e9');
+    rows.forEach(([label, value], index) => {
+      const y = tableTop + index * rowHeight;
+      const rowWidth = panel.width - panel.padding * 2;
+      const rowLeft = panel.left + panel.padding;
+      this.context.fillStyle = index % 2 === 0 ? '#ffffff12' : '#ffffff08';
+      this.roundRect(rowLeft, y - rowHeight * 0.43, rowWidth, rowHeight * 0.86, rowHeight * 0.18);
+      this.context.fill();
+      this.text(label!, rowLeft + minSide * 0.035, y, Math.max(17, minSide * 0.034), 'left', '#e5f1fb');
+      this.text(value!, rowLeft + rowWidth - minSide * 0.035, y, Math.max(19, minSide * 0.04), 'right', '#ffffff');
+    });
+  }
+
+  private drawInitialsPanel(
+    scene: RendererScene,
+    minSide: number,
+    centerX: number,
+    centerY: number,
+    big: number,
+    medium: number,
+  ): void {
+    const panel = this.drawPanel(centerX, this.height * 0.16, this.width * 0.86, this.height * 0.68, minSide);
+    this.text('NEW HIGH SCORE', centerX, panel.top + panel.height * 0.2, big * 0.82, 'center', '#fff2ac');
+    const slotSpacing = minSide * 0.15;
+    const slotY = centerY + minSide * 0.01;
+    scene.initials.split('').forEach((character, index) => {
+      const active = index === scene.initialsCursor && scene.initialsCursor < 3;
+      const slotX = centerX + (index - 1) * slotSpacing;
+      this.text(character, slotX, slotY, big * (active ? 1.5 : 1.35), 'center', active ? '#ffe8a6' : '#ffffff');
+      if (!active) return;
+      const barWidth = minSide * 0.105;
+      const barHeight = Math.max(5, minSide * 0.009);
+      this.context.fillStyle = '#ffe8a6';
+      this.context.fillRect(slotX - barWidth / 2, centerY + minSide * 0.105, barWidth, barHeight);
+      if (scene.holdProgress > 0) {
+        const progressY = centerY + minSide * 0.135;
+        this.context.fillStyle = '#ffffff55';
+        this.context.fillRect(slotX - barWidth / 2, progressY, barWidth, barHeight);
+        this.context.fillStyle = '#ffe8a6';
+        this.context.fillRect(slotX - barWidth / 2, progressY, barWidth * scene.holdProgress, barHeight);
+      }
+    });
+    this.text('TAP / SHORT PRESS: NEXT LETTER', centerX, centerY + minSide * 0.22, medium * 0.8, 'center');
+    this.text('HOLD 0.6s: CONFIRM  ·  TYPE 3 LETTERS', centerX, centerY + minSide * 0.3, Math.max(14, medium * 0.68), 'center');
+  }
+
+  private drawLeaderboardPanel(scene: RendererScene, minSide: number, centerX: number): void {
+    const panel = this.drawPanel(centerX, this.height * 0.035, this.width * 0.92, this.height * 0.93, minSide);
+    const headingY = panel.top + minSide * 0.09;
+    this.text('SKYLINE HALL OF HEIGHT', centerX, headingY, Math.max(30, minSide * 0.074), 'center', '#fff2ac');
+    this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, headingY + minSide * 0.065, Math.max(16, minSide * 0.027), 'center', '#e7f5ff');
+    const startY = panel.top + minSide * 0.235;
+    this.drawLeaderboard(scene, minSide, startY, true, 10, panel);
+  }
+
   private drawAttractCard(
     scene: RendererScene,
     minSide: number,
```

### Read src/render/renderer.ts [633-753]

### Edited src/render/renderer.ts +2 -8

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -653,15 +653,9 @@
     const panelWidth = this.width * 0.86;
     const panelHeight = this.height * 0.68;
     const panelTop = this.height * 0.16;
-    const panelHeaderY = panelTop + minSide * 0.12;
+    const panel = this.drawPanel(centerX, panelTop, panelWidth, panelHeight, minSide);
+    const panelHeaderY = panel.top + panel.padding + minSide * 0.04;
     ctx.save();
-    ctx.fillStyle = '#08152de0';
-    ctx.strokeStyle = '#f6d88c88';
-    ctx.lineWidth = Math.max(2, minSide * 0.003);
-    ctx.beginPath();
-    ctx.roundRect(centerX - panelWidth / 2, panelTop, panelWidth, panelHeight, Math.max(12, minSide * 0.035));
-    ctx.fill();
-    ctx.stroke();
     this.text(`EVENT · ${scene.eventName.toUpperCase()}`, centerX, this.height * 0.065, Math.max(14, minSide * 0.027), 'center', '#e7f5ff');
     this.text('DEMO', this.width * 0.93, this.height * 0.12, Math.max(16, minSide * 0.032), 'center', '#ffe8a6');
```

### Read src/render/renderer.ts [770-830]

### Edited src/render/renderer.ts +63 -4

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -781,22 +781,61 @@
     startY: number,
     full: boolean,
     limit = 10,
+    panel?: PanelLayout,
   ): void {
     const ctx = this.context;
     if (!scene.leaderboard.length) {
-      this.text('NO SCORES YET · BE THE FIRST', this.width / 2, startY + minSide * 0.035, Math.max(14, minSide * 0.035), 'center');
+      this.text('NO SCORES YET · BE THE FIRST', this.width / 2, startY + minSide * 0.08, Math.max(18, minSide * 0.035), 'center');
       return;
     }
     const count = full ? Math.min(limit, scene.leaderboard.length) : 1;
     const index = full ? 0 : scene.leaderboardIndex % scene.leaderboard.length;
+    const rowHeight = minSide * (panel ? 0.052 : 0.06);
+    const rankColors = ['#ffe08a', '#d7e5ef', '#dfa276'];
+    if (panel) {
+      const rowWidth = panel.width - panel.padding * 2;
+      const rowLeft = panel.left + panel.padding;
+      const rankX = rowLeft + rowWidth * 0.1;
+      const initialsX = rowLeft + rowWidth * 0.48;
+      const scoreX = rowLeft + rowWidth * 0.92;
+      const headerY = startY - rowHeight * 0.72;
+      this.text('RANK', rankX, headerY, Math.max(15, minSide * 0.025), 'center', '#b9d8e9');
+      this.text('INITIALS', initialsX, headerY, Math.max(15, minSide * 0.025), 'center', '#b9d8e9');
+      this.text('SCORE', scoreX, headerY, Math.max(15, minSide * 0.025), 'right', '#b9d8e9');
+    }
     for (let row = 0; row < count; row += 1) {
       const entryIndex = full ? row : index;
       const entry = scene.leaderboard[entryIndex]!;
-      const y = startY + row * minSide * 0.06;
+      const y = startY + row * rowHeight;
       const highlighted = scene.highlightedEntry?.initials === entry.initials
         && scene.highlightedEntry.score === entry.score;
-      ctx.fillStyle = highlighted ? '#f5d477' : '#ffffffdd';
-      this.text(`${String(entryIndex + 1).padStart(2, '0')}   ${entry.initials}   ${entry.score.toLocaleString()}`, this.width / 2, y, Math.max(15, minSide * (full ? 0.034 : 0.04)), 'center', highlighted ? '#ffe89b' : '#ffffff');
+      const accent = rankColors[entryIndex] ?? '#ffffff';
+      if (panel) {
+        const rowWidth = panel.width - panel.padding * 2;
+        const rowLeft = panel.left + panel.padding;
+        const pulse = highlighted && !scene.reducedMotion ? 1 + Math.sin(scene.elapsed * 3.2) * 0.012 : 1;
+        ctx.save();
+        ctx.translate(this.width / 2, y);
+        ctx.scale(pulse, pulse);
+        ctx.globalAlpha = highlighted
+          ? scene.reducedMotion ? 0.18 : 0.15 + (Math.sin(scene.elapsed * 3.2) + 1) * 0.035
+          : 0.055;
+        ctx.fillStyle = highlighted ? '#ffe08a' : accent;
+        this.roundRect(rowLeft - this.width / 2, -rowHeight * 0.46, rowWidth, rowHeight * 0.92, rowHeight * 0.2);
+        ctx.fill();
+        ctx.globalAlpha = 1;
+        const rankX = rowLeft + rowWidth * 0.1 - this.width / 2;
+        const initialsX = rowLeft + rowWidth * 0.48 - this.width / 2;
+        const scoreX = rowLeft + rowWidth * 0.92 - this.width / 2;
+        const rankColor = entryIndex < 3 ? accent : highlighted ? '#ffe89b' : '#ffffff';
+        this.text(String(entryIndex + 1).padStart(2, '0'), rankX, 0, Math.max(19, minSide * 0.036), 'center', rankColor);
+        this.text(entry.initials, initialsX, 0, Math.max(21, minSide * 0.038), 'center', '#ffffff');
+        this.text(entry.score.toLocaleString(), scoreX, 0, Math.max(20, minSide * 0.036), 'right', '#ffffff');
+        ctx.restore();
+      } else {
+        const rankColor = entryIndex < 3 ? accent : highlighted ? '#ffe89b' : '#ffffff';
+        this.text(`${String(entryIndex + 1).padStart(2, '0')}   ${entry.initials}   ${entry.score.toLocaleString()}`, this.width / 2, y, Math.max(15, minSide * (full ? 0.034 : 0.04)), 'center', rankColor);
+      }
     }
   }
 

@@ -827,4 +866,24 @@
     ctx.beginPath();
     ctx.roundRect(x, y, Math.max(0, width), Math.max(0, height), radius);
   }
+
+  private drawPanel(centerX: number, top: number, width: number, height: number, minSide: number): PanelLayout {
+    const panel = {
+      left: centerX - width / 2,
+      top,
+      width,
+      height,
+      padding: Math.max(18, minSide * 0.045),
+    };
+    const ctx = this.context;
+    ctx.save();
+    ctx.fillStyle = '#08152de0';
+    ctx.strokeStyle = '#f6d88c88';
+    ctx.lineWidth = Math.max(2, minSide * 0.003);
+    this.roundRect(panel.left, panel.top, panel.width, panel.height, Math.max(12, minSide * 0.035));
+    ctx.fill();
+    ctx.stroke();
+    ctx.restore();
+    return panel;
+  }
 }
```

### Edited index.html +4

#### index.html

```diff
--- a/index.html
+++ b/index.html
@@ -4,6 +4,10 @@
     <meta charset="UTF-8" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <meta name="theme-color" content="#101a3c" />
+    <meta name="description" content="Stack sliding sky-blocks in a one-button, 60-second arcade challenge. Reach Cloud Nine and claim your place on the local leaderboard." />
+    <meta property="og:title" content="Skyline Stack" />
+    <meta property="og:description" content="Stack sliding sky-blocks in a one-button, 60-second arcade challenge. Reach Cloud Nine and claim your place on the local leaderboard." />
+    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='14' y='38' width='36' height='12' rx='2' fill='%2363c9f5'/%3E%3Crect x='20' y='25' width='36' height='12' rx='2' fill='%239ce7ff'/%3E%3Crect x='8' y='12' width='36' height='12' rx='2' fill='%23ffbc68'/%3E%3C/svg%3E" />
     <title>Skyline Stack</title>
     <style>
       html,
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  13 passed (13)
      Tests  51 passed (51)
   Start at  04:39:39
   Duration  3.90s (transform 220ms, setup 0ms, import 525ms, tests 95ms, environment 1ms)
```

```text
All tests passed: 13 test files and 51 tests completed successfully.
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
dist/assets/index-CmbUOS9s.js  44.71 kB │ gzip: 16.18 kB

✓ built in 135ms
```

```text
The strict TypeScript check and production build completed successfully.
```

### Ran git status --short

```text
 M index.html
 M src/render/renderer.ts
```

```text
The final status review shows changes in two tracked files, with no generated-file changes listed.
```

### Read src/render/renderer.ts [492-888]

### Ran git diff --stat

```text
 index.html             |   4 +
 src/render/renderer.ts | 260 ++++++++++++++++++++++++++++++++++++-------------
 2 files changed, 199 insertions(+), 65 deletions(-)
```

```text
The diff review shows changes in two tracked files, with 199 insertions and 65 deletions.
```

### Read src/render/renderer.ts [160-280]

### Edited src/render/renderer.ts +7 -6

#### src/render/renderer.ts

```diff
--- a/src/render/renderer.ts
+++ b/src/render/renderer.ts
@@ -217,7 +217,7 @@
         this.drawBlock(round.movingBlock, round.floors + 1, left, contentWidth, ground, blockHeight, minSide * 0.48, true);
       }
       ctx.restore();
-      if (scene.duelOut[index]) {
+      if (scene.duelOut[index] && scene.screen === 'play') {
         this.text(`P${index + 1} OUT`, viewLeft + viewWidth / 2, this.height * 0.58, Math.max(23, minSide * 0.055), 'center', '#d2d7e2');
       }
     });

@@ -574,7 +574,7 @@
 
     const scoreY = headingY + minSide * (hasCloudNine ? 0.235 : 0.19);
     this.text(`SCORE  ${scene.round.score.toLocaleString()}`, centerX, scoreY, Math.max(31, minSide * 0.068), 'center', '#ffffff');
-    const rows = [
+    const rows: [string, string][] = [
       ['FLOORS BUILT', scene.breakdown.floors.toLocaleString()],
       ['PERFECT DROPS', scene.breakdown.perfects.toLocaleString()],
       ['PERFECT BONUS', `+${scene.breakdown.perfectBonus.toLocaleString()}`],

@@ -581,8 +581,8 @@
       ['LAYERS BROKEN', scene.breakdown.layers.toLocaleString()],
       ['LAYER BONUS', `+${scene.breakdown.layerBonus.toLocaleString()}`],
       ['TIME BONUS', `+${scene.breakdown.timeBonus.toLocaleString()}`],
-      ...(hasCloudNine ? [['CLOUD NINE BONUS', `+${scene.breakdown.summitBonus.toLocaleString()}`]] : []),
     ];
+    if (hasCloudNine) rows.push(['CLOUD NINE BONUS', `+${scene.breakdown.summitBonus.toLocaleString()}`]);
     const rowHeight = minSide * 0.047;
     const tableTop = scoreY + minSide * 0.085;
     this.text('SCORE BREAKDOWN', centerX, tableTop - rowHeight * 0.72, Math.max(15, minSide * 0.026), 'center', '#b9d8e9');

@@ -593,8 +593,8 @@
       this.context.fillStyle = index % 2 === 0 ? '#ffffff12' : '#ffffff08';
       this.roundRect(rowLeft, y - rowHeight * 0.43, rowWidth, rowHeight * 0.86, rowHeight * 0.18);
       this.context.fill();
-      this.text(label!, rowLeft + minSide * 0.035, y, Math.max(17, minSide * 0.034), 'left', '#e5f1fb');
-      this.text(value!, rowLeft + rowWidth - minSide * 0.035, y, Math.max(19, minSide * 0.04), 'right', '#ffffff');
+      this.text(label, rowLeft + minSide * 0.035, y, Math.max(17, minSide * 0.034), 'left', '#e5f1fb');
+      this.text(value, rowLeft + rowWidth - minSide * 0.035, y, Math.max(19, minSide * 0.04), 'right', '#ffffff');
     });
   }
 

@@ -808,7 +808,8 @@
       const entry = scene.leaderboard[entryIndex]!;
       const y = startY + row * rowHeight;
       const highlighted = scene.highlightedEntry?.initials === entry.initials
-        && scene.highlightedEntry.score === entry.score;
+        && scene.highlightedEntry.score === entry.score
+        && scene.highlightedEntry.timestamp === entry.timestamp;
       const accent = rankColors[entryIndex] ?? '#ffffff';
       if (panel) {
         const rowWidth = panel.width - panel.padding * 2;
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

✓ built in 130ms
```

```text
The production build completed successfully with no errors.
```

### Ran npm test

```text

> skyline-stack@1.0.0 test
> vitest run


 RUN  v4.1.12 /workspace/work/hackathons/cloud9/cloud9-minigame


 Test Files  13 passed (13)
      Tests  51 passed (51)
   Start at  04:40:39
   Duration  3.83s (transform 253ms, setup 0ms, import 601ms, tests 117ms, environment 1ms)
```

```text
All tests passed: 13 test files and 51 tests completed successfully.
```

### Ran git status --short

```text
 M index.html
 M src/render/renderer.ts
```

```text
The working tree contains only the requested source and page-metadata edits; no commit was made.
```
