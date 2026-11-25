import { describe, expect, it } from 'vitest';
import {
  COUNTDOWN_SECONDS,
  createRound,
  getRoundSnapshot,
  pressRound,
  ROUND_SECONDS,
  updateRound,
} from '../src/core/round';

describe('round state machine', () => {
  it('moves from ready through countdown to play, then ends on time-up', () => {
    let round = createRound(42);
    expect(round.phase).toBe('ready');
    round = pressRound(round);
    expect(round.phase).toBe('countdown');
    expect(getRoundSnapshot(updateRound(round, 1)).countdownRemaining).toBe(2);
    round = updateRound(round, COUNTDOWN_SECONDS);
    expect(round.phase).toBe('playing');
    expect(round.timeRemaining).toBe(ROUND_SECONDS);
    round = updateRound(round, ROUND_SECONDS);
    expect(round.phase).toBe('over');
    expect(round.endReason).toBe('time-up');
    expect(round.timeRemaining).toBe(0);
    expect(getRoundSnapshot(round).layerName).toBe('Rooftops');
  });

  it('counts down only the remaining part of a mixed time step', () => {
    const round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS + 1);
    expect(round.phase).toBe('playing');
    expect(round.timeRemaining).toBe(ROUND_SECONDS - 1);
    expect(round.movingBlock).not.toBeNull();
  });

  it('scores a perfect press and ends when the next block misses', () => {
    let round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS);
    round = { ...round, movingBlock: { x: 20, width: 60, direction: 1 } };
    round = pressRound(round);
    expect(round.floors).toBe(1);
    expect(round.combo).toBe(1);
    expect(round.score).toBeGreaterThan(10);

    round = { ...round, movingBlock: { x: 90, width: 60, direction: 1 } };
    round = pressRound(round);
    expect(round.phase).toBe('over');
    expect(round.endReason).toBe('missed');
  });
});