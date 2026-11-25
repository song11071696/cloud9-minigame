import { describe, expect, it } from 'vitest';
import { getKeyboardAction } from '../src/core/keyboard-shortcuts';

describe('keyboard shortcut dispatch', () => {
  it('routes all initials letters through initials entry before global shortcuts', () => {
    for (const key of ['O', 'M', 'D']) {
      expect(getKeyboardAction('initials', key)).toBe('initials-entry');
      expect(getKeyboardAction('initials', key, true)).toBe('initials-entry');
    }
  });

  it('keeps global shortcuts and operator navigation available on other screens', () => {
    expect(getKeyboardAction('attract', 'D')).toBe('toggle-duel');
    expect(getKeyboardAction('play', 'M')).toBe('toggle-mute');
    expect(getKeyboardAction('play', 'O')).toBe('operator-hold');
    expect(getKeyboardAction('play', 'ArrowDown', true)).toBe('operator-control');
    expect(getKeyboardAction('play', 'x')).toBe('none');
  });
});