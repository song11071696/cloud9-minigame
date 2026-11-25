export const KIOSK_IDLE_SECONDS = 20;

/** Kiosk screens return to attract after inactivity, but never interrupt active play. */
export function shouldReturnToAttract(
  screen: string,
  idleSeconds: number,
  timeout = KIOSK_IDLE_SECONDS,
): boolean {
  return screen !== 'play' && idleSeconds >= Math.max(0, timeout);
}