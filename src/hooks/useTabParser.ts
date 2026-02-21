"use client";

import { useState, useCallback, useEffect } from "react";
import {
  SongRecord,
  createSong,
  getSongs,
  deleteSong,
} from "@/lib/fileService";

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
      setIsLoading(true);
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
