export const LEADERBOARD_STORAGE_KEY = 'skyline-stack-leaderboard';
export const LEADERBOARD_LIMIT = 10;

export interface LeaderboardEntry {
  initials: string;
  score: number;
  timestamp: number;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export type EventLeaderboards = Record<string, LeaderboardEntry[]>;

export function sanitizeEventKey(eventName: string | null | undefined): string {
  const sanitized = (eventName ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24)
    .replace(/-+$/g, '');
  return sanitized || 'default';
}

export function isValidInitials(initials: string): boolean {
  return /^[A-Z0-9]{3}$/.test(initials);
}

export function sortEntries(entries: readonly LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort((a, b) => b.score - a.score || a.timestamp - b.timestamp);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function emptyLeaderboards(): EventLeaderboards {
  return Object.create(null) as EventLeaderboards;
}

function parseEntry(value: unknown): LeaderboardEntry | null {
  if (!isRecord(value)) return null;
  const { initials, score, timestamp } = value;
  if (typeof initials !== 'string' || !isValidInitials(initials)) return null;
  if (typeof score !== 'number' || !Number.isFinite(score) || score < 0) return null;
  if (typeof timestamp !== 'number' || !Number.isFinite(timestamp) || timestamp < 0) return null;
  return { initials, score: Math.floor(score), timestamp: Math.floor(timestamp) };
}

export function serializeLeaderboards(leaderboards: EventLeaderboards): string {
  return JSON.stringify(leaderboards);
}

export function deserializeLeaderboards(serialized: string | null): EventLeaderboards {
  if (!serialized) return emptyLeaderboards();
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!isRecord(parsed)) return emptyLeaderboards();
    const leaderboards = emptyLeaderboards();
    for (const [eventKey, value] of Object.entries(parsed)) {
      if (!Array.isArray(value)) continue;
      const entries = value.map(parseEntry).filter((entry): entry is LeaderboardEntry => entry !== null);
      leaderboards[eventKey] = sortEntries(entries).slice(0, LEADERBOARD_LIMIT);
    }
    return leaderboards;
  } catch {
    return emptyLeaderboards();
  }
}

export class Leaderboard {
  constructor(
    private readonly storage: StorageLike,
    private readonly storageKey = LEADERBOARD_STORAGE_KEY,
  ) {}

  get(eventKey: string): LeaderboardEntry[] {
    const entries = deserializeLeaderboards(this.storage.getItem(this.storageKey))[eventKey] ?? [];
    return entries.map((entry) => ({ ...entry }));
  }

  add(eventKey: string, entry: LeaderboardEntry): boolean {
    const normalized = parseEntry(entry);
    if (!eventKey.trim() || !normalized) return false;
    const leaderboards = deserializeLeaderboards(this.storage.getItem(this.storageKey));
    const entries = sortEntries([...(leaderboards[eventKey] ?? []), normalized]).slice(0, LEADERBOARD_LIMIT);
    leaderboards[eventKey] = entries;
    this.storage.setItem(this.storageKey, serializeLeaderboards(leaderboards));
    return true;
  }

  clear(eventKey?: string): void {
    if (eventKey === undefined) {
      this.storage.removeItem(this.storageKey);
      return;
    }
    const leaderboards = deserializeLeaderboards(this.storage.getItem(this.storageKey));
    delete leaderboards[eventKey];
    this.storage.setItem(this.storageKey, serializeLeaderboards(leaderboards));
  }
}