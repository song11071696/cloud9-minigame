export const SCREEN_INPUT_LOCKOUT_SECONDS = 1.2;

export function getScreenLockoutProgress(
  elapsed: number,
  duration = SCREEN_INPUT_LOCKOUT_SECONDS,
): number {
  const safeElapsed = Math.max(0, Number.isFinite(elapsed) ? elapsed : 0);
  const safeDuration = Math.max(0, Number.isFinite(duration) ? duration : 0);
  if (safeDuration === 0) return 1;
  return Math.min(1, safeElapsed / safeDuration);
}

export function isScreenInputLocked(
  elapsed: number,
  duration = SCREEN_INPUT_LOCKOUT_SECONDS,
): boolean {
  return getScreenLockoutProgress(elapsed, duration) < 1;
}