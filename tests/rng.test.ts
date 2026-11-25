import { describe, expect, it } from 'vitest';
import { mulberry32, nextRandom } from '../src/core/rng';

describe('seeded random number generator', () => {
  it('repeats a sequence for the same seed', () => {
    const first = mulberry32(1234);
    const second = mulberry32(1234);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it('advances explicit state and produces values in [0, 1)', () => {
    const result = nextRandom(7);
    expect(result.seed).not.toBe(7);
    expect(result.value).toBeGreaterThanOrEqual(0);
    expect(result.value).toBeLessThan(1);
  });
});