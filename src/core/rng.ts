export interface RandomResult {
  value: number;
  seed: number;
}

/** Advances one mulberry32 step and returns the next [0, 1) value and seed. */
export function nextRandom(seed: number): RandomResult {
  let state = seed >>> 0;
  state = (state + 0x6d2b79f5) >>> 0;
  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  value = (value ^ (value >>> 14)) >>> 0;
  return { value: value / 0x1_0000_0000, seed: state };
}

/** Creates a repeatable mulberry32 random-number generator. */
export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    const result = nextRandom(state);
    state = result.seed;
    return result.value;
  };
}