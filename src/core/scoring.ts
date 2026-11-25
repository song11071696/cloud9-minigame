export const FLOOR_POINTS = 10;
export const PERFECT_BASE_BONUS = 25;
export const LAYER_BREAK_BONUS = 100;
export const CLOUD_NINE_BONUS = 500;

export interface ScoreTotals {
  floors: number;
  perfectBonus: number;
  layerBreaks: number;
  reachedCloudNine: boolean;
  timeBonus: number;
}

export interface DropBonusInput {
  perfect: boolean;
  combo: number;
  brokeLayer: boolean;
  reachedCloudNine: boolean;
  remainingSeconds: number;
}

export function perfectBonusForCombo(combo: number): number {
  return combo > 0 ? Math.floor(combo) * PERFECT_BASE_BONUS : 0;
}

export function timeBonusForRemaining(remainingSeconds: number): number {
  return Math.max(0, Math.floor(remainingSeconds / 10)) * 5;
}

export function calculateDropBonus(input: DropBonusInput): number {
  return (input.perfect ? perfectBonusForCombo(input.combo) : 0)
    + (input.brokeLayer ? LAYER_BREAK_BONUS : 0)
    + (input.reachedCloudNine ? CLOUD_NINE_BONUS : 0)
    + timeBonusForRemaining(input.remainingSeconds);
}

export function calculateScore(totals: ScoreTotals): number {
  const floors = Math.max(0, Math.floor(totals.floors));
  const perfectBonus = Math.max(0, Math.floor(totals.perfectBonus));
  const layerBreaks = Math.max(0, Math.floor(totals.layerBreaks));
  const timeBonus = Math.max(0, Math.floor(totals.timeBonus));
  return floors * FLOOR_POINTS
    + perfectBonus
    + layerBreaks * LAYER_BREAK_BONUS
    + (totals.reachedCloudNine ? CLOUD_NINE_BONUS : 0)
    + timeBonus;
}