import type { AppScreen } from './flow';

export type KeyboardAction =
  | 'operator-control'
  | 'initials-entry'
  | 'operator-hold'
  | 'toggle-duel'
  | 'toggle-mute'
  | 'none';

export function getKeyboardAction(
  screen: AppScreen,
  key: string,
  operatorOpen = false,
): KeyboardAction {
  if (screen === 'initials') return 'initials-entry';
  if (operatorOpen) return 'operator-control';

  const normalized = key.toLowerCase();
  if (normalized === 'o') return 'operator-hold';
  if (normalized === 'd' && screen === 'attract') return 'toggle-duel';
  if (normalized === 'm') return 'toggle-mute';
  return 'none';
}