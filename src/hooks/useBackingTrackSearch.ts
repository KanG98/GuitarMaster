"use client";

import { useState, useEffect } from "react";
import { updateSongBackingTrack } from "@/lib/fileService";
import { searchYouTube, YouTubeSearchResult, buildBackingTrackQuery } from "@/lib/youtubeService";

export function useBackingTrackSearch(songId: string, songName: string, artist: string, initialVideoId: string | null) {
  const [videoId, setVideoId] = useState<string | null>(initialVideoId);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<YouTubeSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Auto-search when entering a song with no backing track
  useEffect(() => {
    if (!initialVideoId) {
      handleSearch(buildBackingTrackQuery(songName, artist));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    try {
      const searchResults = await searchYouTube(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "YouTube search failed");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectVideo = async (newVideoId: string) => {
    setVideoId(newVideoId);
    setResults([]);
    await updateSongBackingTrack(songId, newVideoId);
  };

  const handleRemoveVideo = async () => {
    setVideoId(null);
    setResults([]);
    await updateSongBackingTrack(songId, null);
  };

  return {
    videoId,
    isSearching,
    results,
    error,
    handleSearch,
    handleSelectVideo,
    handleRemoveVideo,
  };
}
