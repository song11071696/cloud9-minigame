import { describe, expect, it } from 'vitest';
import {
  GAME_OVER_INPUT_LOCKOUT_SECONDS,
  getScreenLockoutProgress,
  isScreenInputLocked,
  SCREEN_INPUT_LOCKOUT_SECONDS,
} from '../src/core/screen-lockout';

describe('screen input lockout', () => {
  it('locks input until the duration elapses and reports fill progress', () => {
    expect(isScreenInputLocked(0)).toBe(true);
    expect(getScreenLockoutProgress(0.6)).toBe(0.5);
    expect(isScreenInputLocked(1.199)).toBe(true);
    expect(isScreenInputLocked(1.2)).toBe(false);
    expect(getScreenLockoutProgress(2)).toBe(1);
  });

  it('handles invalid and zero-duration timing safely', () => {
    expect(getScreenLockoutProgress(Number.NaN)).toBe(0);
    expect(getScreenLockoutProgress(-1)).toBe(0);
    expect(getScreenLockoutProgress(0, 0)).toBe(1);
    expect(isScreenInputLocked(Number.POSITIVE_INFINITY)).toBe(true);
  });

  it('keeps leaderboard and duel lockouts at 1.2 seconds but extends game over to 2 seconds', () => {
    expect(SCREEN_INPUT_LOCKOUT_SECONDS).toBe(1.2);
    expect(GAME_OVER_INPUT_LOCKOUT_SECONDS).toBe(2);
    expect(isScreenInputLocked(1.999, GAME_OVER_INPUT_LOCKOUT_SECONDS)).toBe(true);
    expect(isScreenInputLocked(2, GAME_OVER_INPUT_LOCKOUT_SECONDS)).toBe(false);
  });
});