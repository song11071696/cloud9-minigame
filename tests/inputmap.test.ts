import { describe, expect, it } from 'vitest';
import { routePress } from '../src/core/inputmap';

describe('pure input routing', () => {
  it('routes common keyboard controls to player one and ignores duel-only keys', () => {
    expect(routePress({ source: 'keyboard', key: 'ArrowUp' }, false)).toBe(0);
    expect(routePress({ source: 'keyboard', key: 'A' }, false)).toBeNull();
    expect(routePress({ source: 'keyboard', key: 's' }, true)).toBe(0);
    expect(routePress({ source: 'keyboard', key: 'K' }, true)).toBe(1);
  });

  it('splits pointer input at the midpoint only in duel mode', () => {
    expect(routePress({ source: 'pointer', x: 8, width: 100 }, false)).toBe(0);
    expect(routePress({ source: 'pointer', x: 49, width: 100 }, true)).toBe(0);
    expect(routePress({ source: 'pointer', x: 50, width: 100 }, true)).toBe(1);
    expect(routePress({ source: 'pointer', x: 1, width: 0 }, true)).toBeNull();
  });

  it('accepts only supported gamepad buttons and player assignments', () => {
    expect(routePress({ source: 'gamepad', index: 0, buttons: [9] }, true)).toBe(0);
    expect(routePress({ source: 'gamepad', index: 1, buttons: [2] }, true)).toBe(1);
    expect(routePress({ source: 'gamepad', index: 1, buttons: [2] }, false)).toBeNull();
    expect(routePress({ source: 'gamepad', index: 0, buttons: [4] }, false)).toBeNull();
  });
});