import {
  dailyTotals,
  songTotals,
  lastNDays,
  currentStreak,
  formatDuration,
  PracticeSession,
} from "./practiceStats";

const sessions: PracticeSession[] = [
  { songId: "a", songName: "Song A", seconds: 300, date: "2026-03-20" },
  { songId: "b", songName: "Song B", seconds: 600, date: "2026-03-20" },
  { songId: "a", songName: "Song A", seconds: 200, date: "2026-03-21" },
  { songId: "a", songName: "Song A", seconds: 100, date: "2026-03-22" },
  { songId: "b", songName: "Song B", seconds: 400, date: "2026-03-22" },
  { songId: "c", songName: "Song C", seconds: 150, date: "2026-03-24" },
];

describe("dailyTotals", () => {
  it("aggregates by date and sorts ascending", () => {
    const result = dailyTotals(sessions);
    expect(result).toEqual([
      { date: "2026-03-20", seconds: 900 },
      { date: "2026-03-21", seconds: 200 },
      { date: "2026-03-22", seconds: 500 },
      { date: "2026-03-24", seconds: 150 },
    ]);
  });

  it("returns empty for no sessions", () => {
    expect(dailyTotals([])).toEqual([]);
  });
});

describe("songTotals", () => {
  it("aggregates by song and sorts by seconds desc", () => {
    const result = songTotals(sessions);
    expect(result).toEqual([
      { songId: "b", songName: "Song B", seconds: 1000 },
      { songId: "a", songName: "Song A", seconds: 600 },
      { songId: "c", songName: "Song C", seconds: 150 },
    ]);
  });

  it("returns empty for no sessions", () => {
    expect(songTotals([])).toEqual([]);
  });
});

describe("lastNDays", () => {
  it("returns last 7 days with zeros for missing", () => {
    const result = lastNDays(sessions, 7, "2026-03-24");
    expect(result).toHaveLength(7);
    expect(result[0]).toEqual({ date: "2026-03-18", seconds: 0 });
    expect(result[2]).toEqual({ date: "2026-03-20", seconds: 900 });
    expect(result[6]).toEqual({ date: "2026-03-24", seconds: 150 });
  });

  it("fills all zeros when no sessions", () => {
    const result = lastNDays([], 3, "2026-03-24");
    expect(result).toEqual([
      { date: "2026-03-22", seconds: 0 },
      { date: "2026-03-23", seconds: 0 },
      { date: "2026-03-24", seconds: 0 },
    ]);
  });
});

describe("currentStreak", () => {
  it("counts consecutive days ending today", () => {
    // practiced 3/22 and 3/24 but not 3/23 → streak from 3/24 = 1
    expect(currentStreak(sessions, "2026-03-24")).toBe(1);
  });

  it("counts streak from yesterday if not practiced today", () => {
    // Today is 3/23, last practiced 3/22 → streak includes 3/22, 3/21, 3/20
    expect(currentStreak(sessions, "2026-03-23")).toBe(3);
  });

  it("returns 0 when no sessions", () => {
    expect(currentStreak([], "2026-03-24")).toBe(0);
  });

  it("returns 0 when gap is too large", () => {
    expect(currentStreak(sessions, "2026-03-30")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("formats seconds only", () => expect(formatDuration(45)).toBe("45s"));
  it("formats minutes only", () => expect(formatDuration(300)).toBe("5m"));
  it("formats hours and minutes", () => expect(formatDuration(3900)).toBe("1h 5m"));
  it("formats exact hours", () => expect(formatDuration(7200)).toBe("2h"));
  it("formats zero", () => expect(formatDuration(0)).toBe("0s"));
});
