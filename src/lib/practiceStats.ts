/**
 * Practice statistics utilities.
 * Pure functions for aggregating and formatting practice data.
 */

export interface PracticeSession {
  songId: string;
  songName: string;
  seconds: number;
  date: string; // YYYY-MM-DD
}

export interface DailyTotal {
  date: string;
  seconds: number;
}

export interface SongTotal {
  songId: string;
  songName: string;
  seconds: number;
}

/**
 * Aggregate sessions into daily totals, sorted by date ascending.
 */
export function dailyTotals(sessions: PracticeSession[]): DailyTotal[] {
  const map = new Map<string, number>();
  for (const s of sessions) {
    map.set(s.date, (map.get(s.date) || 0) + s.seconds);
  }
  return Array.from(map.entries())
    .map(([date, seconds]) => ({ date, seconds }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate sessions into per-song totals, sorted by seconds descending.
 */
export function songTotals(sessions: PracticeSession[]): SongTotal[] {
  const map = new Map<string, { songName: string; seconds: number }>();
  for (const s of sessions) {
    const existing = map.get(s.songId);
    if (existing) {
      existing.seconds += s.seconds;
    } else {
      map.set(s.songId, { songName: s.songName, seconds: s.seconds });
    }
  }
  return Array.from(map.entries())
    .map(([songId, { songName, seconds }]) => ({ songId, songName, seconds }))
    .sort((a, b) => b.seconds - a.seconds);
}

/**
 * Get practice totals for the last N days, filling in zeros for missing days.
 */
export function lastNDays(sessions: PracticeSession[], n: number, today: string): DailyTotal[] {
  const totals = dailyTotals(sessions);
  const map = new Map(totals.map((t) => [t.date, t.seconds]));

  const result: DailyTotal[] = [];
  const d = new Date(today + "T00:00:00");
  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(d);
    date.setDate(date.getDate() - i);
    const key = date.toISOString().slice(0, 10);
    result.push({ date: key, seconds: map.get(key) || 0 });
  }
  return result;
}

/**
 * Calculate current streak (consecutive days with practice, ending today or yesterday).
 */
export function currentStreak(sessions: PracticeSession[], today: string): number {
  const totals = dailyTotals(sessions);
  const dateSet = new Set(totals.filter((t) => t.seconds > 0).map((t) => t.date));

  let streak = 0;
  const d = new Date(today + "T00:00:00");

  // Check if practiced today; if not, start from yesterday
  const todayKey = d.toISOString().slice(0, 10);
  if (!dateSet.has(todayKey)) {
    d.setDate(d.getDate() - 1);
  }

  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!dateSet.has(key)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

/**
 * Format seconds into a human-readable string.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${mins}m`;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
