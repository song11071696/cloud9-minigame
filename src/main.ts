import { createDemoBot, updateDemoBot, type DemoBotState } from './core/attract';
import { createInitialsState, holdInitials, tapInitials, typeInitialKey, type InitialsState } from './core/initials';
import { Leaderboard, type LeaderboardEntry, type StorageLike } from './core/leaderboard';
import { nextRandom } from './core/rng';
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
import { CanvasRenderer, type AppScreen, type DebrisAnimation, type RendererScene } from './render/renderer';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('The game canvas is missing.');

const params = new URLSearchParams(window.location.search);
const parsedSeed = params.has('seed') ? Number(params.get('seed')) : null;
const fixedSeed = parsedSeed !== null && Number.isFinite(parsedSeed) ? parsedSeed >>> 0 : null;
const eventKey = params.get('event')?.trim() || 'default';
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
const INITIAL_HOLD_SECONDS = 0.6;

let screen: AppScreen = 'attract';
let round: RoundState = createRound(nextRoundSeed());
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
let initialsGesture: { started: number; player: 0 | 1 } | null = null;
let holdProgress = 0;
let highlightedEntry: LeaderboardEntry | null = null;
let candidateEntry: LeaderboardEntry | null = null;
let ignoreNextKeyboardPress = false;

function getEntries(): LeaderboardEntry[] {
  return board.get(eventKey);
}

function isHighScore(score: number): boolean {
  const entries = getEntries();
  return entries.length < 10 || score > (entries[entries.length - 1]?.score ?? -1);
}

function beginRound(): void {
  round = pressRound(createRound(nextRoundSeed()));
  screen = 'countdown';
  screenElapsed = 0;
  previousCountdown = 3;
  previousWarningSecond = ROUND_SECONDS;
  perfects = 0;
  perfectText = '';
  perfectAge = -1;
  layerFlash = 0;
  debris = [];
  candidateEntry = null;
  highlightedEntry = null;
  audio.countdown(3);
}

function enterResults(): void {
  screenElapsed = 0;
  if (candidateEntry) {
    initials = createInitialsState();
    screen = 'initials';
    audio.highScore();
  } else {
    screen = 'leaderboard';
  }
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
  screen = 'leaderboard';
  screenElapsed = 0;
}

function updateInitialsGesture(now: number, holds: readonly [boolean, boolean]): void {
  if (screen !== 'initials' || !initialsGesture) {
    holdProgress = 0;
    return;
  }
  const duration = Math.max(0, (now - initialsGesture.started) / 1000);
  const isHeld = holds[initialsGesture.player];
  holdProgress = Math.min(1, duration / INITIAL_HOLD_SECONDS);
  if (isHeld && duration >= INITIAL_HOLD_SECONDS) {
    initials = holdInitials(initials);
    initialsGesture = null;
    holdProgress = 0;
    saveInitials();
  } else if (!isHeld) {
    if (duration < INITIAL_HOLD_SECONDS) initials = tapInitials(initials);
    else initials = holdInitials(initials);
    initialsGesture = null;
    holdProgress = 0;
    saveInitials();
  }
}

function onInput(event: PressEvent): void {
  if (event.source === 'keyboard' && ignoreNextKeyboardPress) {
    ignoreNextKeyboardPress = false;
    return;
  }
  if (event.player !== 0) return;
  if (screen === 'attract') {
    beginRound();
    return;
  }
  if (screen === 'play') {
    const moving = round.movingBlock;
    if (!moving) return;
    const target = round.blocks[round.blocks.length - 1]!;
    const result = dropBlock(moving, target, round.perfectStreak, { worldWidth: WORLD_WIDTH });
    round = pressRound(round);
    if (round.phase === 'over') {
      audio.drop();
      if (result.chopped.length > 0) audio.chop();
      return;
    }
    audio.drop();
    if (result.chopped.length > 0) {
      audio.chop();
      debris.push(...result.chopped.map((piece) => ({ piece, floor: round.floors, age: 0 })));
    }
    if (result.perfect) {
      perfects += 1;
      perfectText = `PERFECT x${round.combo}`;
      perfectAge = 0;
      audio.perfect(round.combo);
    } else {
      perfectAge = -1;
    }
    if (round.layerBreaks > 0 && round.floors % 6 === 0) {
      layerFlash = 0.8;
      audio.layerBreak(getRoundSnapshot(round).layer);
    }
    return;
  }
  if (screen === 'game-over') {
    enterResults();
    return;
  }
  if (screen === 'leaderboard') {
    screen = 'attract';
    screenElapsed = 0;
    return;
  }
  if (screen === 'initials' && event.source !== 'keyboard') {
    initialsGesture = { started: performance.now(), player: event.player };
  }
}

function onKey(key: string): void {
  if (key.toLowerCase() === 'm') {
    audio.toggleMute();
    return;
  }
  if (screen === 'initials') {
    const normalized = key.toLowerCase();
    ignoreNextKeyboardPress = [' ', 'space', 'spacebar', 'enter', 'arrowup'].includes(normalized);
    initials = typeInitialKey(initials, key);
    saveInitials();
    return;
  }
}

const input: InputController = createInput(canvas, {
  isDuel: () => false,
  onPress: onInput,
  onKey,
  onGesture: () => audio.unlock(),
});

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
  round = updateRound(round, dt);
  if (oldPhase === 'countdown' && round.phase === 'countdown') {
    const countdown = Math.ceil(3 - round.phaseElapsed);
    if (countdown < previousCountdown && countdown >= 1) audio.countdown(countdown);
    previousCountdown = countdown;
  }
  if (oldPhase === 'countdown' && round.phase === 'playing') {
    screen = 'play';
    audio.countdown(0);
  }
  if (oldPhase === 'playing' && round.phase === 'playing') {
    const remaining = Math.ceil(round.timeRemaining);
    if (remaining < previousWarningSecond && remaining <= 10 && remaining > 0) audio.warning();
    previousWarningSecond = remaining;
  }
  if (round.phase === 'over') {
    screen = 'game-over';
    screenElapsed = 0;
    audio.gameOver();
    if (isHighScore(round.score)) candidateEntry = { initials: 'AAA', score: round.score, timestamp: Date.now() };
  }
}

function update(dt: number): void {
  elapsed += dt;
  screenElapsed += dt;
  perfectAge = perfectAge < 0 ? perfectAge : perfectAge + dt;
  layerFlash = Math.max(0, layerFlash - dt);
  debris = debris.map((piece) => ({ ...piece, age: piece.age + dt })).filter((piece) => piece.age < 1.4);
  if (screen === 'attract') updateDemo(dt);
  updateRoundState(dt);
  if (screen === 'game-over' && screenElapsed >= 8) enterResults();
  if (screen === 'leaderboard' && screenElapsed >= 10) {
    screen = 'attract';
    screenElapsed = 0;
  }
  const currentRound = screen === 'attract' ? demoRound : round;
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
    initials: initials.value,
    holdProgress,
    muted: audio.isMuted,
  };
  renderer.render(scene, dt);
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
  }
});

requestAnimationFrame(frame);

window.addEventListener('beforeunload', () => {
  input.destroy();
  renderer.destroy();
});