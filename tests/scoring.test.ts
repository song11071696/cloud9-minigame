import { describe, expect, it } from 'vitest';
import {
  calculateDropBonus,
  calculateScore,
  perfectBonusForCombo,
  timeBonusForRemaining,
} from '../src/core/scoring';

describe('scoring', () => {
  it('multiplies perfect bonuses by the current combo', () => {
    expect(perfectBonusForCombo(3)).toBe(75);
    expect(calculateDropBonus({
      perfect: true,
      combo: 3,
      brokeLayer: true,
      reachedCloudNine: false,
      remainingSeconds: 30,
    })).toBe(190);
  });

  it('combines floors, perfects, layer breaks, Cloud Nine and time bonus', () => {
    expect(calculateScore({
      floors: 3,
      perfectBonus: 75,
      layerBreaks: 2,
      reachedCloudNine: true,
      timeBonus: 15,
    })).toBe(820);
    expect(timeBonusForRemaining(29)).toBe(10);
  });
});