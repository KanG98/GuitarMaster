"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Timer, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePracticeTime } from "@/lib/fileService";

interface PracticeTimerProps {
  songId: string;
  initialSeconds: number;
  secondsRef?: React.RefObject<number>;
  isPlaying?: boolean;
}

export function PracticeTimer({ songId, initialSeconds, secondsRef: externalSecondsRef, isPlaying }: PracticeTimerProps) {
  const videoControlled = isPlaying !== undefined;
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(!videoControlled);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const savedSecondsRef = useRef(initialSeconds);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Video-controlled mode: sync with isPlaying prop
  useEffect(() => {
    if (!videoControlled) return;
    if (isPlaying) {
      start();
    } else {
      pause();
    }
  }, [isPlaying, videoControlled, start, pause]);

  // Manual mode: start timer on mount
  useEffect(() => {
    if (videoControlled) return;
    start();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [start, videoControlled]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSave = setInterval(() => {
      setSeconds((current) => {
        const delta = current - savedSecondsRef.current;
        if (delta > 0) {
          updatePracticeTime(songId, delta);
          savedSecondsRef.current = current;
        }
        return current;
      });
    }, 30000);

    return () => clearInterval(autoSave);
  }, [songId]);

  // Track latest seconds for unmount save + expose to parent
  const secondsRef = useRef(seconds);
  secondsRef.current = seconds;
  if (externalSecondsRef) externalSecondsRef.current = seconds;

  // Save on unmount
  useEffect(() => {
    return () => {
      const delta = secondsRef.current - savedSecondsRef.current;
      if (delta > 0) {
        updatePracticeTime(songId, delta);
      }
    };
  }, [songId]);

  const toggle = () => {
    if (isRunning) pause();
    else start();
  };

  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const display = `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Timer className="h-4 w-4" />
      <span className="font-mono tabular-nums">{display}</span>
      {!videoControlled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={toggle}
        >
          {isRunning ? (
            <Pause className="h-3 w-3" />
          ) : (
            <Play className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  );
}
