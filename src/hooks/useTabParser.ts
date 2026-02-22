"use client";

import { useState, useCallback, useEffect } from "react";
import {
  SongRecord,
  createSong,
  getSongs,
  deleteSong,
  updateSongVideo,
} from "@/lib/fileService";
import { searchYouTube, buildGuitarTabQuery } from "@/lib/youtubeService";

interface UseSongManagerReturn {
  songs: SongRecord[];
  isLoading: boolean;
  error: string | null;
  addSong: (name: string, artist: string) => Promise<void>;
  removeSong: (songId: string) => Promise<void>;
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

      // Auto-search YouTube in background
      try {
        const query = buildGuitarTabQuery(name, artist);
        const results = await searchYouTube(query);
        if (results.length > 0) {
          const bestMatch = results[0];
          await updateSongVideo(record.id, bestMatch.videoId);
          setSongs((prev) =>
            prev.map((s) =>
              s.id === record.id ? { ...s, youtubeVideoId: bestMatch.videoId } : s
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

  return { songs, isLoading, error, addSong, removeSong, refresh };
}
