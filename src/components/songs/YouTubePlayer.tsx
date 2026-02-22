"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SkipBack, SkipForward, Repeat, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface YouTubePlayerProps {
  videoId: string;
  onPlayingChange?: (playing: boolean) => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SLOW_SPEEDS = [0.25, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
const FAST_SPEEDS = [1, 1.25, 1.5, 1.75, 2];

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

export function YouTubePlayer({ videoId, onPlayingChange }: YouTubePlayerProps) {
  const playerRef = useRef<YT.Player | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [skipAmount, setSkipAmount] = useState(5);
  const [showSettings, setShowSettings] = useState(false);

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
          onReady: (event: YT.PlayerEvent) => {
            if (!destroyed) {
              setDuration(event.target.getDuration());
              setIsReady(true);
            }
          },
          onStateChange: (event: YT.OnStateChangeEvent) => {
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

  // A-B loop polling
  useEffect(() => {
    if (isLooping && loopA !== null && loopB !== null && playerRef.current) {
      loopIntervalRef.current = setInterval(() => {
        if (!playerRef.current) return;
        const current = playerRef.current.getCurrentTime();
        if (current >= loopB || current < loopA) {
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

  const handleLoopRange = useCallback((values: number[]) => {
    const [a, b] = values;
    setLoopA(a);
    setLoopB(b);
    setIsLooping(true);

    if (playerRef.current) {
      // Auto-play if not already playing
      const state = playerRef.current.getPlayerState();
      if (state !== 1) { // not PLAYING
        playerRef.current.seekTo(a, true);
        playerRef.current.playVideo();
      } else {
        // If current position is outside the loop range, jump into it
        const current = playerRef.current.getCurrentTime();
        if (current < a || current >= b) {
          playerRef.current.seekTo(a, true);
        }
      }
    }
  }, []);

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
      <div className="aspect-video rounded-lg overflow-hidden bg-black">
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Controls toolbar */}
      {isReady && (
        <div className="space-y-2" data-testid="player-controls">
          {/* Row 1: Skip + Loop */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => skip(-skipAmount)}
                title={`Skip back ${skipAmount}s`}
                data-testid="skip-back"
              >
                <SkipBack className="h-3 w-3 mr-1" />
                {skipAmount}s
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => skip(skipAmount)}
                title={`Skip forward ${skipAmount}s`}
                data-testid="skip-forward"
              >
                {skipAmount}s
                <SkipForward className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <div className="w-px h-5 bg-border" />

            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                {formatTime(loopA ?? 0)}
              </span>
              <Slider
                min={0}
                max={Math.max(duration, 1)}
                step={1}
                value={[loopA ?? 0, loopB ?? duration]}
                onValueChange={handleLoopRange}
                className="flex-1"
                data-testid="loop-slider"
              />
              <span className="text-xs font-mono text-muted-foreground w-10">
                {formatTime(loopB ?? duration)}
              </span>
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
              <div className="relative ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowSettings((s) => !s)}
                  title="Settings"
                  data-testid="settings-btn"
                >
                  <Settings className="h-3.5 w-3.5" />
                </Button>
                {showSettings && (
                  <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border bg-popover p-3 shadow-md" data-testid="settings-popover">
                    <label className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground whitespace-nowrap">Skip (seconds)</span>
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={skipAmount}
                        onChange={(e) => {
                          const v = parseInt(e.target.value, 10);
                          if (v >= 1 && v <= 120) setSkipAmount(v);
                        }}
                        className="w-16 text-sm border rounded px-2 py-1 bg-background outline-none focus:ring-1 focus:ring-primary"
                        data-testid="skip-amount-input"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: Speed controls */}
          <div className="rounded-lg border bg-muted/30 px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-8 shrink-0">Slow</span>
              <div className="flex items-center gap-1">
                {SLOW_SPEEDS.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`h-6 px-1.5 text-xs rounded-full transition-colors ${
                      playbackRate === rate
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-8 shrink-0">Fast</span>
              <div className="flex items-center gap-1">
                {FAST_SPEEDS.map((rate) => (
                  <button
                    key={rate}
                    onClick={() => changeSpeed(rate)}
                    className={`h-6 px-1.5 text-xs rounded-full transition-colors ${
                      playbackRate === rate
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { formatTime };
