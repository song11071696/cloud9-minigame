export type PlayerIndex = 0 | 1;

export type InputRoute =
  | { source: 'keyboard'; key: string }
  | { source: 'pointer'; x: number; width: number }
  | { source: 'gamepad'; index: number; buttons: readonly number[] };

const COMMON_KEYS = new Set([' ', 'space', 'spacebar', 'enter', 'arrowup']);
const PLAYER_ONE_KEYS = new Set(['a', 's']);
const PLAYER_TWO_KEYS = new Set(['l', 'k']);
const GAMEPLAY_BUTTONS = new Set([0, 1, 2, 3, 9]);

/** Maps a physical input to a player without depending on browser state. */
export function routePress(input: InputRoute, duel: boolean): PlayerIndex | null {
  if (input.source === 'keyboard') {
    const key = input.key.toLowerCase();
    if (COMMON_KEYS.has(key)) return 0;
    if (!duel) return null;
    if (PLAYER_ONE_KEYS.has(key)) return 0;
    if (PLAYER_TWO_KEYS.has(key)) return 1;
    return null;
  }

  if (input.source === 'pointer') {
    if (!duel) return 0;
    if (!Number.isFinite(input.x) || !Number.isFinite(input.width) || input.width <= 0) return null;
    return input.x < input.width / 2 ? 0 : 1;
  }

  if (!input.buttons.some((button) => GAMEPLAY_BUTTONS.has(button))) return null;
  if (input.index === 0) return 0;
  if (duel && input.index === 1) return 1;
  return null;
}