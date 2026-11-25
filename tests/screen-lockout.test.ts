import { describe, expect, it } from 'vitest';
import { getScreenLockoutProgress, isScreenInputLocked } from '../src/core/screen-lockout';

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
});