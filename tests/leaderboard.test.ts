import { describe, expect, it } from 'vitest';
import {
  deserializeLeaderboards,
  isValidInitials,
  Leaderboard,
  serializeLeaderboards,
  type StorageLike,
} from '../src/core/leaderboard';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('leaderboard', () => {
  it('validates initials, sorts by score and earlier timestamp, and keeps top ten per event', () => {
    const storage = new MemoryStorage();
    const leaderboard = new Leaderboard(storage);
    expect(isValidInitials('A7Z')).toBe(true);
    expect(isValidInitials('ab1')).toBe(false);
    for (let score = 0; score < 12; score += 1) {
      expect(leaderboard.add('friday', {
        initials: `A${Math.floor(score / 10)}${score % 10}`,
        score,
        timestamp: score,
      })).toBe(true);
    }
    leaderboard.add('friday', { initials: 'AAA', score: 11, timestamp: 100 });
    leaderboard.add('friday', { initials: 'BBB', score: 11, timestamp: 50 });
    leaderboard.add('saturday', { initials: 'SAT', score: 1, timestamp: 1 });
    expect(leaderboard.get('friday')).toHaveLength(10);
    expect(leaderboard.get('friday').slice(0, 2)).toEqual([
      { initials: 'A11', score: 11, timestamp: 11 },
      { initials: 'BBB', score: 11, timestamp: 50 },
    ]);
    expect(leaderboard.get('saturday')).toHaveLength(1);
  });

  it('rejects invalid initials and safely handles corrupt or partially invalid storage', () => {
    const storage = new MemoryStorage();
    const leaderboard = new Leaderboard(storage);
    expect(leaderboard.add('event', { initials: 'BAD!', score: 10, timestamp: 1 })).toBe(false);
    expect(deserializeLeaderboards('{broken')).toEqual({});
    expect(deserializeLeaderboards(JSON.stringify({
      event: [
        { initials: 'OK1', score: 20, timestamp: 1 },
        { initials: 'bad', score: 30, timestamp: 2 },
      ],
    }))).toEqual({ event: [{ initials: 'OK1', score: 20, timestamp: 1 }] });
  });

  it('round-trips serialized event data and clears one event independently', () => {
    const input = { event: [{ initials: 'XYZ', score: 9, timestamp: 2 }] };
    expect(deserializeLeaderboards(serializeLeaderboards(input))).toEqual(input);
    const leaderboard = new Leaderboard(new MemoryStorage());
    leaderboard.add('one', { initials: 'ONE', score: 1, timestamp: 1 });
    leaderboard.add('two', { initials: 'TWO', score: 2, timestamp: 2 });
    leaderboard.clear('one');
    expect(leaderboard.get('one')).toEqual([]);
    expect(leaderboard.get('two')).toHaveLength(1);
  });
});