import { nextRandom } from './rng';
import type { Block } from './stack';

export const DEFAULT_IDLE_SECONDS = 20;
export const BOT_NEAR_PERFECT_TOLERANCE = 2;
export const BOT_MISTAKE_TOLERANCE = 5;
const BOT_MISTAKE_CHANCE = 0.12;

export interface AttractState {
  idleSeconds: number;
  idleLimit: number;
  active: boolean;
}

export interface DemoBotState {
  seed: number;
  mistake: boolean;
  attempts: number;
}

export interface DemoBotUpdate {
  bot: DemoBotState;
  shouldPress: boolean;
}

export function createAttractState(idleLimit = DEFAULT_IDLE_SECONDS): AttractState {
  return { idleSeconds: 0, idleLimit: Math.max(0, idleLimit), active: false };
}

export function updateAttract(state: AttractState, dt: number, userActivity = false): AttractState {
  const idleSeconds = userActivity
    ? 0
    : state.idleSeconds + Math.max(0, Number.isFinite(dt) ? dt : 0);
  return {
    ...state,
    idleSeconds,
    active: idleSeconds >= state.idleLimit,
  };
}

export function createDemoBot(seed: number): DemoBotState {
  const first = nextRandom(seed >>> 0);
  return { seed: first.seed, mistake: first.value < BOT_MISTAKE_CHANCE, attempts: 0 };
}

export function updateDemoBot(bot: DemoBotState, moving: Block, target: Block): DemoBotUpdate {
  const tolerance = bot.mistake ? BOT_MISTAKE_TOLERANCE : BOT_NEAR_PERFECT_TOLERANCE;
  if (Math.abs(moving.x - target.x) > tolerance) return { bot, shouldPress: false };

  const next = nextRandom(bot.seed);
  return {
    bot: {
      seed: next.seed,
      mistake: next.value < BOT_MISTAKE_CHANCE,
      attempts: bot.attempts + 1,
    },
    shouldPress: true,
  };
}