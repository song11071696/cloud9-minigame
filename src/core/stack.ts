export const WORLD_WIDTH = 100;
export const INITIAL_BLOCK_WIDTH = 60;
export const PERFECT_TOLERANCE = 1.5;
export const PERFECTS_PER_GROWTH = 3;
export const GROWTH_WIDTH = 2;

export interface Block {
  x: number;
  width: number;
  direction: -1 | 1;
}

export interface DebrisPiece {
  x: number;
  width: number;
  side: 'left' | 'right';
}

export interface DropResult {
  landed: boolean;
  perfect: boolean;
  block: Block | null;
  chopped: DebrisPiece[];
  overlapWidth: number;
  combo: number;
  perfectStreak: number;
}

export interface DropOptions {
  worldWidth?: number;
  perfectTolerance?: number;
  maxWidth?: number;
}

export function createBaseBlock(worldWidth = WORLD_WIDTH): Block {
  const width = Math.min(INITIAL_BLOCK_WIDTH, worldWidth);
  return { x: (worldWidth - width) / 2, width, direction: 1 };
}

export function createMovingBlock(width: number, direction: -1 | 1 = 1, worldWidth = WORLD_WIDTH): Block {
  return { x: direction === 1 ? 0 : Math.max(0, worldWidth - width), width, direction };
}

/** Moves a block and reflects it at either world edge, including large time steps. */
export function advanceBlock(
  block: Block,
  dt: number,
  speed: number,
  worldWidth = WORLD_WIDTH,
  windDrift = 0,
): Block {
  const width = Math.max(0, Math.min(block.width, worldWidth));
  const maxX = Math.max(0, worldWidth - width);
  let x = Math.min(maxX, Math.max(0, block.x));
  let direction = block.direction;
  let remaining = Math.max(0, Number.isFinite(dt) ? dt : 0);
  const safeSpeed = Math.max(0, Number.isFinite(speed) ? speed : 0);
  // Keep drift below slide speed so the direction can always reverse at an edge.
  const windLimit = safeSpeed * 0.9;
  const wind = Math.max(-windLimit, Math.min(windLimit, Number.isFinite(windDrift) ? windDrift : 0));

  if (maxX === 0) return { x: 0, width, direction };

  while (remaining > 0) {
    const velocity = direction * safeSpeed + wind;
    if (velocity === 0) break;

    const distance = velocity > 0 ? maxX - x : x;
    const timeToEdge = distance / Math.abs(velocity);
    if (timeToEdge >= remaining) {
      x += velocity * remaining;
      remaining = 0;
    } else {
      x = velocity > 0 ? maxX : 0;
      remaining -= timeToEdge;
      direction = direction === 1 ? -1 : 1;
    }
  }

  return { x: Math.min(maxX, Math.max(0, x)), width, direction };
}

export function dropBlock(
  moving: Block,
  base: Block,
  previousPerfectStreak: number,
  options: DropOptions = {},
): DropResult {
  const worldWidth = options.worldWidth ?? WORLD_WIDTH;
  const tolerance = options.perfectTolerance ?? PERFECT_TOLERANCE;
  const offset = moving.x - base.x;
  const perfect = Math.abs(offset) <= tolerance;
  const alignedX = perfect ? base.x : moving.x;
  const movingRight = alignedX + moving.width;
  const baseRight = base.x + base.width;
  const overlapLeft = Math.max(alignedX, base.x);
  const overlapRight = Math.min(movingRight, baseRight);
  const overlapWidth = Math.max(0, overlapRight - overlapLeft);

  if (overlapWidth <= 0) {
    return {
      landed: false,
      perfect: false,
      block: null,
      chopped: [],
      overlapWidth: 0,
      combo: 0,
      perfectStreak: 0,
    };
  }

  const chopped: DebrisPiece[] = [];
  if (overlapLeft > alignedX) {
    chopped.push({ x: alignedX, width: overlapLeft - alignedX, side: 'left' });
  }
  if (overlapRight < movingRight) {
    chopped.push({ x: overlapRight, width: movingRight - overlapRight, side: 'right' });
  }

  const perfectStreak = perfect ? previousPerfectStreak + 1 : 0;
  const combo = perfect ? perfectStreak : 0;
  const shouldGrow = perfect && perfectStreak % PERFECTS_PER_GROWTH === 0;
  const maximumWidth = Math.min(worldWidth, options.maxWidth ?? INITIAL_BLOCK_WIDTH);
  const grownWidth = shouldGrow
    ? Math.min(maximumWidth, overlapWidth + GROWTH_WIDTH)
    : overlapWidth;
  const landedX = perfect ? base.x : overlapLeft;
  const landedBlock: Block = {
    x: Math.max(0, Math.min(worldWidth - grownWidth, landedX)),
    width: grownWidth,
    direction: moving.direction,
  };

  return {
    landed: true,
    perfect,
    block: landedBlock,
    chopped,
    overlapWidth,
    combo,
    perfectStreak,
  };
}