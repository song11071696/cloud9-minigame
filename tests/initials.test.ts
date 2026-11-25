import { describe, expect, it } from 'vitest';
import {
  createInitialsState,
  holdInitials,
  tapInitials,
  typeInitialKey,
} from '../src/core/initials';

describe('initials entry', () => {
  it('cycles the selected character on tap and confirms it on hold', () => {
    let state = tapInitials(createInitialsState());
    expect(state.value).toBe('BAA');
    state = holdInitials(state);
    state = tapInitials(state);
    expect(state.value).toBe('BBA');
    state = holdInitials(state);
    state = typeInitialKey(state, '7');
    expect(state).toEqual({ value: 'BB7', cursor: 3, complete: true });
  });

  it('accepts typed characters and enter confirmation', () => {
    let state = createInitialsState();
    state = typeInitialKey(state, 'q');
    state = typeInitialKey(state, '2');
    state = typeInitialKey(state, 'Enter');
    expect(state).toEqual({ value: 'Q2A', cursor: 3, complete: true });
    expect(typeInitialKey(state, 'Z')).toBe(state);
  });
});