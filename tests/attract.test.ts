import { describe, expect, it } from 'vitest';
import {
  createAttractState,
  createDemoBot,
  updateAttract,
  updateDemoBot,
} from '../src/core/attract';
import { createRound, pressRound, ROUND_SECONDS, updateRound } from '../src/core/round';

describe('attract mode helpers', () => {
  it('enters attract after idling and resets the timer on activity', () => {
    let state = updateAttract(createAttractState(5), 3);
    expect(state.active).toBe(false);
    state = updateAttract(state, 2);
    expect(state.active).toBe(true);
    state = updateAttract(state, 1, true);
    expect(state).toMatchObject({ idleSeconds: 0, active: false });
  });

  it('makes repeatable demo-bot decisions from a fixed seed', () => {
    const moving = { x: 20, width: 60, direction: 1 as const };
    const target = { x: 20, width: 60, direction: 1 as const };
    const first = updateDemoBot(createDemoBot(2025), moving, target);
    const second = updateDemoBot(createDemoBot(2025), moving, target);
    expect(first).toEqual(second);
    expect(first.shouldPress).toBe(true);
    expect(first.bot.attempts).toBe(1);
  });

  it('builds a tall tower with mostly perfect drops across fixed 60-second demos', () => {
    const results = [1, 2, 3, 4, 5].map((seed) => {
      let round = pressRound(createRound(seed));
      let bot = createDemoBot(seed);
      let perfectDrops = 0;
      let landedDrops = 0;
      const step = 1 / 120;

      for (let elapsed = 0; elapsed < ROUND_SECONDS + 3; elapsed += step) {
        round = updateRound(round, step);
        if (round.phase !== 'playing' || !round.movingBlock) continue;
        const target = round.blocks[round.blocks.length - 1]!;
        const decision = updateDemoBot(bot, round.movingBlock, target);
        bot = decision.bot;
        if (!decision.shouldPress) continue;
        const previousFloors = round.floors;
        round = pressRound(round);
        if (round.floors > previousFloors) {
          landedDrops += 1;
          if (round.combo > 0) perfectDrops += 1;
        }
      }

      return { floors: round.floors, perfectRate: landedDrops ? perfectDrops / landedDrops : 0 };
    });

    expect(results.reduce((sum, result) => sum + result.floors, 0) / results.length).toBeGreaterThanOrEqual(30);
    expect(results.every((result) => result.perfectRate >= 0.7)).toBe(true);
  });
});