import { describe, expect, it } from 'vitest';
import { shouldReturnToAttract } from '../src/core/kiosk';

describe('kiosk idle timeout', () => {
  it('returns from idle non-play screens but never interrupts play', () => {
    expect(shouldReturnToAttract('leaderboard', 20)).toBe(true);
    expect(shouldReturnToAttract('attract', 19.9)).toBe(false);
    expect(shouldReturnToAttract('play', 60)).toBe(false);
  });
});