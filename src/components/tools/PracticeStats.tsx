"use client";

import { useState, useEffect } from "react";
import { BarChart3, Flame, Clock, Music } from "lucide-react";
import { getPracticeSessions } from "@/lib/practiceSessionService";
import {
  PracticeSession,
  dailyTotals,
  songTotals,
  lastNDays,
  currentStreak,
  formatDuration,
} from "@/lib/practiceStats";

export function PracticeStats() {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPracticeSessions().then((data) => {
      setSessions(data);
      setLoading(false);
    });
  }, []);

  const today = new Date().toISOString().slice(0, 10);
  const totalSeconds = sessions.reduce((sum, s) => sum + s.seconds, 0);
  const streak = currentStreak(sessions, today);
  const last7 = lastNDays(sessions, 7, today);
  const topSongs = songTotals(sessions);
  const maxDaily = Math.max(...last7.map((d) => d.seconds), 1);

  return (
    <div className="flex flex-col gap-8 py-8">
      <h2 className="text-2xl font-bold text-center">Practice Stats</h2>

      {loading && (
        <div data-testid="stats-loading" className="flex justify-center py-12">
          <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <div data-testid="stats-empty" className="text-center py-16 text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No practice sessions yet</p>
          <p className="text-sm mt-1">Start practicing a song to see your stats here</p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border bg-card p-4 text-center">
              <Clock className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p data-testid="total-time" className="text-2xl font-bold tabular-nums">
                {formatDuration(totalSeconds)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Total Practice</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center">
              <Flame className="h-5 w-5 mx-auto mb-2 text-orange-500" />
              <p data-testid="streak-count" className="text-2xl font-bold tabular-nums">
                {streak}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Day Streak</p>
            </div>
            <div className="rounded-xl border bg-card p-4 text-center col-span-2 sm:col-span-1">
              <BarChart3 className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold tabular-nums">{topSongs.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Songs Practiced</p>
            </div>
          </div>

          {/* Last 7 days chart */}
          <div data-testid="daily-chart" className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-4">Last 7 Days</h3>
            <div className="flex items-end gap-2 h-32">
              {last7.map((day) => {
                const pct = day.seconds > 0 ? Math.max((day.seconds / maxDaily) * 100, 4) : 0;
                const label = new Date(day.date + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" });
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground tabular-nums">
                      {day.seconds > 0 ? formatDuration(day.seconds) : ""}
                    </span>
                    <div
                      className={`w-full rounded-t transition-all ${
                        day.seconds > 0 ? "bg-primary" : "bg-muted"
                      }`}
                      style={{ height: `${pct}%`, minHeight: day.seconds > 0 ? 4 : 2 }}
                    />
                    <span className="text-[10px] text-muted-foreground">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Song breakdown */}
          <div data-testid="song-breakdown" className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-4">Top Songs</h3>
            <div className="space-y-3">
              {topSongs.slice(0, 10).map((song, i) => {
                const pct = Math.max((song.seconds / topSongs[0].seconds) * 100, 2);
                return (
                  <div key={song.songId} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="truncate">
                        <span className="text-muted-foreground mr-2">{i + 1}.</span>
                        {song.songName}
                      </span>
                      <span className="text-muted-foreground tabular-nums ml-2 shrink-0">
                        {formatDuration(song.seconds)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
