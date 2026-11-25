import { getLayerForFloor, getWindDrift } from './layers';
import { calculateScore, perfectBonusForCombo, timeBonusForRemaining } from './scoring';
import {
  advanceBlock,
  createBaseBlock,
  createMovingBlock,
  dropBlock,
  WORLD_WIDTH,
  type Block,
} from './stack';

export const COUNTDOWN_SECONDS = 3;
export const ROUND_SECONDS = 60;

export type RoundPhase = 'ready' | 'countdown' | 'playing' | 'over';
export type RoundEndReason = 'time-up' | 'missed' | null;

export interface RoundState {
  phase: RoundPhase;
  phaseElapsed: number;
  timeRemaining: number;
  seed: number;
  blocks: Block[];
  movingBlock: Block | null;
  floors: number;
  combo: number;
  perfectStreak: number;
  perfectBonus: number;
  layerBreaks: number;
  reachedCloudNine: boolean;
  timeBonus: number;
  score: number;
  endReason: RoundEndReason;
}

export interface RoundSnapshot {
  phase: RoundPhase;
  countdownRemaining: number;
  timeRemaining: number;
  floors: number;
  score: number;
  combo: number;
  layer: number;
  layerName: string;
  paletteId: string;
  blocks: readonly Block[];
  movingBlock: Block | null;
  endReason: RoundEndReason;
}

export function createRound(seed = 1): RoundState {
  return {
    phase: 'ready',
    phaseElapsed: 0,
    timeRemaining: ROUND_SECONDS,
    seed: seed >>> 0,
    blocks: [createBaseBlock()],
    movingBlock: null,
    floors: 0,
    combo: 0,
    perfectStreak: 0,
    perfectBonus: 0,
    layerBreaks: 0,
    reachedCloudNine: false,
    timeBonus: 0,
    score: 0,
    endReason: null,
  };
}

function updateScore(state: RoundState): RoundState {
  return {
    ...state,
    score: calculateScore(state),
  };
}

export function pressRound(state: RoundState): RoundState {
  if (state.phase === 'ready') {
    return { ...state, phase: 'countdown', phaseElapsed: 0 };
  }
  if (state.phase !== 'playing' || !state.movingBlock) return state;

  const base = state.blocks[state.blocks.length - 1]!;
  const result = dropBlock(state.movingBlock, base, state.perfectStreak, { worldWidth: WORLD_WIDTH });
  if (!result.landed || !result.block) {
    return { ...state, phase: 'over', movingBlock: null, endReason: 'missed' };
  }

  const floors = state.floors + 1;
  const brokeLayer = floors % 6 === 0;
  const reachedCloudNine = state.reachedCloudNine || floors >= 48;
  const perfectBonus = state.perfectBonus
    + (result.perfect ? perfectBonusForCombo(result.combo) : 0);
  const timeBonus = state.timeBonus + timeBonusForRemaining(state.timeRemaining);
  const nextState: RoundState = {
    ...state,
    blocks: [...state.blocks, result.block],
    movingBlock: createMovingBlock(result.block.width),
    floors,
    combo: result.combo,
    perfectStreak: result.perfectStreak,
    perfectBonus,
    layerBreaks: state.layerBreaks + (brokeLayer ? 1 : 0),
    reachedCloudNine,
    timeBonus,
  };
  return updateScore(nextState);
}

export function updateRound(state: RoundState, dt: number): RoundState {
  let remaining = Math.max(0, Number.isFinite(dt) ? dt : 0);
  if (state.phase === 'ready' || state.phase === 'over' || remaining === 0) return state;

  let next = state;
  if (next.phase === 'countdown') {
    const countdownRemaining = COUNTDOWN_SECONDS - next.phaseElapsed;
    if (remaining < countdownRemaining) {
      return { ...next, phaseElapsed: next.phaseElapsed + remaining };
    }
    remaining -= countdownRemaining;
    next = {
      ...next,
      phase: 'playing',
      phaseElapsed: 0,
      movingBlock: createMovingBlock(next.blocks[next.blocks.length - 1]!.width),
    };
    if (remaining === 0) return next;
  }

  if (next.phase !== 'playing' || !next.movingBlock) return next;
  const activeTime = Math.min(remaining, next.timeRemaining);
  const layer = getLayerForFloor(next.floors);
  const movingBlock = advanceBlock(
    next.movingBlock,
    activeTime,
    layer.speed,
    WORLD_WIDTH,
    getWindDrift(next.floors, next.seed),
  );
  const timeRemaining = Math.max(0, next.timeRemaining - activeTime);
  const phaseElapsed = next.phaseElapsed + activeTime;
  if (timeRemaining === 0) {
    return updateScore({
      ...next,
      movingBlock: null,
      phase: 'over',
      phaseElapsed,
      timeRemaining: 0,
      endReason: 'time-up',
    });
  }
  return { ...next, movingBlock, phaseElapsed, timeRemaining };
}

export function getRoundSnapshot(state: RoundState): RoundSnapshot {
  const layer = getLayerForFloor(state.floors);
  return {
    phase: state.phase,
    countdownRemaining: state.phase === 'countdown'
      ? Math.max(0, COUNTDOWN_SECONDS - state.phaseElapsed)
      : 0,
    timeRemaining: state.timeRemaining,
    floors: state.floors,
    score: state.score,
    combo: state.combo,
    layer: layer.number,
    layerName: layer.name,
    paletteId: layer.paletteId,
    blocks: state.blocks.map((block) => ({ ...block })),
    movingBlock: state.movingBlock ? { ...state.movingBlock } : null,
    endReason: state.endReason,
  };
}