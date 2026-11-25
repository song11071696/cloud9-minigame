import type { RoundPhase } from './round';

export type AppScreen = 'attract' | 'countdown' | 'play' | 'game-over' | 'initials' | 'leaderboard';
export type ScreenFlowAction = 'start' | 'advance' | 'initials-complete' | 'return';

export interface ScreenFlowState {
  screen: AppScreen;
  roundPhase: RoundPhase;
  duelSession: boolean;
  duelPhases: readonly [RoundPhase, RoundPhase];
  duelOut: readonly [boolean, boolean];
  screenElapsed: number;
  hasCandidateEntry: boolean;
  lockoutSeconds: number;
  action?: ScreenFlowAction;
}

export function nextScreen(state: ScreenFlowState): AppScreen {
  const { screen, action } = state;
  if (action === 'return' && screen !== 'attract') return 'attract';
  if (screen === 'attract' && action === 'start') return 'countdown';
  if (screen === 'initials' && action === 'initials-complete') return 'leaderboard';

  if (screen === 'countdown' && state.roundPhase === 'playing') return 'play';
  if (screen === 'play') {
    const duelComplete = (state.duelOut[0] && state.duelOut[1])
      || (state.duelPhases[0] === 'over' && state.duelPhases[1] === 'over');
    if (state.duelSession ? duelComplete : state.roundPhase === 'over') return 'game-over';
  }

  const lockoutElapsed = state.screenElapsed >= state.lockoutSeconds;
  if (screen === 'game-over') {
    if (action === 'advance' && lockoutElapsed) {
      if (state.duelSession) return 'attract';
      return state.hasCandidateEntry ? 'initials' : 'leaderboard';
    }
    if (state.duelSession && state.screenElapsed >= 6) return 'attract';
    if (state.screenElapsed >= 8) return state.hasCandidateEntry ? 'initials' : 'leaderboard';
  }
  if (screen === 'leaderboard' && ((action === 'advance' && lockoutElapsed) || state.screenElapsed >= 10)) {
    return 'attract';
  }
  return screen;
}

export function enteredScreen(previous: AppScreen, current: AppScreen, target: AppScreen): boolean {
  return previous !== target && current === target;
}