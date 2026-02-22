"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SkipBack, SkipForward, Repeat } from "lucide-react";
import { Button } from "@/components/ui/button";

interface YouTubePlayerProps {
  videoId: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5];

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

export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);

  // Initialize player
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
          onReady: () => {
            if (!destroyed) setIsReady(true);
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

  // A-B loop polling
  useEffect(() => {
    if (isLooping && loopA !== null && loopB !== null && playerRef.current) {
      loopIntervalRef.current = setInterval(() => {
        if (!playerRef.current) return;
        const current = playerRef.current.getCurrentTime();
        if (current >= loopB) {
          playerRef.current.seekTo(loopA, true);
        }
      }, 250);
    }

    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
    };
  }, [isLooping, loopA, loopB]);

  const skip = useCallback((delta: number) => {
    if (!playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    playerRef.current.seekTo(Math.max(0, current + delta), true);
  }, []);

  const changeSpeed = useCallback((rate: number) => {
    if (!playerRef.current) return;
    playerRef.current.setPlaybackRate(rate);
    setPlaybackRate(rate);
  }, []);

  const setPointA = useCallback(() => {
    if (!playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    if (loopA !== null && Math.abs(loopA - current) < 1) {
      // Clicking A again near the same point clears it
      setLoopA(null);
      setIsLooping(false);
    } else {
      setLoopA(current);
      if (loopB !== null && current < loopB) {
        setIsLooping(true);
      }
    }
  }, [loopA, loopB]);

  const setPointB = useCallback(() => {
    if (!playerRef.current) return;
    const current = playerRef.current.getCurrentTime();
    if (loopB !== null && Math.abs(loopB - current) < 1) {
      setLoopB(null);
      setIsLooping(false);
    } else {
      setLoopB(current);
      if (loopA !== null && loopA < current) {
        setIsLooping(true);
      }
    }
  }, [loopA, loopB]);

  const toggleLoop = useCallback(() => {
    if (loopA !== null && loopB !== null) {
      setIsLooping((prev) => !prev);
    }
  }, [loopA, loopB]);

  const clearLoop = useCallback(() => {
    setLoopA(null);
    setLoopB(null);
    setIsLooping(false);
  }, []);

  const hasLoop = loopA !== null && loopB !== null;

  return (
    <div className="space-y-2">
      {/* Player container */}
      <div className="w-full aspect-video rounded-lg overflow-hidden bg-black">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Controls toolbar */}
      {isReady && (
        <div className="flex flex-wrap items-center gap-3 text-sm" data-testid="player-controls">
          {/* Skip controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => skip(-5)}
              title="Skip back 5s"
            >
              <SkipBack className="h-3 w-3 mr-1" />
              5s
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => skip(5)}
              title="Skip forward 5s"
            >
              5s
              <SkipForward className="h-3 w-3 ml-1" />
            </Button>
          </div>

          <div className="w-px h-5 bg-border" />

          {/* A-B Loop controls */}
          <div className="flex items-center gap-1">
            <Button
              variant={loopA !== null ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 font-mono"
              onClick={setPointA}
              title={loopA !== null ? `A: ${formatTime(loopA)} (click to clear)` : "Set loop start"}
            >
              A{loopA !== null && <span className="ml-1 text-xs opacity-70">{formatTime(loopA)}</span>}
            </Button>
            <Button
              variant={loopB !== null ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-2 font-mono"
              onClick={setPointB}
              title={loopB !== null ? `B: ${formatTime(loopB)} (click to clear)` : "Set loop end"}
            >
              B{loopB !== null && <span className="ml-1 text-xs opacity-70">{formatTime(loopB)}</span>}
            </Button>
            <Button
              variant={isLooping ? "secondary" : "ghost"}
              size="sm"
              className={`h-7 px-2 ${isLooping ? "text-primary" : ""}`}
              onClick={toggleLoop}
              disabled={!hasLoop}
              title={isLooping ? "Disable loop" : "Enable loop"}
            >
              <Repeat className="h-3 w-3" />
            </Button>
            {hasLoop && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-1 text-xs text-muted-foreground"
                onClick={clearLoop}
                title="Clear loop points"
              >
                Clear
              </Button>
            )}
          </div>

          <div className="w-px h-5 bg-border" />

          {/* Speed controls */}
          <div className="flex items-center gap-0.5">
            {SPEED_OPTIONS.map((rate) => (
              <Button
                key={rate}
                variant={playbackRate === rate ? "secondary" : "ghost"}
                size="sm"
                className={`h-7 px-2 text-xs ${playbackRate === rate ? "font-semibold" : ""}`}
                onClick={() => changeSpeed(rate)}
              >
                {rate}x
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export { formatTime };
