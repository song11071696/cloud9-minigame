import { describe, expect, it } from 'vitest';
import {
  advanceBlock,
  createBaseBlock,
  dropBlock,
  GROWTH_WIDTH,
  INITIAL_BLOCK_WIDTH,
  WORLD_WIDTH,
  type Block,
} from '../src/core/stack';
import { createRound, pressRound, updateRound } from '../src/core/round';

describe('stack mechanics', () => {
  const base = createBaseBlock();

  it('starts with a 60-unit block centred in a 100-unit world', () => {
    expect(base).toEqual({ x: 20, width: 60, direction: 1 });
  });

  it('alternates each new moving block from opposite sides', () => {
    let round = updateRound(pressRound(createRound()), 3);
    expect(round.movingBlock).toMatchObject({ x: 0, direction: 1 });
    round = { ...round, movingBlock: { x: 20, width: 60, direction: 1 } };
    round = pressRound(round);
    expect(round.movingBlock).toMatchObject({ x: 40, direction: -1 });
    round = { ...round, movingBlock: { x: 20, width: 60, direction: -1 } };
    round = pressRound(round);
    expect(round.movingBlock).toMatchObject({ x: 0, direction: 1 });
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

  it('grows a narrowed block after three consecutive perfect drops', () => {
    let tower: Block = { x: 25, width: 50, direction: 1 };
    let perfectStreak = 0;

    for (let drop = 0; drop < 3; drop += 1) {
      const result = dropBlock(
        { x: tower.x, width: tower.width, direction: 1 },
        tower,
        perfectStreak,
      );
      expect(result.landed).toBe(true);
      tower = result.block!;
      perfectStreak = result.perfectStreak;
    }

    expect(tower.width).toBe(50 + GROWTH_WIDTH);
  });

  it('never grows beyond the initial block width', () => {
    let tower: Block = { x: 20, width: INITIAL_BLOCK_WIDTH - 1, direction: 1 };
    let perfectStreak = 2;

    for (let drop = 0; drop < 12; drop += 1) {
      const result = dropBlock(
        { x: tower.x, width: tower.width, direction: 1 },
        tower,
        perfectStreak,
      );
      tower = result.block!;
      perfectStreak = result.perfectStreak;
      expect(tower.width).toBeLessThanOrEqual(INITIAL_BLOCK_WIDTH);
    }

    expect(tower.width).toBe(INITIAL_BLOCK_WIDTH);
  });

  it('does not grow when the third drop in a streak is not perfect', () => {
    const tower = { x: 25, width: 50, direction: 1 as const };
    const result = dropBlock({ x: 27, width: 50, direction: 1 }, tower, 2, {
      maxWidth: INITIAL_BLOCK_WIDTH,
    });

    expect(result.perfect).toBe(false);
    expect(result.perfectStreak).toBe(0);
    expect(result.block?.width).toBe(48);
  });

  it('respects an explicitly supplied maximum width', () => {
    const tower = { x: 25, width: 50, direction: 1 as const };
    const result = dropBlock({ x: tower.x, width: tower.width, direction: 1 }, tower, 2, {
      maxWidth: 51,
    });

    expect(result.block?.width).toBe(51);
  });

  it('keeps a regrown block fully inside the world', () => {
    const edgeTower = { x: WORLD_WIDTH - 10, width: 10, direction: 1 as const };
    const result = dropBlock(
      { x: edgeTower.x, width: edgeTower.width, direction: 1 },
      edgeTower,
      2,
      { maxWidth: INITIAL_BLOCK_WIDTH },
    );

    expect(result.block?.width).toBe(10 + GROWTH_WIDTH);
    expect(result.block!.x).toBeGreaterThanOrEqual(0);
    expect(result.block!.x + result.block!.width).toBeLessThanOrEqual(WORLD_WIDTH);
  });

  it('detects a zero-overlap miss', () => {
    const result = dropBlock({ x: 80, width: 20, direction: 1 }, base, 4);
    expect(result.landed).toBe(false);
    expect(result.block).toBeNull();
    expect(result.perfectStreak).toBe(0);
  });
});