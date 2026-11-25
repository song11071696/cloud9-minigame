import { describe, expect, it } from 'vitest';
import {
  createAttractState,
  createDemoBot,
  updateAttract,
  updateDemoBot,
} from '../src/core/attract';

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
});