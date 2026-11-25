const INITIAL_CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface InitialsState {
  value: string;
  cursor: number;
  complete: boolean;
}

export function createInitialsState(): InitialsState {
  return { value: 'AAA', cursor: 0, complete: false };
}

export function tapInitials(state: InitialsState): InitialsState {
  if (state.complete) return state;
  const characters = state.value.split('');
  const current = characters[state.cursor] ?? 'A';
  const index = INITIAL_CHARACTERS.indexOf(current);
  characters[state.cursor] = INITIAL_CHARACTERS[(index + 1) % INITIAL_CHARACTERS.length]!;
  return { ...state, value: characters.join('') };
}

export function holdInitials(state: InitialsState): InitialsState {
  if (state.complete) return state;
  const cursor = state.cursor + 1;
  return { ...state, cursor, complete: cursor >= 3 };
}

export function typeInitialKey(state: InitialsState, key: string): InitialsState {
  if (state.complete) return state;
  if (key === 'Enter') return holdInitials(state);
  if (key === 'Backspace') {
    const cursor = Math.max(0, state.cursor - 1);
    const characters = state.value.split('');
    characters[cursor] = 'A';
    return { ...state, value: characters.join(''), cursor };
  }

  const character = key.toUpperCase();
  if (character.length !== 1 || !INITIAL_CHARACTERS.includes(character)) return state;
  const characters = state.value.split('');
  characters[state.cursor] = character;
  const cursor = state.cursor + 1;
  return { ...state, value: characters.join(''), cursor, complete: cursor >= 3 };
}