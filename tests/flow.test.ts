import { describe, expect, it } from 'vitest';
import { enteredScreen, nextScreen, type ScreenFlowState } from '../src/core/flow';
import { COUNTDOWN_SECONDS, createRound, pressRound, ROUND_SECONDS, updateRound } from '../src/core/round';

function flowState(overrides: Partial<ScreenFlowState> = {}): ScreenFlowState {
  return {
    screen: 'play',
    roundPhase: 'playing',
    duelSession: false,
    duelPhases: ['playing', 'playing'],
    duelOut: [false, false],
    screenElapsed: 0,
    hasCandidateEntry: false,
    lockoutSeconds: 2,
    ...overrides,
  };
}

describe('app screen flow', () => {
  it('moves a missed round to game-over on the next tick', () => {
    let round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS);
    round = pressRound({ ...round, movingBlock: { x: 90, width: 60, direction: 1 } });
    expect(round.endReason).toBe('missed');
    expect(nextScreen(flowState({ roundPhase: round.phase }))).toBe('game-over');
  });

  it('moves a time-up round to game-over', () => {
    const round = updateRound(pressRound(createRound()), COUNTDOWN_SECONDS + ROUND_SECONDS);
    expect(round.endReason).toBe('time-up');
    expect(nextScreen(flowState({ roundPhase: round.phase }))).toBe('game-over');
  });

  it('waits for the second player after one duel player is out', () => {
    expect(nextScreen(flowState({
      duelSession: true,
      roundPhase: 'over',
      duelPhases: ['over', 'playing'],
      duelOut: [true, false],
    }))).toBe('play');
  });

  it('moves a duel to game-over when both players are out', () => {
    expect(nextScreen(flowState({
      duelSession: true,
      roundPhase: 'over',
      duelPhases: ['over', 'over'],
      duelOut: [true, true],
    }))).toBe('game-over');
  });

  it('moves a duel to game-over when both rounds finish on time-up', () => {
    expect(nextScreen(flowState({
      duelSession: true,
      roundPhase: 'over',
      duelPhases: ['over', 'over'],
    }))).toBe('game-over');
  });

  it('advances out of countdown from the current round phase', () => {
    expect(nextScreen(flowState({ screen: 'countdown', roundPhase: 'playing' }))).toBe('play');
  });

  it('applies lockout and candidate routing to game-over advances', () => {
    expect(nextScreen(flowState({ screen: 'game-over', action: 'advance' }))).toBe('game-over');
    expect(nextScreen(flowState({
      screen: 'game-over',
      screenElapsed: 1.999,
      hasCandidateEntry: true,
      action: 'advance',
    }))).toBe('game-over');
    expect(nextScreen(flowState({
      screen: 'game-over',
      screenElapsed: 2,
      hasCandidateEntry: true,
      action: 'advance',
    }))).toBe('initials');
  });

  it('keeps duel results and leaderboard on the shorter lockout', () => {
    expect(nextScreen(flowState({
      screen: 'game-over',
      duelSession: true,
      lockoutSeconds: 1.2,
      screenElapsed: 1.2,
      action: 'advance',
    }))).toBe('attract');
    expect(nextScreen(flowState({
      screen: 'leaderboard',
      lockoutSeconds: 1.2,
      screenElapsed: 1.199,
      action: 'advance',
    }))).toBe('leaderboard');
  });

  it('identifies entry side effects only on the transition into a screen', () => {
    let screen = flowState().screen;
    let sideEffects = 0;
    for (let tick = 0; tick < 3; tick += 1) {
      const next = nextScreen(flowState({ screen, roundPhase: 'over' }));
      if (enteredScreen(screen, next, 'game-over')) sideEffects += 1;
      screen = next;
    }
    expect(sideEffects).toBe(1);
  });

  it('is idempotent for a terminal round already on the game-over screen', () => {
    const state = flowState({ screen: 'game-over', roundPhase: 'over' });
    expect(nextScreen(state)).toBe('game-over');
    expect(nextScreen({ ...state, screen: nextScreen(state) })).toBe('game-over');
  });
});