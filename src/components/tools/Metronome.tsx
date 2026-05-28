"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Hand, Minus, Plus } from "lucide-react";
import {
  TimeSignature,
  beatsPerMeasure,
  clampBpm,
  calcTapTempo,
  startMetronome,
  stopMetronome,
  updateMetronomeConfig,
  DEFAULT_BPM,
  MIN_BPM,
  MAX_BPM,
} from "@/lib/metronomeEngine";

const TIME_SIGNATURES: TimeSignature[] = ["2/4", "3/4", "4/4", "6/8"];

export function Metronome() {
  const [bpm, setBpm] = useState(DEFAULT_BPM);
  const [timeSignature, setTimeSignature] = useState<TimeSignature>("4/4");
  const [playing, setPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [volume, setVolume] = useState(0.7);
  const [editingBpm, setEditingBpm] = useState(false);
  const [bpmInput, setBpmInput] = useState(String(DEFAULT_BPM));
  const bpmInputRef = useRef<HTMLInputElement>(null);
  const tapsRef = useRef<number[]>([]);
  const tapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const beats = beatsPerMeasure(timeSignature);

  const handleToggle = useCallback(() => {
    if (playing) {
      stopMetronome();
      setPlaying(false);
      setCurrentBeat(-1);
    } else {
      startMetronome({ bpm, timeSignature, volume }, (beat) => {
        setCurrentBeat(beat);
      });
      setPlaying(true);
    }
  }, [playing, bpm, timeSignature, volume]);

  const changeBpm = useCallback(
    (newBpm: number) => {
      const clamped = clampBpm(newBpm);
      setBpm(clamped);
      if (playing) updateMetronomeConfig({ bpm: clamped });
    },
    [playing]
  );

  const handleTap = useCallback(() => {
    const now = Date.now();
    // Reset if last tap was >2s ago
    if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
    if (tapsRef.current.length > 0 && now - tapsRef.current[tapsRef.current.length - 1] > 2000) {
      tapsRef.current = [];
    }
    tapsRef.current.push(now);
    const result = calcTapTempo(tapsRef.current);
    if (result !== null) changeBpm(result);
    tapTimeoutRef.current = setTimeout(() => {
      tapsRef.current = [];
    }, 2000);
  }, [changeBpm]);

  const handleTsChange = useCallback(
    (ts: TimeSignature) => {
      setTimeSignature(ts);
      setCurrentBeat(-1);
      if (playing) {
        stopMetronome();
        startMetronome({ bpm, timeSignature: ts, volume }, (beat) => {
          setCurrentBeat(beat);
        });
      }
    },
    [playing, bpm, volume]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMetronome();
    };
  }, []);

  const startBpmEdit = () => {
    setBpmInput(String(bpm));
    setEditingBpm(true);
    setTimeout(() => bpmInputRef.current?.select(), 50);
  };

  const confirmBpmEdit = () => {
    const parsed = parseInt(bpmInput, 10);
    if (!isNaN(parsed)) {
      changeBpm(parsed);
    }
    setEditingBpm(false);
  };

  const cancelBpmEdit = () => {
    setEditingBpm(false);
  };

  const handleBpmKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      confirmBpmEdit();
    } else if (e.key === "Escape") {
      cancelBpmEdit();
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      <h2 className="text-2xl font-bold">Metronome</h2>

      {/* Beat indicators */}
      <div className="flex gap-3">
        {Array.from({ length: beats }, (_, i) => (
          <div
            key={i}
            data-testid={`beat-dot-${i}`}
            className={`w-5 h-5 rounded-full border-2 transition-colors duration-100 ${
              currentBeat === i
                ? i === 0
                  ? "bg-primary border-primary scale-125"
                  : "bg-primary/70 border-primary/70"
                : "bg-muted border-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* BPM display */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          data-testid="bpm-decrease"
          onClick={() => changeBpm(bpm - 1)}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <div className="text-center min-w-[100px]">
          {editingBpm ? (
            <input
              ref={bpmInputRef}
              type="number"
              inputMode="numeric"
              value={bpmInput}
              onChange={(e) => setBpmInput(e.target.value)}
              onBlur={confirmBpmEdit}
              onKeyDown={handleBpmKeyDown}
              className="text-5xl font-bold tabular-nums w-full text-center bg-transparent border-b-2 border-primary outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min={MIN_BPM}
              max={MAX_BPM}
              data-testid="bpm-input"
              autoFocus
            />
          ) : (
            <button
              onClick={startBpmEdit}
              className="text-5xl font-bold tabular-nums hover:text-primary transition-colors cursor-text"
              data-testid="bpm-display"
            >
              {bpm}
            </button>
          )}
          <p className="text-sm text-muted-foreground mt-1">BPM</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          data-testid="bpm-increase"
          onClick={() => changeBpm(bpm + 1)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* BPM slider */}
      <div className="w-full max-w-xs">
        <Slider
          min={MIN_BPM}
          max={MAX_BPM}
          step={1}
          value={[bpm]}
          onValueChange={([v]) => changeBpm(v)}
          data-testid="bpm-slider"
        />
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          size="lg"
          data-testid="metronome-toggle"
          onClick={handleToggle}
          className="min-w-[120px]"
        >
          {playing ? <Pause className="h-5 w-5 mr-2" /> : <Play className="h-5 w-5 mr-2" />}
          {playing ? "Stop" : "Start"}
        </Button>
        <Button
          variant="outline"
          size="lg"
          data-testid="tap-tempo"
          onClick={handleTap}
        >
          <Hand className="h-5 w-5 mr-2" />
          Tap
        </Button>
      </div>

      {/* Time signature */}
      <div className="flex gap-2">
        {TIME_SIGNATURES.map((ts) => (
          <Button
            key={ts}
            variant={timeSignature === ts ? "secondary" : "outline"}
            size="sm"
            data-testid={`ts-${ts}`}
            data-active={timeSignature === ts ? "true" : "false"}
            onClick={() => handleTsChange(ts)}
          >
            {ts}
          </Button>
        ))}
      </div>

      {/* Volume */}
      <div className="w-full max-w-xs flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Vol</span>
        <Slider
          min={0}
          max={100}
          step={1}
          value={[Math.round(volume * 100)]}
          onValueChange={([v]) => {
            const newVol = v / 100;
            setVolume(newVol);
            if (playing) updateMetronomeConfig({ volume: newVol });
          }}
          data-testid="volume-slider"
        />
      </div>

    </div>
  );
}
