import { describe, expect, it } from 'vitest';
import { getLayerForFloor, getWindDrift, SKY_LAYERS } from '../src/core/layers';

describe('sky layers', () => {
  it('defines nine contiguous six-floor layers with Cloud Nine at floor 48', () => {
    expect(SKY_LAYERS).toHaveLength(9);
    for (let index = 0; index < SKY_LAYERS.length; index += 1) {
      const layer = SKY_LAYERS[index]!;
      expect(layer.floorStart).toBe(index * 6);
      expect(layer.floorEnd).toBe(index * 6 + 5);
      expect(getLayerForFloor(layer.floorStart)).toBe(layer);
    }
    expect(getLayerForFloor(48).name).toBe('Cloud Nine');
    expect(getLayerForFloor(53).number).toBe(9);
    expect(getLayerForFloor(54).number).toBe(9);
  });

  it('increases speed and adds stable seeded wind at layer four', () => {
    expect(getLayerForFloor(5).speed).toBeLessThan(getLayerForFloor(6).speed);
    expect(getWindDrift(17, 99)).toBe(0);
    expect(getWindDrift(18, 99)).toBe(getWindDrift(18, 99));
    expect(Math.abs(getWindDrift(18, 99))).toBeLessThanOrEqual(5);
  });
});