"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Shuffle } from "lucide-react";

type BeatType = "full" | "half" | "quarter";

interface Beat {
  type: BeatType;
}

function generatePattern(): Beat[] {
  const types: BeatType[] = ["full", "half", "quarter"];
  return Array.from({ length: 8 }, () => ({
    type: types[Math.floor(Math.random() * types.length)],
  }));
}

function playClick(ctx: AudioContext, type: BeatType) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = type === "full" ? 1000 : type === "half" ? 800 : 600;
  osc.type = "sine";

  const duration = type === "full" ? 0.08 : type === "half" ? 0.05 : 0.03;
  const volume = type === "full" ? 0.6 : type === "half" ? 0.4 : 0.25;

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.start(now);
  osc.stop(now + duration);
}

export function RhythmTrainer() {
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [pattern, setPattern] = useState<Beat[]>(() => generatePattern());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const beatRef = useRef(0);
  const patternRef = useRef(pattern);
  const bpmRef = useRef(bpm);

  // Keep refs in sync
  patternRef.current = pattern;
  bpmRef.current = bpm;

  const getOrCreateCtx = useCallback((): AudioContext => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Mobile audio unlock — permanent listeners
  useEffect(() => {
    const resume = () => {
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };
    document.addEventListener("touchstart", resume, { passive: true });
    document.addEventListener("click", resume, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") resume();
    });
  }, []);

  const stopLoop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    const ctx = getOrCreateCtx();

    const tick = () => {
      const idx = beatRef.current;
      const p = patternRef.current;
      setCurrentBeat(idx);
      playClick(ctx, p[idx].type);
      beatRef.current = (idx + 1) % 8;
    };

    tick(); // play first beat immediately
    intervalRef.current = setInterval(tick, 60000 / bpmRef.current);
  }, [getOrCreateCtx, stopLoop]);

  // Restart interval when BPM changes during playback
  useEffect(() => {
    if (isPlaying) {
      startLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  // Cleanup
  useEffect(() => {
    return () => {
      stopLoop();
      audioCtxRef.current?.close();
    };
  }, [stopLoop]);

  const handlePlayPause = () => {
    if (isPlaying) {
      stopLoop();
      setIsPlaying(false);
      setCurrentBeat(-1);
      beatRef.current = 0;
    } else {
      setIsPlaying(true);
      startLoop();
    }
  };

  const handleNext = () => {
    beatRef.current = 0;
    setPattern(generatePattern());
    if (isPlaying) {
      // Restart loop so it picks up new pattern immediately
      startLoop();
    }
  };

  const handleBpmSlider = (value: number[]) => setBpm(value[0]);

  const handleBpmInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (!isNaN(v) && v >= 40 && v <= 200) setBpm(v);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Rhythm Trainer</h1>
        <p className="text-muted-foreground">
          Practice rhythm patterns with visual beats and metronome clicks
        </p>
      </div>

      {/* BPM */}
      <div className="mb-8 space-y-3">
        <label className="text-sm font-medium">BPM: {bpm}</label>
        <div className="flex items-center gap-4">
          <Slider
            data-testid="bpm-slider"
            value={[bpm]}
            onValueChange={handleBpmSlider}
            min={40}
            max={200}
            step={1}
            className="flex-1"
          />
          <input
            data-testid="bpm-input"
            type="number"
            value={bpm}
            onChange={handleBpmInput}
            min={40}
            max={200}
            className="w-20 px-3 py-1.5 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Beat squares */}
      <div className="mb-8">
        <div className="flex justify-center gap-2 sm:gap-3 mb-4" data-testid="rhythm-display">
          {pattern.map((beat, i) => {
            const active = currentBeat === i;
            const fillPct = beat.type === "full" ? 100 : beat.type === "half" ? 50 : 25;
            return (
              <div
                key={i}
                data-testid={`beat-${i}`}
                title={`Beat ${i + 1}: ${beat.type}`}
                className={`
                  w-10 h-10 sm:w-14 sm:h-14 rounded-lg border-2 overflow-hidden
                  transition-all duration-100 flex-shrink-0
                  ${active
                    ? "border-primary ring-2 ring-primary/50 scale-110 shadow-lg"
                    : "border-border"
                  }
                `}
              >
                <div className="w-full h-full flex">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${fillPct}%` }}
                  />
                  <div
                    className="h-full bg-muted"
                    style={{ width: `${100 - fillPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border bg-primary" />
            <span>Full</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border overflow-hidden flex">
              <div className="w-1/2 h-full bg-primary" />
              <div className="w-1/2 h-full bg-muted" />
            </div>
            <span>Half</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border overflow-hidden flex">
              <div className="w-1/4 h-full bg-primary" />
              <div className="w-3/4 h-full bg-muted" />
            </div>
            <span>Quarter</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handlePlayPause}
          size="lg"
          data-testid="play-btn"
          className="min-w-[120px]"
        >
          {isPlaying ? (
            <><Pause className="w-4 h-4 mr-2" /> Pause</>
          ) : (
            <><Play className="w-4 h-4 mr-2" /> Play</>
          )}
        </Button>
        <Button
          onClick={handleNext}
          variant="outline"
          size="lg"
          data-testid="next-btn"
        >
          <Shuffle className="w-4 h-4 mr-2" /> Next
        </Button>
      </div>
    </div>
  );
}
