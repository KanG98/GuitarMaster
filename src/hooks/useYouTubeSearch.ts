"use client";

import { useState, useEffect } from "react";
import { updateSongVideo } from "@/lib/fileService";
import { searchYouTube, YouTubeSearchResult, buildGuitarTabQuery } from "@/lib/youtubeService";

export function useYouTubeSearch(songId: string, songName: string, artist: string, initialVideoId: string | null) {
  const [videoId, setVideoId] = useState<string | null>(initialVideoId);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeSearchResult[]>([]);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Auto-search YouTube when entering a song with no video
  useEffect(() => {
    if (!initialVideoId) {
      handleYouTubeSearch(buildGuitarTabQuery(songName, artist));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  const handleYouTubeSearch = async (query: string) => {
    setIsSearchingYouTube(true);
    setYoutubeError(null);
    try {
      const results = await searchYouTube(query);
      setYoutubeResults(results);
    } catch (err) {
      setYoutubeError(err instanceof Error ? err.message : "YouTube search failed");
    } finally {
      setIsSearchingYouTube(false);
    }
  };

  const handleSelectVideo = async (newVideoId: string) => {
    setVideoId(newVideoId);
    setYoutubeResults([]);
    await updateSongVideo(songId, newVideoId);
  };

  const handleRemoveVideo = async () => {
    setVideoId(null);
    setYoutubeResults([]);
    await updateSongVideo(songId, null);
  };

  return {
    videoId,
    isSearchingYouTube,
    youtubeResults,
    youtubeError,
    handleYouTubeSearch,
    handleSelectVideo,
    handleRemoveVideo,
  };
}