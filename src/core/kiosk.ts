export const KIOSK_IDLE_SECONDS = 20;
export const WAKE_LOCK_RETRY_INTERVAL_MS = 5_000;

export interface WakeLockRequestState {
  kioskMode: boolean;
  visible: boolean;
  hasLock: boolean;
  pending: boolean;
  now: number;
  lastAttemptAt: number;
}

/** Kiosk screens return to attract after inactivity, but never interrupt active play. */
export function shouldReturnToAttract(
  screen: string,
  idleSeconds: number,
  timeout = KIOSK_IDLE_SECONDS,
): boolean {
  return screen !== 'play' && idleSeconds >= Math.max(0, timeout);
}

export function shouldRequestWakeLock(state: WakeLockRequestState): boolean {
  return state.kioskMode
    && state.visible
    && !state.hasLock
    && !state.pending
    && Number.isFinite(state.now)
    && state.now - state.lastAttemptAt >= WAKE_LOCK_RETRY_INTERVAL_MS;
}