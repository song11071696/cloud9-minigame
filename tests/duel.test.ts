import { describe, expect, it } from 'vitest';
import { getDuelOutcome } from '../src/core/duel';

describe('duel outcome', () => {
  it('waits for the other player after one player is out', () => {
    expect(getDuelOutcome([100, 80], [true, false], [true, false])).toEqual({ complete: false, winner: null });
  });

  it('ends when both players are out and awards the higher score', () => {
    expect(getDuelOutcome([100, 80], [true, true], [true, true])).toEqual({ complete: true, winner: 'P1' });
    expect(getDuelOutcome([80, 100], [true, true], [true, true])).toEqual({ complete: true, winner: 'P2' });
  });

  it('ends completed rounds with a draw when scores match', () => {
    expect(getDuelOutcome([120, 120], [false, false], [true, true])).toEqual({ complete: true, winner: 'DRAW' });
  });
});