"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { SkipBack, SkipForward, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { LoopControls } from "./player/LoopControls";
import { formatTime } from "@/lib/utils";
import { SpeedControls } from "./player/SpeedControls";

interface YouTubePlayerProps {
  videoId: string;
  onPlayingChange?: (playing: boolean) => void;
}

export function YouTubePlayer({ videoId, onPlayingChange }: YouTubePlayerProps) {
  const {
    containerRef,
    isReady,
    duration,
    getCurrentTime,
    getPlayerState,
    seekTo,
    playVideo,
    setPlaybackRate,
  } = useYouTubePlayer({ videoId, onPlayingChange });

  const loopIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [playbackRate, setPlaybackRateState] = useState(1);
  const [loopA, setLoopA] = useState<number | null>(null);
  const [loopB, setLoopB] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [skipAmount, setSkipAmount] = useState(5);
  const [skipInputValue, setSkipInputValue] = useState("5");
  const [showSettings, setShowSettings] = useState(false);

  // A-B loop polling
  useEffect(() => {
    if (isLooping && loopA !== null && loopB !== null) {
      loopIntervalRef.current = setInterval(() => {
        const current = getCurrentTime();
        if (current >= loopB || current < loopA) {
          seekTo(loopA);
        }
      }, 250);
    }

    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
        loopIntervalRef.current = null;
      }
    };
  }, [isLooping, loopA, loopB, getCurrentTime, seekTo]);

  const skip = useCallback((delta: number) => {
    const current = getCurrentTime();
    seekTo(Math.max(0, current + delta));
  }, [getCurrentTime, seekTo]);

  const changeSpeed = useCallback((rate: number) => {
    setPlaybackRate(rate);
    setPlaybackRateState(rate);
  }, [setPlaybackRate]);

  const handleLoopRange = useCallback((values: number[]) => {
    const [a, b] = values;
    setLoopA(a);
    setLoopB(b);
    setIsLooping(true);

    const state = getPlayerState();
    if (state !== 1) { // not PLAYING
      seekTo(a);
      playVideo();
    } else {
      const current = getCurrentTime();
      if (current < a || current >= b) {
        seekTo(a);
      }
    }
  }, [getPlayerState, seekTo, playVideo, getCurrentTime]);

  const handleSetA = useCallback(() => {
    const t = Math.floor(getCurrentTime());
    const b = loopB ?? duration;
    if (t < b) handleLoopRange([t, b]);
  }, [getCurrentTime, loopB, duration, handleLoopRange]);

  const handleSetB = useCallback(() => {
    const t = Math.floor(getCurrentTime());
    const a = loopA ?? 0;
    if (t > a) handleLoopRange([a, t]);
  }, [getCurrentTime, loopA, handleLoopRange]);

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

  const handleSkipInputChange = useCallback((value: string) => {
    setSkipInputValue(value);
    const v = parseInt(value, 10);
    if (v >= 1 && v <= 120) setSkipAmount(v);
  }, []);

  const handleSkipInputBlur = useCallback(() => {
    const v = parseInt(skipInputValue, 10);
    if (!v || v < 1) {
      setSkipAmount(5);
      setSkipInputValue("5");
    } else if (v > 120) {
      setSkipAmount(120);
      setSkipInputValue("120");
    } else {
      setSkipInputValue(String(v));
    }
  }, [skipInputValue]);

  const restartLoop = useCallback(() => {
    const target = loopA ?? 0;
    seekTo(target);
    const state = getPlayerState();
    if (state !== 1) { // not PLAYING
      playVideo();
    }
  }, [loopA, seekTo, getPlayerState, playVideo]);

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
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={restartLoop}
                title={hasLoop ? "Restart loop" : "Restart from beginning"}
                data-testid="restart-loop"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </Button>
            </div>

            <div className="w-px h-5 bg-border" />

            <LoopControls
              duration={duration}
              loopA={loopA}
              loopB={loopB}
              isLooping={isLooping}
              hasLoop={hasLoop}
              onLoopRangeChange={handleLoopRange}
              onSetA={handleSetA}
              onSetB={handleSetB}
              onToggleLoop={toggleLoop}
              onClearLoop={clearLoop}
              skipInputValue={skipInputValue}
              onSkipInputChange={handleSkipInputChange}
              onSkipInputBlur={handleSkipInputBlur}
              showSettings={showSettings}
              onToggleSettings={() => setShowSettings((s) => !s)}
            />
          </div>

          {/* Row 2: Speed controls */}
          <SpeedControls
            playbackRate={playbackRate}
            onChangeSpeed={changeSpeed}
          />
        </div>
      )}
    </div>
  );
}

export { formatTime };
