import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
import {
  completeInitials,
  createInitialsState,
  getInitialsButtonAction,
  holdInitials,
  INITIALS_HOLD_SECONDS,
  shouldAutoSaveInitials,
  tapInitials,
  typeInitialKey,
  type InitialsState,
} from './core/initials';
import { Leaderboard, sanitizeEventKey, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
import { getDuelOutcome, type DuelWinner } from './core/duel';
import { enteredScreen, nextScreen, type AppScreen, type ScreenFlowAction } from './core/flow';
import {
  shouldRequestWakeLock,
  shouldReturnToAttract,
  WAKE_LOCK_RETRY_INTERVAL_MS,
} from './core/kiosk';
import { getKeyboardAction } from './core/keyboard-shortcuts';
import { nextRandom } from './core/rng';
import {
  GAME_OVER_INPUT_LOCKOUT_SECONDS,
  getScreenLockoutProgress,
  SCREEN_INPUT_LOCKOUT_SECONDS,
} from './core/screen-lockout';
import {
  createRound,
  getRoundSnapshot,
  pressRound,
  ROUND_SECONDS,
  updateRound,
  type RoundState,
} from './core/round';
import { dropBlock, WORLD_WIDTH } from './core/stack';
import { SynthAudio } from './audio/synth';
import { createInput, type InputController, type PressEvent } from './input/input';
import { CanvasRenderer, type DebrisAnimation, type RendererScene } from './render/renderer';
import packageInfo from '../package.json';

const canvasElement = document.querySelector<HTMLCanvasElement>('#game');
if (!canvasElement) throw new Error('The game canvas is missing.');
const canvas: HTMLCanvasElement = canvasElement;

const params = new URLSearchParams(window.location.search);
const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;
const fixedSeed = parsedSeed !== null && Number.isFinite(parsedSeed) ? parsedSeed >>> 0 : null;
const eventKey = sanitizeEventKey(params.get('event'));
const eventName = eventKey;
const kioskMode = params.get('kiosk') === '1';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let seedCursor = fixedSeed ?? (Date.now() >>> 0);

function nextRoundSeed(): number {
  if (fixedSeed !== null) return fixedSeed;
  const next = nextRandom(seedCursor);
  seedCursor = next.seed;
  return next.seed;
}

const memory = new Map<string, string>();
const safeStorage: StorageLike = {
  getItem(key): string | null {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memory.get(key) ?? null;
    }
  },
  setItem(key, value): void {
    memory.set(key, value);
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // The in-memory copy keeps the game playable when storage is disabled.
    }
  },
  removeItem(key): void {
    memory.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Storage can be unavailable in private or embedded browser contexts.
    }
  },
};

const board = new Leaderboard(safeStorage);
const audio = new SynthAudio(params.get('mute') === '1');
const renderer = new CanvasRenderer(canvas);
const STEP = 1 / 120;

interface WakeLockSentinelLike {
  release(): Promise<void>;
  addEventListener(type: 'release', listener: () => void, options?: { once?: boolean }): void;
}

let screen: AppScreen = 'attract';
let round: RoundState = createRound(nextRoundSeed());
let duelRound: RoundState = createRound(round.seed);
let duelEnabled = params.get('duel') === '1';
let duelSession = false;
let duelWinner: DuelWinner | null = null;
let demoRound = pressRound(createRound(nextRoundSeed()));
let demoBot: DemoBotState = createDemoBot(nextRoundSeed());
let demoResetTimer = 0;
let elapsed = 0;
let screenElapsed = 0;
let previousCountdown = 3;
let previousWarningSecond = ROUND_SECONDS;
let perfects = 0;
let perfectText = '';
let perfectAge = -1;
let layerFlash = 0;
let debris: DebrisAnimation[] = [];
let initials: InitialsState = createInitialsState();
let initialsGesture: { started: number; player: 0 | 1; key?: string } | null = null;
let holdProgress = 0;
let initialsIdleSeconds = 0;
let highlightedEntry: LeaderboardEntry | null = null;
let candidateEntry: LeaderboardEntry | null = null;
let ignoreNextKeyboardPress = false;
let operatorOpen = false;
let operatorConfirmClear = false;
let operatorSelected = 0;
let operatorKeyStarted = 0;
let operatorPointerStarted = 0;
let kioskIdleSeconds = 0;
let inputActivity = false;
let wakeLock: WakeLockSentinelLike | null = null;
let wakeLockRequestPending = false;
let lastWakeLockAttemptAt = Number.NEGATIVE_INFINITY;
let wakeLockRetryTimer: number | null = null;
let kioskGestureStarted = false;
let cloudNineAge = -1;

function getEntries(): LeaderboardEntry[] {
  return board.get(eventKey);
}

function isHighScore(score: number): boolean {
  const entries = getEntries();
  return entries.length < 10 || score > (entries[entries.length - 1]?.score ?? -1);
}

function beginRound(): void {
  const seed = nextRoundSeed();
  round = pressRound(createRound(seed));
  duelRound = pressRound(createRound(seed));
  duelSession = duelEnabled;
  duelWinner = null;
  applyScreenFlow('start');
  previousCountdown = 3;
  previousWarningSecond = ROUND_SECONDS;
  perfects = 0;
  perfectText = '';
  perfectAge = -1;
  layerFlash = 0;
  cloudNineAge = -1;
  debris = [];
  candidateEntry = null;
  highlightedEntry = null;
  kioskIdleSeconds = 0;
  audio.countdown(3);
}

function returnToAttract(): void {
  applyScreenFlow('return');
  kioskIdleSeconds = 0;
}

function saveInitials(): void {
  if (!initials.complete || screen !== 'initials') return;
  const entry: LeaderboardEntry = {
    initials: initials.value,
    score: round.score,
    timestamp: Date.now(),
  };
  board.add(eventKey, entry);
  highlightedEntry = entry;
  candidateEntry = entry;
  applyScreenFlow('initials-complete');
}

function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]): void {
  if (screen !== 'initials' || !initialsGesture) {
    holdProgress = 0;
    return;
  }
  const duration = Math.max(0, (now - initialsGesture.started) / 1000);
  if (initialsGesture.key) {
    holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
    return;
  }
  const isHeld = holds[initialsGesture.player];
  holdProgress = Math.min(1, duration / INITIALS_HOLD_SECONDS);
  if (isHeld && duration >= INITIALS_HOLD_SECONDS) {
    initials = holdInitials(initials);
    initialsGesture = null;
    holdProgress = 0;
    saveInitials();
  } else if (!isHeld) {
    if (duration < INITIALS_HOLD_SECONDS) initials = tapInitials(initials);
    else initials = holdInitials(initials);
    initialsGesture = null;
    holdProgress = 0;
    saveInitials();
  }
}

function noteActivity(): void {
  inputActivity = true;
  kioskIdleSeconds = 0;
  if (screen === 'initials') initialsIdleSeconds = 0;
  activateGesture();
}

function scheduleWakeLockRetry(): void {
  if (!kioskMode || document.hidden || wakeLockRetryTimer !== null) return;
  const remaining = WAKE_LOCK_RETRY_INTERVAL_MS - (performance.now() - lastWakeLockAttemptAt);
  wakeLockRetryTimer = window.setTimeout(() => {
    wakeLockRetryTimer = null;
    void acquireWakeLock();
  }, Math.max(0, remaining));
}

async function acquireWakeLock(): Promise<void> {
  if (!kioskMode || document.hidden || wakeLock || wakeLockRequestPending) return;
  const wakeLockNavigator = navigator as Navigator & {
    wakeLock?: { request: (type: 'screen') => Promise<WakeLockSentinelLike> };
  };
  if (!wakeLockNavigator.wakeLock) return;
  const now = performance.now();
  if (!shouldRequestWakeLock({
    kioskMode,
    visible: !document.hidden,
    hasLock: wakeLock !== null,
    pending: wakeLockRequestPending,
    now,
    lastAttemptAt: lastWakeLockAttemptAt,
  })) {
    scheduleWakeLockRetry();
    return;
  }

  wakeLockRequestPending = true;
  lastWakeLockAttemptAt = now;
  try {
    const sentinel = await wakeLockNavigator.wakeLock.request('screen');
    if (document.hidden) {
      void sentinel.release().catch(() => undefined);
      return;
    }
    wakeLock = sentinel;
    sentinel.addEventListener('release', () => {
      if (wakeLock === sentinel) wakeLock = null;
      if (!document.hidden) void acquireWakeLock();
    }, { once: true });
  } catch {
    wakeLock = null;
  } finally {
    wakeLockRequestPending = false;
    if (!wakeLock && !document.hidden) scheduleWakeLockRetry();
  }
}

function activateGesture(): void {
  audio.unlock();
  if (!kioskMode || kioskGestureStarted) return;
  kioskGestureStarted = true;
  const fullscreen = canvas.requestFullscreen?.();
  if (fullscreen) void fullscreen.catch(() => undefined);
  void acquireWakeLock();
}

function openOperatorPanel(): void {
  operatorOpen = true;
  operatorConfirmClear = false;
}

function closeOperatorPanel(preserveKeyboardSuppression = false): void {
  operatorOpen = false;
  operatorConfirmClear = false;
  if (!preserveKeyboardSuppression) ignoreNextKeyboardPress = false;
}

function activateOperator(index: number, preserveKeyboardSuppression = false): void {
  operatorSelected = index;
  if (index === 0) {
    if (operatorConfirmClear) {
      board.clear(eventKey);
      highlightedEntry = null;
      operatorConfirmClear = false;
    } else {
      operatorConfirmClear = true;
    }
  } else if (index === 1) {
    operatorConfirmClear = false;
    audio.toggleMute();
  } else if (index === 2) {
    operatorConfirmClear = false;
    duelEnabled = !duelEnabled;
  } else {
    closeOperatorPanel(preserveKeyboardSuppression);
  }
}

function handleOperatorKey(key: string): void {
  const normalized = key.toLowerCase();
  if (normalized === 'escape') {
    closeOperatorPanel();
  } else if (normalized === 'arrowup' || normalized === 'arrowdown') {
    const direction = normalized === 'arrowup' ? -1 : 1;
    operatorSelected = (operatorSelected + direction + 4) % 4;
  } else if (normalized === 'enter' || normalized === ' ' || normalized === 'space') {
    activateOperator(operatorSelected, true);
  } else if (/^[1-4]$/.test(normalized)) {
    activateOperator(Number(normalized) - 1);
  }
}

function handleOperatorPointer(event: PressEvent): void {
  if (event.source !== 'pointer' || event.y === undefined) return;
  const bounds = canvas.getBoundingClientRect();
  const rowTop = bounds.height * 0.39;
  const rowGap = bounds.height * 0.105;
  const rowHeight = bounds.height * 0.085;
  for (let index = 0; index < 4; index += 1) {
    const center = rowTop + index * rowGap;
    if (Math.abs(event.y - center) <= rowHeight / 2) {
      activateOperator(index);
      return;
    }
  }
}

function dropForPlayer(player: 0 | 1): void {
  const activeRound = player === 0 ? round : duelRound;
  if (activeRound.phase !== 'playing' || !activeRound.movingBlock) return;
  const moving = activeRound.movingBlock;
  const target = activeRound.blocks[activeRound.blocks.length - 1]!;
  const result = dropBlock(moving, target, activeRound.perfectStreak, { worldWidth: WORLD_WIDTH });
  const updated = pressRound(activeRound);
  if (player === 0) round = updated;
  else duelRound = updated;
  audio.drop();
  if (result.chopped.length > 0) audio.chop();
  if (!result.landed || !result.block) return;
  if (result.chopped.length > 0) {
    debris.push(...result.chopped.map((piece) => ({ piece, floor: updated.floors, age: 0 })));
  }
  if (result.perfect) {
    perfects += 1;
    perfectText = `P${player + 1} PERFECT x${updated.combo}`;
    perfectAge = 0;
    audio.perfect(updated.combo);
  } else {
    perfectAge = -1;
  }
  if (!activeRound.reachedCloudNine && updated.reachedCloudNine) {
    cloudNineAge = 0;
    audio.cloudNine();
  }
  if (updated.layerBreaks > activeRound.layerBreaks && !reducedMotion) {
    layerFlash = 0.8;
    audio.layerBreak(getRoundSnapshot(updated).layer);
  }
}

function onInput(event: PressEvent): void {
  if (event.source === 'keyboard' && ignoreNextKeyboardPress) {
    ignoreNextKeyboardPress = false;
    return;
  }
  if (operatorOpen) {
    handleOperatorPointer(event);
    return;
  }
  if (screen === 'attract') {
    beginRound();
    return;
  }
  if (screen === 'play') {
    if (event.player === 1 && !duelSession) return;
    dropForPlayer(event.player);
    return;
  }
  if (screen === 'game-over') {
    applyScreenFlow('advance');
    return;
  }
  if (screen === 'leaderboard') {
    if (event.player !== 0) return;
    applyScreenFlow('advance');
    return;
  }
  if (screen === 'initials' && event.player === 0 && event.source !== 'keyboard') {
    initialsGesture = { started: performance.now(), player: event.player };
  }
}

const INITIALS_BUTTON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);

function onKey(key: string): void {
  const action = getKeyboardAction(screen, key, operatorOpen);
  if (action === 'operator-control') {
    const normalized = key.toLowerCase();
    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup', 'arrowdown'].includes(normalized);
    handleOperatorKey(key);
    return;
  }
  if (action === 'operator-hold') {
    operatorKeyStarted = performance.now();
    return;
  }
  if (action === 'toggle-duel') {
    duelEnabled = !duelEnabled;
    return;
  }
  if (action === 'toggle-mute') {
    audio.toggleMute();
    return;
  }
  if (action === 'initials-entry') {
    const normalized = key.toLowerCase();
    if (INITIALS_BUTTON_KEYS.has(normalized)) {
      initialsGesture = { started: performance.now(), player: 0, key: normalized };
      holdProgress = 0;
      return;
    }
    initials = typeInitialKey(initials, key);
    saveInitials();
    return;
  }
}

function onKeyUp(key: string): void {
  if (screen !== 'initials' || !initialsGesture?.key) return;
  if (initialsGesture.key !== key.toLowerCase()) return;
  const duration = (performance.now() - initialsGesture.started) / 1000;
  initials = getInitialsButtonAction(duration) === 'hold' ? holdInitials(initials) : tapInitials(initials);
  initialsGesture = null;
  holdProgress = 0;
  initialsIdleSeconds = 0;
  saveInitials();
}

const onCornerPointerDown = (event: PointerEvent): void => {
  const bounds = canvas.getBoundingClientRect();
  const x = event.clientX - bounds.left;
  const y = event.clientY - bounds.top;
  if (x >= 80 || y >= 80) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  operatorPointerStarted = performance.now();
  noteActivity();
};

canvas.addEventListener('pointerdown', onCornerPointerDown, true);
window.addEventListener('pointerup', () => { operatorPointerStarted = 0; });
window.addEventListener('pointercancel', () => { operatorPointerStarted = 0; });
window.addEventListener('keyup', (event) => {
  if (event.key.toLowerCase() === 'o') operatorKeyStarted = 0;
});

const input: InputController = createInput(canvas, {
  isDuel: () => duelEnabled || duelSession,
  onPress: onInput,
  onKey,
  onKeyUp,
  onGesture: activateGesture,
  onActivity: noteActivity,
});

if (kioskMode) {
  document.documentElement.classList.add('kiosk');
  const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
  if (viewport) viewport.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
  const preventDefault = (event: Event): void => event.preventDefault();
  document.addEventListener('contextmenu', preventDefault);
  document.addEventListener('selectstart', preventDefault);
  document.addEventListener('gesturestart', preventDefault, { passive: false });
  document.addEventListener('touchmove', (event: TouchEvent) => {
    if (event.touches.length > 1) event.preventDefault();
  }, { passive: false });
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event: TouchEvent) => {
    const now = performance.now();
    if (now - lastTouchEnd < 320) event.preventDefault();
    lastTouchEnd = now;
  }, { passive: false });
  window.addEventListener('wheel', (event: WheelEvent) => {
    if (event.ctrlKey) event.preventDefault();
  }, { passive: false });
  window.addEventListener('keydown', (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && ['+', '-', '=', '0'].includes(event.key)) event.preventDefault();
  }, true);
}

function updateDemo(dt: number): void {
  if (demoRound.phase === 'over') {
    demoResetTimer += dt;
    if (demoResetTimer >= 1.4) {
      demoRound = pressRound(createRound(nextRoundSeed()));
      demoBot = createDemoBot(nextRoundSeed());
      demoResetTimer = 0;
    }
    return;
  }
  demoRound = updateRound(demoRound, dt);
  if (demoRound.phase !== 'playing' || !demoRound.movingBlock) return;
  const target = demoRound.blocks[demoRound.blocks.length - 1]!;
  const decision = updateDemoBot(demoBot, demoRound.movingBlock, target);
  demoBot = decision.bot;
  if (decision.shouldPress) demoRound = pressRound(demoRound);
}

function updateRoundState(dt: number): void {
  if (screen !== 'countdown' && screen !== 'play') return;
  const oldPhase = round.phase;
  const oldDuelPhase = duelRound.phase;
  round = updateRound(round, dt);
  if (duelSession) duelRound = updateRound(duelRound, dt);
  if (oldPhase === 'countdown' && round.phase === 'countdown') {
    const countdown = Math.ceil(3 - round.phaseElapsed);
    if (countdown < previousCountdown && countdown >= 1) audio.countdown(countdown);
    previousCountdown = countdown;
  }
  const timerRound = duelSession && round.phase === 'over' ? duelRound : round;
  const timerWasPlaying = duelSession && round.phase === 'over' ? oldDuelPhase === 'playing' : oldPhase === 'playing';
  if (timerWasPlaying && timerRound.phase === 'playing') {
    const remaining = Math.ceil(timerRound.timeRemaining);
    if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
    previousWarningSecond = remaining;
  }
}

function transitionTo(next: AppScreen): void {
  const previous = screen;
  if (previous === next) return;
  screen = next;
  screenElapsed = 0;

  if (enteredScreen(previous, next, 'play')) audio.countdown(0);
  if (enteredScreen(previous, next, 'game-over')) {
    kioskIdleSeconds = 0;
    audio.gameOver();
    if (duelSession) {
      const outcome = getDuelOutcome(
        [round.score, duelRound.score],
        [round.endReason === 'missed', duelRound.endReason === 'missed'],
        [round.phase === 'over', duelRound.phase === 'over'],
      );
      duelWinner = outcome.winner;
    } else if (isHighScore(round.score)) {
      candidateEntry = { initials: 'AAA', score: round.score, timestamp: Date.now() };
    }
  }
  if (enteredScreen(previous, next, 'initials')) {
    initials = createInitialsState();
    initialsGesture = null;
    holdProgress = 0;
    initialsIdleSeconds = 0;
    audio.highScore();
  }
  if (enteredScreen(previous, next, 'attract')) {
    duelSession = false;
    duelWinner = null;
    candidateEntry = null;
  }
}

function applyScreenFlow(action?: ScreenFlowAction): void {
  const next = nextScreen({
    screen,
    roundPhase: round.phase,
    duelSession,
    duelPhases: [round.phase, duelRound.phase],
    duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
    screenElapsed,
    hasCandidateEntry: candidateEntry !== null,
    lockoutSeconds: screen === 'game-over' && !duelSession
      ? GAME_OVER_INPUT_LOCKOUT_SECONDS
      : SCREEN_INPUT_LOCKOUT_SECONDS,
    ...(action ? { action } : {}),
  });
  transitionTo(next);
}

function update(dt: number): void {
  elapsed += dt;
  screenElapsed += dt;
  perfectAge = perfectAge < 0 ? perfectAge : perfectAge + dt;
  if (cloudNineAge >= 0) {
    cloudNineAge += dt;
    if (cloudNineAge >= 3.5) {
      cloudNineAge = -1;
    }
  }
  layerFlash = Math.max(0, layerFlash - dt);
  debris = debris.map((piece) => ({ ...piece, age: piece.age + dt })).filter((piece) => piece.age < 1.4);
  if (screen === 'attract') updateDemo(dt);
  updateRoundState(dt);
  applyScreenFlow();
  if (screen === 'initials') {
    initialsIdleSeconds += dt;
    if (shouldAutoSaveInitials(initialsIdleSeconds)) {
      initials = completeInitials(initials);
      saveInitials();
    }
  } else {
    initialsIdleSeconds = 0;
  }
  if (kioskMode) {
    if (inputActivity) kioskIdleSeconds = 0;
    else if (screen === 'play') kioskIdleSeconds = 0;
    else kioskIdleSeconds += dt;
    inputActivity = false;
    if (shouldReturnToAttract(screen, kioskIdleSeconds)) {
      returnToAttract();
      kioskIdleSeconds = 0;
    }
  }
  const currentRound = screen === 'attract' ? demoRound : duelSession && round.phase === 'over' ? duelRound : round;
  audio.update(dt, getRoundSnapshot(currentRound).layer, screen === 'attract' || screen === 'countdown' || screen === 'play');
}

function getBreakdown(): RendererScene['breakdown'] {
  return {
    floors: round.floors,
    perfects,
    perfectBonus: round.perfectBonus,
    layers: round.layerBreaks,
    layerBonus: round.layerBreaks * 100,
    timeBonus: round.timeBonus,
    summitBonus: round.reachedCloudNine ? 500 : 0,
  };
}

function render(dt: number): void {
  const demoSnapshot = getRoundSnapshot(demoRound);
  const roundSnapshot = getRoundSnapshot(round);
  const entries = getEntries();
  const scene: RendererScene = {
    screen,
    round: roundSnapshot,
    displayRound: demoSnapshot,
    elapsed,
    debris,
    perfectText,
    perfectAge,
    layerFlash,
    breakdown: getBreakdown(),
    leaderboard: entries,
    leaderboardIndex: entries.length ? Math.floor(elapsed / 8) % entries.length : 0,
    highlightedEntry,
    todayBest: entries[0] ?? null,
    eventName,
    initials: initials.value,
    initialsCursor: initials.cursor,
    holdProgress,
    muted: audio.isMuted,
    reducedMotion,
    duelMode: duelEnabled,
    duelRounds: duelSession ? [getRoundSnapshot(round), getRoundSnapshot(duelRound)] : null,
    duelOut: [round.endReason === 'missed', duelRound.endReason === 'missed'],
    duelWinner,
    lockoutProgress: screen === 'game-over' || screen === 'leaderboard'
      ? getScreenLockoutProgress(
        screenElapsed,
        screen === 'game-over' && !duelSession
          ? GAME_OVER_INPUT_LOCKOUT_SECONDS
          : SCREEN_INPUT_LOCKOUT_SECONDS,
      )
      : 1,
    cloudNineAge,
    operator: { open: operatorOpen, confirmClear: operatorConfirmClear, selected: operatorSelected, version: packageInfo.version },
  };
  renderer.render(scene, dt);
}

if (params.get('test') === '1') {
  Object.defineProperty(window, '__skyline', {
    configurable: false,
    enumerable: true,
    get: () => {
      const state = screen === 'attract' ? demoRound : round;
      const snapshot = getRoundSnapshot(state);
      return Object.freeze({
        screen,
        floors: snapshot.floors,
        score: snapshot.score,
        layer: snapshot.layer,
        timeRemaining: snapshot.timeRemaining,
        duel: duelSession || duelEnabled,
      });
    },
  });
}

let lastFrame = 0;
let accumulator = 0;

function frame(timestamp: number): void {
  requestAnimationFrame(frame);
  input.pollGamepads();
  if (document.hidden) {
    lastFrame = 0;
    accumulator = 0;
    return;
  }
  const now = timestamp / 1000;
  if (lastFrame === 0) lastFrame = now;
  const delta = Math.min(0.25, Math.max(0, now - lastFrame));
  lastFrame = now;
  const holdNow = performance.now();
  if (operatorKeyStarted > 0 && holdNow - operatorKeyStarted >= 3000) {
    operatorKeyStarted = 0;
    openOperatorPanel();
  }
  if (operatorPointerStarted > 0 && holdNow - operatorPointerStarted >= 3000) {
    operatorPointerStarted = 0;
    openOperatorPanel();
  }
  accumulator += delta;
  let steps = 0;
  while (accumulator >= STEP && steps < 30) {
    update(STEP);
    accumulator -= STEP;
    steps += 1;
  }
  if (steps === 30) accumulator = 0;
  updateInitialsGesture(performance.now(), input.getHoldState());
  render(delta);
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    lastFrame = 0;
    accumulator = 0;
    if (wakeLockRetryTimer !== null) {
      window.clearTimeout(wakeLockRetryTimer);
      wakeLockRetryTimer = null;
    }
    if (wakeLock) {
      const releasedWakeLock = wakeLock;
      wakeLock = null;
      void releasedWakeLock.release().catch(() => undefined);
    }
  } else if (kioskMode) {
    void acquireWakeLock();
  }
});

requestAnimationFrame(frame);

window.addEventListener('beforeunload', () => {
  input.destroy();
  renderer.destroy();
});