import { describe, expect, it } from 'vitest';
import {
  completeInitials,
  createInitialsState,
  getInitialsButtonAction,
  holdInitials,
  INITIALS_HOLD_SECONDS,
  tapInitials,
  shouldAutoSaveInitials,
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

  it('moves back one slot and clears that slot with Backspace', () => {
    let state = typeInitialKey(createInitialsState(), 'q');
    state = typeInitialKey(state, 'Backspace');
    expect(state).toEqual({ value: 'AAA', cursor: 0, complete: false });
  });

  it('distinguishes short presses from holds at the configured threshold', () => {
    expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS - 0.001)).toBe('tap');
    expect(getInitialsButtonAction(INITIALS_HOLD_SECONDS)).toBe('hold');
  });

  it('auto-saves the current initials after 15 seconds of inactivity', () => {
    const partial = typeInitialKey(createInitialsState(), 'q');
    expect(shouldAutoSaveInitials(14.999)).toBe(false);
    expect(shouldAutoSaveInitials(15)).toBe(true);
    expect(shouldAutoSaveInitials(Number.NaN)).toBe(false);
    expect(completeInitials(partial)).toEqual({ value: 'QAA', cursor: 3, complete: true });
  });
});