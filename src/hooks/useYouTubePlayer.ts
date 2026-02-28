"use client";

import { useState, useEffect, useRef, useCallback } from "react";

let apiLoadPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (apiLoadPromise) return apiLoadPromise;

  if (window.YT?.Player) {
    apiLoadPromise = Promise.resolve();
    return apiLoadPromise;
  }

  apiLoadPromise = new Promise<void>((resolve) => {
    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      existingCallback?.();
      resolve();
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  });

  return apiLoadPromise;
}

interface UseYouTubePlayerOptions {
  videoId: string;
  onPlayingChange?: (playing: boolean) => void;
}

export function useYouTubePlayer({ videoId, onPlayingChange }: UseYouTubePlayerOptions) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    let destroyed = false;
    const containerId = `yt-player-${videoId}`;

    if (containerRef.current) {
      containerRef.current.id = containerId;
    }

    loadYouTubeAPI().then(() => {
      if (destroyed || !containerRef.current) return;

      playerRef.current = new YT.Player(containerId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
        },
        events: {
          onReady: (event: YT.PlayerEvent) => {
            if (!destroyed) {
              setDuration(event.target.getDuration());
              setIsReady(true);
            }
          },
          onStateChange: (event: YT.PlayerEvent) => {
            if (!destroyed) {
              onPlayingChange?.(event.data === YT.PlayerState.PLAYING);
            }
          },
        },
      });
    });

    return () => {
      destroyed = true;
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {
          // Player may already be destroyed
        }
        playerRef.current = null;
      }
      setIsReady(false);
    };
  }, [videoId]);

  const getCurrentTime = useCallback(() => {
    return playerRef.current?.getCurrentTime() ?? 0;
  }, []);

  const getPlayerState = useCallback(() => {
    return playerRef.current?.getPlayerState() ?? -1;
  }, []);

  const seekTo = useCallback((time: number) => {
    playerRef.current?.seekTo(time, true);
  }, []);

  const playVideo = useCallback(() => {
    playerRef.current?.playVideo();
  }, []);

  const setPlaybackRate = useCallback((rate: number) => {
    playerRef.current?.setPlaybackRate(rate);
  }, []);

  return {
    containerRef,
    isReady,
    duration,
    getCurrentTime,
    getPlayerState,
    seekTo,
    playVideo,
    setPlaybackRate,
  };
}
