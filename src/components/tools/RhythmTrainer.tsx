"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Shuffle } from "lucide-react";

/* ── SVG Note Icons ── */
function NoteIcon({ type, className = "" }: { type: BeatType; className?: string }) {
  const svgProps = {
    viewBox: "0 0 40 64",
    className: `${className}`,
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg",
  };

  if (type === "full") {
    // Whole note: open oval, no stem
    return (
      <svg {...svgProps} viewBox="0 0 40 40">
        <ellipse cx="20" cy="20" rx="12" ry="8" stroke="currentColor" strokeWidth="3" fill="none" transform="rotate(-15 20 20)" />
        <ellipse cx="20" cy="20" rx="4" ry="7" fill="currentColor" transform="rotate(-15 20 20)" />
      </svg>
    );
  }

  if (type === "half") {
    // Half note: open notehead + stem
    return (
      <svg {...svgProps}>
        <line x1="29" y1="8" x2="29" y2="42" stroke="currentColor" strokeWidth="2.5" />
        <ellipse cx="20" cy="42" rx="11" ry="7" stroke="currentColor" strokeWidth="2.5" fill="none" transform="rotate(-15 20 42)" />
      </svg>
    );
  }

  // Quarter note: filled notehead + stem
  return (
    <svg {...svgProps}>
      <line x1="29" y1="8" x2="29" y2="42" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="20" cy="42" rx="11" ry="7" fill="currentColor" transform="rotate(-15 20 42)" />
    </svg>
  );
}

type BeatType = "full" | "half" | "quarter";
type TrainerMode = "beats" | "reading";
type NoteValue = "whole" | "half" | "quarter" | "eighth";

interface Beat {
  type: BeatType;
}

interface RhythmNote {
  value: NoteValue;
  beats: number;
}

const NOTE_BEATS: Record<NoteValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
};

const NOTE_SYMBOLS: Record<NoteValue, string> = {
  whole: "𝅝",
  half: "𝅗𝅥",
  quarter: "♩",
  eighth: "♪",
};

function generatePattern(): Beat[] {
  const types: BeatType[] = ["full", "half", "quarter"];
  return Array.from({ length: 8 }, () => ({
    type: types[Math.floor(Math.random() * types.length)],
  }));
}

function generateRhythmSequence(): RhythmNote[] {
  const notes: RhythmNote[] = [];
  let remaining = 16; // 4 bars of 4/4

  while (remaining > 0) {
    // Pick a random note that fits
    const possible: NoteValue[] = [];
    if (remaining >= 4) possible.push("whole");
    if (remaining >= 2) possible.push("half");
    if (remaining >= 1) possible.push("quarter");
    if (remaining >= 0.5) possible.push("eighth");

    const chosen = possible[Math.floor(Math.random() * possible.length)];
    const beats = NOTE_BEATS[chosen];
    notes.push({ value: chosen, beats });
    remaining -= beats;
  }

  return notes;
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
  const [mode, setMode] = useState<TrainerMode>("beats");
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(-1);
  const [currentNote, setCurrentNote] = useState(-1);
  const [pattern, setPattern] = useState<Beat[]>(() => generatePattern());
  const [rhythmSequence, setRhythmSequence] = useState<RhythmNote[]>(() => generateRhythmSequence());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatRef = useRef(0);
  const noteRef = useRef(0);
  const patternRef = useRef(pattern);
  const rhythmSequenceRef = useRef(rhythmSequence);
  const bpmRef = useRef(bpm);
  const modeRef = useRef(mode);

  // Keep refs in sync
  patternRef.current = pattern;
  rhythmSequenceRef.current = rhythmSequence;
  bpmRef.current = bpm;
  modeRef.current = mode;

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    const ctx = getOrCreateCtx();

    if (modeRef.current === "beats") {
      const tick = () => {
        const idx = beatRef.current;
        const p = patternRef.current;
        setCurrentBeat(idx);
        setCurrentNote(-1); // Clear reading mode highlight
        playClick(ctx, p[idx].type);
        beatRef.current = (idx + 1) % 8;
      };

      tick(); // play first beat immediately
      intervalRef.current = setInterval(tick, 60000 / bpmRef.current);
    } else {
      // Reading mode: step through rhythm sequence with variable durations
      const playNextNote = () => {
        const noteIdx = noteRef.current;
        const sequence = rhythmSequenceRef.current;
        const note = sequence[noteIdx];
        
        setCurrentNote(noteIdx);
        setCurrentBeat(-1); // Clear beats mode highlight
        
        // Play click sound (simple click, not differentiated like beats mode)
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.frequency.value = 800; // Standard metronome click
        osc.type = "sine";

        const duration = 0.05;
        const volume = 0.4;

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.start(now);
        osc.stop(now + duration);
        
        // Calculate next note timing
        const noteDuration = note.beats * (60000 / bpmRef.current);
        noteRef.current = (noteIdx + 1) % sequence.length;
        
        timeoutRef.current = setTimeout(playNextNote, noteDuration);
      };

      playNextNote(); // Start immediately
    }
  }, [getOrCreateCtx, stopLoop]);

  // Restart interval when BPM changes during playback
  useEffect(() => {
    if (isPlaying) {
      startLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

  // Restart when mode changes during playback
  useEffect(() => {
    if (isPlaying) {
      startLoop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

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
      setCurrentNote(-1);
      beatRef.current = 0;
      noteRef.current = 0;
    } else {
      setIsPlaying(true);
      startLoop();
    }
  };

  const handleNext = () => {
    beatRef.current = 0;
    noteRef.current = 0;
    
    if (mode === "beats") {
      setPattern(generatePattern());
    } else {
      setRhythmSequence(generateRhythmSequence());
    }
    
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

  const switchMode = (newMode: TrainerMode) => {
    if (newMode === mode) return;
    
    // Stop current playback
    if (isPlaying) {
      stopLoop();
      setIsPlaying(false);
    }
    
    // Reset state
    setCurrentBeat(-1);
    setCurrentNote(-1);
    beatRef.current = 0;
    noteRef.current = 0;
    
    // Switch mode
    setMode(newMode);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Rhythm Trainer</h1>
        <p className="text-muted-foreground">
          Practice rhythm patterns with visual beats and metronome clicks
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={mode === "beats" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("beats")}
            data-testid="mode-beats"
          >
            Beats
          </Button>
          <Button
            variant={mode === "reading" ? "default" : "outline"}
            size="sm"
            onClick={() => switchMode("reading")}
            data-testid="mode-reading"
          >
            Reading
          </Button>
        </div>
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

      {/* Display Area */}
      <div className="mb-8">
        {mode === "beats" ? (
          <>
            {/* Beat notes */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-4" data-testid="rhythm-display">
              {pattern.map((beat, i) => {
                const active = currentBeat === i;
                return (
                  <div
                    key={i}
                    data-testid={`beat-${i}`}
                    title={`Beat ${i + 1}: ${beat.type}`}
                    className={`
                      w-10 h-14 sm:w-14 sm:h-18 rounded-lg border-2
                      transition-all duration-100 flex-shrink-0
                      flex items-center justify-center
                      ${active
                        ? "border-primary ring-2 ring-primary/50 scale-110 shadow-lg bg-primary text-primary-foreground"
                        : "border-border bg-muted text-foreground"
                      }
                    `}
                  >
                    <NoteIcon type={beat.type} className="w-8 h-10 sm:w-10 sm:h-12" />
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <NoteIcon type="full" className="w-5 h-5" />
                <span>Whole</span>
              </div>
              <div className="flex items-center gap-1.5">
                <NoteIcon type="half" className="w-4 h-5" />
                <span>Half</span>
              </div>
              <div className="flex items-center gap-1.5">
                <NoteIcon type="quarter" className="w-4 h-5" />
                <span>Quarter</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Rhythm Reading Display */}
            <div className="mb-4">
              <div
                className="relative w-full h-20 bg-background border rounded-lg overflow-hidden"
                data-testid="rhythm-sequence"
              >
                <div className="flex h-full">
                  {rhythmSequence.map((note, i) => {
                    const isActive = currentNote === i;
                    const widthPercent = (note.beats / 16) * 100;
                    
                    return (
                      <div
                        key={i}
                        data-testid={`note-${i}`}
                        style={{ width: `${widthPercent}%` }}
                        className={`
                          h-full border-r border-border flex flex-col items-center justify-center
                          transition-colors duration-150 text-lg font-semibold
                          ${isActive 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-foreground"
                          }
                        `}
                        title={`${note.value} note (${note.beats} beats)`}
                      >
                        <div className="text-center">
                          <div className="text-2xl sm:text-3xl mb-1">
                            {NOTE_SYMBOLS[note.value]}
                          </div>
                          <div className="text-xs">
                            {note.beats}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Bar lines at beat 4, 8, 12 */}
                {[4, 8, 12].map((beat, idx) => {
                  const position = (beat / 16) * 100;
                  return (
                    <div
                      key={beat}
                      className="absolute top-0 w-0.5 h-full bg-border"
                      style={{ left: `${position}%` }}
                      data-testid={`bar-line-${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>

            {/* Rhythm Reading Legend */}
            <div className="flex justify-center gap-4 sm:gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">𝅝</span>
                <span>Whole (4)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">𝅗𝅥</span>
                <span>Half (2)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">♩</span>
                <span>Quarter (1)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg">♪</span>
                <span>Eighth (0.5)</span>
              </div>
            </div>
          </>
        )}
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
