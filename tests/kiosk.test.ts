import { describe, expect, it } from 'vitest';
import { shouldRequestWakeLock, shouldReturnToAttract } from '../src/core/kiosk';

describe('kiosk idle timeout', () => {
  it('returns from idle non-play screens but never interrupts play', () => {
    expect(shouldReturnToAttract('leaderboard', 20)).toBe(true);
    expect(shouldReturnToAttract('attract', 19.9)).toBe(false);
    expect(shouldReturnToAttract('play', 60)).toBe(false);
  });
});

describe('kiosk wake-lock recovery', () => {
  const readyState = {
    kioskMode: true,
    visible: true,
    hasLock: false,
    pending: false,
    now: 10_000,
    lastAttemptAt: 0,
  };

  it('requests a lock only while kiosk mode is visible and no request or lock exists', () => {
    expect(shouldRequestWakeLock(readyState)).toBe(true);
    expect(shouldRequestWakeLock({ ...readyState, kioskMode: false })).toBe(false);
    expect(shouldRequestWakeLock({ ...readyState, visible: false })).toBe(false);
    expect(shouldRequestWakeLock({ ...readyState, hasLock: true })).toBe(false);
    expect(shouldRequestWakeLock({ ...readyState, pending: true })).toBe(false);
  });

  it('rate-limits retries after a recent request attempt', () => {
    expect(shouldRequestWakeLock({ ...readyState, now: 4_999 })).toBe(false);
    expect(shouldRequestWakeLock({ ...readyState, now: 5_000 })).toBe(true);
  });
});