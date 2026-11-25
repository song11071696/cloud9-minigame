import { nextRandom } from './rng';

export interface SkyLayer {
  number: number;
  name: string;
  floorStart: number;
  floorEnd: number;
  speed: number;
  windStrength: number;
  minimumBlockWidth: number;
  maximumBlockWidth: number;
  paletteId: string;
}

export const SKY_LAYERS: readonly SkyLayer[] = [
  { number: 1, name: 'Rooftops', floorStart: 0, floorEnd: 5, speed: 28, windStrength: 0, minimumBlockWidth: 12, maximumBlockWidth: 60, paletteId: 'dusk' },
  { number: 2, name: 'Low Haze', floorStart: 6, floorEnd: 11, speed: 34, windStrength: 0, minimumBlockWidth: 11, maximumBlockWidth: 60, paletteId: 'rose' },
  { number: 3, name: 'Sunlit Drift', floorStart: 12, floorEnd: 17, speed: 40, windStrength: 0, minimumBlockWidth: 10, maximumBlockWidth: 60, paletteId: 'gold' },
  { number: 4, name: 'Cloud Shelf', floorStart: 18, floorEnd: 23, speed: 46, windStrength: 5, minimumBlockWidth: 9, maximumBlockWidth: 60, paletteId: 'azure' },
  { number: 5, name: 'Blue Expanse', floorStart: 24, floorEnd: 29, speed: 52, windStrength: 7, minimumBlockWidth: 8, maximumBlockWidth: 60, paletteId: 'blue' },
  { number: 6, name: 'Silver Reach', floorStart: 30, floorEnd: 35, speed: 58, windStrength: 9, minimumBlockWidth: 7, maximumBlockWidth: 60, paletteId: 'silver' },
  { number: 7, name: 'Starline', floorStart: 36, floorEnd: 41, speed: 64, windStrength: 11, minimumBlockWidth: 6, maximumBlockWidth: 60, paletteId: 'indigo' },
  { number: 8, name: 'High Aurora', floorStart: 42, floorEnd: 47, speed: 70, windStrength: 13, minimumBlockWidth: 5, maximumBlockWidth: 60, paletteId: 'aurora' },
  { number: 9, name: 'Cloud Nine', floorStart: 48, floorEnd: 53, speed: 76, windStrength: 15, minimumBlockWidth: 4, maximumBlockWidth: 60, paletteId: 'summit' },
];

export function getLayerForFloor(floor: number): SkyLayer {
  const normalizedFloor = Math.max(0, Math.floor(Number.isFinite(floor) ? floor : 0));
  const index = Math.min(SKY_LAYERS.length - 1, Math.floor(normalizedFloor / 6));
  return SKY_LAYERS[index]!;
}

/** Returns a stable, per-floor wind value without relying on ambient randomness. */
export function getWindDrift(floor: number, seed: number): number {
  const layer = getLayerForFloor(floor);
  if (layer.windStrength === 0) return 0;

  const floorSeed = (seed ^ Math.imul(Math.max(0, Math.floor(floor)), 0x9e3779b9)) >>> 0;
  const { value } = nextRandom(floorSeed);
  return (value * 2 - 1) * layer.windStrength;
}