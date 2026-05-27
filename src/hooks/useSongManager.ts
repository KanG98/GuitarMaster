"use client";

import { useState, useCallback, useEffect } from "react";
import {
  SongRecord,
  createSong,
  getSongs,
  deleteSong,
  updateSongVideo,
  updateSongBackingTrack,
  updateSongPracticeStatus,
  updateSongPinStatus,
} from "@/lib/fileService";
import { searchYouTube, buildGuitarTabQuery, buildBackingTrackQuery } from "@/lib/youtubeService";

interface UseSongManagerReturn {
  songs: SongRecord[];
  isLoading: boolean;
  error: string | null;
  addSong: (name: string, artist: string) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
  togglePracticeStatus: (songId: string, practicing: boolean) => Promise<void>;
  togglePin: (songId: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSongManager(): UseSongManagerReturn {
  const [songs, setSongs] = useState<SongRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await getSongs();
      setSongs(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load songs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSong = useCallback(async (name: string, artist: string) => {
    setError(null);
    try {
      const record = await createSong(name, artist);
      setSongs((prev) => [record, ...prev]);

      // Auto-search YouTube in background (original + backing track)
      try {
        const [originalResults, backingResults] = await Promise.all([
          searchYouTube(buildGuitarTabQuery(name, artist)),
          searchYouTube(buildBackingTrackQuery(name, artist)),
        ]);
        const updates: Partial<SongRecord> = {};
        if (originalResults.length > 0) {
          await updateSongVideo(record.id, originalResults[0].videoId);
          updates.youtubeVideoId = originalResults[0].videoId;
        }
        if (backingResults.length > 0) {
          await updateSongBackingTrack(record.id, backingResults[0].videoId);
          updates.youtubeBackingTrackId = backingResults[0].videoId;
        }
        if (Object.keys(updates).length > 0) {
          setSongs((prev) =>
            prev.map((s) =>
              s.id === record.id ? { ...s, ...updates } : s
            )
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "YouTube search failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create song");
    }
  }, []);

  const removeSong = useCallback(
    async (songId: string) => {
      setError(null);
      try {
        await deleteSong(songId);
        setSongs((prev) => prev.filter((s) => s.id !== songId));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete song");
      }
    },
    []
  );

  const togglePracticeStatus = useCallback(
    async (songId: string, practicing: boolean) => {
      setError(null);
      try {
        await updateSongPracticeStatus(songId, practicing);
        setSongs((prev) =>
          prev.map((s) =>
            s.id === songId ? { ...s, practicing } : s
          )
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update song");
      }
    },
    []
  );

  const togglePin = useCallback(
    async (songId: string) => {
      setError(null);
      setSongs((prev) => {
        const newSongs = prev.map((s) =>
          s.id === songId ? { ...s, pinned: !s.pinned } : s
        );
        return newSongs.sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          return b.createdAt.getTime() - a.createdAt.getTime();
        });
      });
      try {
        const target = songs.find((s) => s.id === songId);
        if (target) {
          await updateSongPinStatus(songId, !target.pinned);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to pin song");
        await refresh();
      }
    },
    [songs, refresh]
  );

  return { songs, isLoading, error, addSong, removeSong, togglePracticeStatus, togglePin, refresh };
}
