import { describe, expect, it } from 'vitest';
import { advanceBlock, createBaseBlock, dropBlock } from '../src/core/stack';

describe('stack mechanics', () => {
  const base = createBaseBlock();

  it('starts with a 60-unit block centred in a 100-unit world', () => {
    expect(base).toEqual({ x: 20, width: 60, direction: 1 });
  });

  it('bounces a sliding block off world edges', () => {
    expect(advanceBlock({ x: 0, width: 60, direction: 1 }, 1.5, 40)).toEqual({
      x: 20,
      width: 60,
      direction: -1,
    });
  });

  it('handles a full-width block and excessive wind without leaving the world', () => {
    expect(advanceBlock({ x: 0, width: 100, direction: 1 }, 2, 30)).toMatchObject({ x: 0, width: 100 });
    const moved = advanceBlock({ x: 39, width: 60, direction: 1 }, 0.1, 10, 100, 100);
    expect(Number.isFinite(moved.x)).toBe(true);
    expect(moved.x).toBeGreaterThanOrEqual(0);
    expect(moved.x).toBeLessThanOrEqual(40);
  });

  it('keeps overlap and returns the chopped overhang', () => {
    const result = dropBlock({ x: 25, width: 60, direction: 1 }, base, 0);
    expect(result.landed).toBe(true);
    expect(result.overlapWidth).toBe(55);
    expect(result.block).toMatchObject({ x: 25, width: 55 });
    expect(result.chopped).toEqual([{ x: 80, width: 5, side: 'right' }]);
  });

  it('returns a left-side chopped piece when the block starts before the base', () => {
    const result = dropBlock({ x: 15, width: 60, direction: 1 }, base, 0);
    expect(result.block).toMatchObject({ x: 20, width: 55 });
    expect(result.chopped).toEqual([{ x: 15, width: 5, side: 'left' }]);
  });

  it('snaps a perfect drop to exact alignment and advances combo', () => {
    const result = dropBlock({ x: 21.5, width: 60, direction: -1 }, base, 2);
    expect(result.perfect).toBe(true);
    expect(result.block).toMatchObject({ x: 20, width: 60, direction: -1 });
    expect(result.combo).toBe(3);
    expect(result.perfectStreak).toBe(3);
    expect(result.chopped).toEqual([]);
  });

  it('grows width by two after three perfects and respects the cap', () => {
    const narrowerBase = { x: 20, width: 60, direction: 1 as const };
    const growing = dropBlock({ x: 20, width: 50, direction: 1 }, narrowerBase, 2);
    const capped = dropBlock({ x: 20, width: 60, direction: 1 }, narrowerBase, 2);
    expect(growing.block?.width).toBe(52);
    expect(capped.block?.width).toBe(60);
  });

  it('detects a zero-overlap miss', () => {
    const result = dropBlock({ x: 80, width: 20, direction: 1 }, base, 4);
    expect(result.landed).toBe(false);
    expect(result.block).toBeNull();
    expect(result.perfectStreak).toBe(0);
  });
});