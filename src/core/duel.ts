export type DuelWinner = 'P1' | 'P2' | 'DRAW';

export interface DuelOutcome {
  complete: boolean;
  winner: DuelWinner | null;
}

/** Resolves a duel after both players are out or both rounds have ended. */
export function getDuelOutcome(
  scores: readonly [number, number],
  out: readonly [boolean, boolean],
  finished: readonly [boolean, boolean],
): DuelOutcome {
  const complete = (out[0] && out[1]) || (finished[0] && finished[1]);
  if (!complete) return { complete: false, winner: null };
  if (scores[0] === scores[1]) return { complete: true, winner: 'DRAW' };
  return { complete: true, winner: scores[0] > scores[1] ? 'P1' : 'P2' };
}