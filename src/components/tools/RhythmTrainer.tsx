"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Shuffle, Drum, Music } from "lucide-react";

/* ── Note Types & Generation ── */
type NoteValue = "whole" | "half" | "quarter" | "eighth" | "sixteenth";
type SoundMode = "metronome" | "rhythm";

interface RhythmNote {
  value: NoteValue;
  beats: number;
}

const NOTE_BEATS: Record<NoteValue, number> = {
  whole: 4,
  half: 2,
  quarter: 1,
  eighth: 0.5,
  sixteenth: 0.25,
};

const NOTE_LABELS: Record<NoteValue, string> = {
  whole: "Whole",
  half: "Half",
  quarter: "Quarter",
  eighth: "Eighth",
  sixteenth: "16th",
};

function generateRhythmBar(): RhythmNote[] {
  const notes: RhythmNote[] = [];
  let remaining = 4; // one bar of 4/4

  while (remaining > 0) {
    const possible: NoteValue[] = [];
    if (remaining >= 4) possible.push("whole");
    if (remaining >= 2) possible.push("half");
    if (remaining >= 1) possible.push("quarter");
    if (remaining >= 0.5) possible.push("eighth");
    if (remaining >= 0.25) possible.push("sixteenth");

    const chosen = possible[Math.floor(Math.random() * possible.length)];
    const beats = NOTE_BEATS[chosen];
    notes.push({ value: chosen, beats });
    remaining = Math.round((remaining - beats) * 100) / 100;
  }

  return notes;
}

function generateRhythmSequence(): RhythmNote[] {
  // Generate 4 bars
  return [...generateRhythmBar(), ...generateRhythmBar(), ...generateRhythmBar(), ...generateRhythmBar()];
}

/* ── SVG Staff Renderer ── */
function drawNoteHead(filled: boolean, cx: number, cy: number): React.ReactElement[] {
  const elems: React.ReactElement[] = [];
  if (filled) {
    elems.push(
      <ellipse key={`nh-${cx}`} cx={cx} cy={cy} rx={6} ry={4.5} fill="currentColor" transform={`rotate(-15 ${cx} ${cy})`} />
    );
  } else {
    elems.push(
      <ellipse key={`nho-${cx}`} cx={cx} cy={cy} rx={6} ry={4.5} stroke="currentColor" strokeWidth={1.8} fill="none" transform={`rotate(-15 ${cx} ${cy})`} />
    );
  }
  return elems;
}

function RhythmStaff({ notes, activeIndex }: { notes: RhythmNote[]; activeIndex: number }) {
  // Layout: proportional spacing based on beat value
  const totalBeats = notes.reduce((s, n) => s + n.beats, 0);
  const padding = 20;
  const width = 600;
  const usable = width - padding * 2;
  const staffY = 30; // vertical center for noteheads
  const stemH = 28;

  // Compute x positions
  let beatAccum = 0;
  const positions = notes.map((n) => {
    const x = padding + (beatAccum / totalBeats) * usable;
    beatAccum += n.beats;
    return x;
  });

  // Find bar lines (every 4 beats)
  const barLines: number[] = [];
  let b = 0;
  for (let i = 0; i < notes.length; i++) {
    b += notes[i].beats;
    if (Math.abs(b % 4) < 0.01 && b < totalBeats) {
      barLines.push(padding + (b / totalBeats) * usable);
    }
  }

  // Group consecutive eighths/sixteenths for beaming
  const elements: React.ReactElement[] = [];

  // Bar lines
  barLines.forEach((bx, i) => {
    elements.push(
      <line key={`bar-${i}`} x1={bx} y1={staffY - stemH} x2={bx} y2={staffY + 8} stroke="currentColor" strokeWidth={1} opacity={0.3} />
    );
  });

  // Draw notes
  for (let i = 0; i < notes.length; i++) {
    const note = notes[i];
    const x = positions[i];
    const isActive = activeIndex === i;
    const color = isActive ? "var(--primary)" : "currentColor";
    const groupProps = { style: { color } };

    if (note.value === "whole") {
      // Open oval with inner cutout
      elements.push(
        <g key={`n-${i}`} {...groupProps}>
          <ellipse cx={x} cy={staffY} rx={8} ry={5.5} stroke="currentColor" strokeWidth={2.2} fill="none" transform={`rotate(-15 ${x} ${staffY})`} />
          {isActive && <ellipse cx={x} cy={staffY} rx={10} ry={7} stroke="currentColor" strokeWidth={0.5} fill="none" opacity={0.4} />}
        </g>
      );
    } else if (note.value === "half") {
      elements.push(
        <g key={`n-${i}`} {...groupProps}>
          <ellipse cx={x} cy={staffY} rx={6} ry={4.5} stroke="currentColor" strokeWidth={1.8} fill="none" transform={`rotate(-15 ${x} ${staffY})`} />
          <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
        </g>
      );
    } else if (note.value === "quarter") {
      elements.push(
        <g key={`n-${i}`} {...groupProps}>
          {drawNoteHead(true, x, staffY)}
          <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
        </g>
      );
    } else if (note.value === "eighth") {
      // Check if next note is also eighth → beam them
      const nextIsEighth = i + 1 < notes.length && notes[i + 1].value === "eighth";
      if (nextIsEighth) {
        const x2 = positions[i + 1];
        elements.push(
          <g key={`n-${i}`} {...groupProps}>
            {drawNoteHead(true, x, staffY)}
            {drawNoteHead(true, x2, staffY)}
            <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
            <line x1={x2 + 5.5} y1={staffY} x2={x2 + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
            {/* Beam */}
            <line x1={x + 5.5} y1={staffY - stemH} x2={x2 + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={3} />
            {(isActive || activeIndex === i + 1) && <rect x={x - 8} y={staffY - 8} width={x2 - x + 16} height={16} rx={4} fill="currentColor" opacity={0.1} />}
          </g>
        );
        i++; // skip next since we drew it
      } else {
        // Single eighth with flag
        elements.push(
          <g key={`n-${i}`} {...groupProps}>
            {drawNoteHead(true, x, staffY)}
            <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
            {/* Flag */}
            <path d={`M${x + 5.5},${staffY - stemH} q8,8 4,16`} stroke="currentColor" strokeWidth={1.8} fill="none" />
            {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
          </g>
        );
      }
    } else if (note.value === "sixteenth") {
      // Check for consecutive sixteenths to beam
      let beamCount = 1;
      while (i + beamCount < notes.length && notes[i + beamCount].value === "sixteenth" && beamCount < 4) {
        beamCount++;
      }
      if (beamCount >= 2) {
        const beamNotes = [];
        for (let j = 0; j < beamCount; j++) {
          beamNotes.push({ x: positions[i + j], idx: i + j });
        }
        const firstX = beamNotes[0].x;
        const lastX = beamNotes[beamNotes.length - 1].x;
        elements.push(
          <g key={`n-${i}`} {...groupProps}>
            {beamNotes.map((bn) => (
              <g key={`sn-${bn.idx}`}>
                {drawNoteHead(true, bn.x, staffY)}
                <line x1={bn.x + 5.5} y1={staffY} x2={bn.x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
              </g>
            ))}
            {/* Double beam */}
            <line x1={firstX + 5.5} y1={staffY - stemH} x2={lastX + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={2.5} />
            <line x1={firstX + 5.5} y1={staffY - stemH + 5} x2={lastX + 5.5} y2={staffY - stemH + 5} stroke="currentColor" strokeWidth={2.5} />
            {beamNotes.some(bn => activeIndex === bn.idx) && <rect x={firstX - 8} y={staffY - 8} width={lastX - firstX + 16} height={16} rx={4} fill="currentColor" opacity={0.1} />}
          </g>
        );
        i += beamCount - 1; // skip beamed notes
      } else {
        // Single sixteenth with double flag
        elements.push(
          <g key={`n-${i}`} {...groupProps}>
            {drawNoteHead(true, x, staffY)}
            <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
            <path d={`M${x + 5.5},${staffY - stemH} q8,6 4,14`} stroke="currentColor" strokeWidth={1.8} fill="none" />
            <path d={`M${x + 5.5},${staffY - stemH + 5} q8,6 4,14`} stroke="currentColor" strokeWidth={1.8} fill="none" />
            {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
          </g>
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} 65`}
      className="w-full h-auto"
      data-testid="rhythm-display"
    >
      {elements}
    </svg>
  );
}

function playClick(ctx: AudioContext, freq = 800, vol = 0.4) {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.frequency.value = freq;
  osc.type = "sine";

  gain.gain.setValueAtTime(vol, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

  osc.start(now);
  osc.stop(now + 0.05);
}

const COUNT_IN_BEATS = 4;

export function RhythmTrainer() {
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);
  const [countIn, setCountIn] = useState(-1); // -1 = not counting, 0-3 = count-in beat
  const [soundMode, setSoundMode] = useState<SoundMode>("rhythm");
  const [rhythmSequence, setRhythmSequence] = useState<RhythmNote[]>(() => generateRhythmSequence());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const metronomeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const noteRef = useRef(0);
  const countInRef = useRef(0);
  const rhythmSequenceRef = useRef(rhythmSequence);
  const bpmRef = useRef(bpm);
  const soundModeRef = useRef(soundMode);

  // Keep refs in sync
  rhythmSequenceRef.current = rhythmSequence;
  bpmRef.current = bpm;
  soundModeRef.current = soundMode;

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
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (metronomeRef.current) {
      clearInterval(metronomeRef.current);
      metronomeRef.current = null;
    }
  }, []);

  const startPlayback = useCallback((ctx: AudioContext) => {
    // Start metronome if in metronome mode
    if (soundModeRef.current === "metronome") {
      // Play steady quarter-note clicks
      const tick = () => playClick(ctx, 600, 0.25);
      tick();
      metronomeRef.current = setInterval(tick, 60000 / bpmRef.current);
    }

    const playNextNote = () => {
      const noteIdx = noteRef.current;
      const sequence = rhythmSequenceRef.current;
      const note = sequence[noteIdx];

      setCurrentNote(noteIdx);
      if (soundModeRef.current === "rhythm") {
        playClick(ctx, 800, 0.4);
      }

      const noteDuration = note.beats * (60000 / bpmRef.current);
      noteRef.current = (noteIdx + 1) % sequence.length;

      timeoutRef.current = setTimeout(playNextNote, noteDuration);
    };

    playNextNote();
  }, []);

  const startLoop = useCallback(() => {
    stopLoop();
    const ctx = getOrCreateCtx();

    // Count-in: 4 quarter-note beats
    countInRef.current = 0;
    setCountIn(0);
    setCurrentNote(-1);
    noteRef.current = 0;

    const beatMs = 60000 / bpmRef.current;

    const countInTick = () => {
      const beat = countInRef.current;
      setCountIn(beat);
      // High-pitched count-in click
      playClick(ctx, 1200, 0.5);

      if (beat < COUNT_IN_BEATS - 1) {
        countInRef.current = beat + 1;
        timeoutRef.current = setTimeout(countInTick, beatMs);
      } else {
        // Count-in done, start rhythm
        setCountIn(-1);
        timeoutRef.current = setTimeout(() => startPlayback(ctx), beatMs);
      }
    };

    countInTick();
  }, [getOrCreateCtx, stopLoop, startPlayback]);

  // Restart when BPM changes during playback (only if already past count-in)
  useEffect(() => {
    if (isPlaying && currentNote >= 0) {
      stopLoop();
      const ctx = getOrCreateCtx();
      startPlayback(ctx);
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
      setCurrentNote(-1);
      setCountIn(-1);
      noteRef.current = 0;
    } else {
      setIsPlaying(true);
      startLoop();
    }
  };

  const handleNext = () => {
    noteRef.current = 0;
    setCurrentNote(-1);
    setRhythmSequence(generateRhythmSequence());
    
    if (isPlaying) {
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
          Practice reading random rhythm patterns with musical notation
        </p>
      </div>

      {/* Sound Mode Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex gap-2">
          <Button
            variant={soundMode === "metronome" ? "default" : "outline"}
            size="sm"
            onClick={() => setSoundMode("metronome")}
            data-testid="sound-metronome"
          >
            <Drum className="w-4 h-4 mr-1" /> Metronome
          </Button>
          <Button
            variant={soundMode === "rhythm" ? "default" : "outline"}
            size="sm"
            onClick={() => setSoundMode("rhythm")}
            data-testid="sound-rhythm"
          >
            <Music className="w-4 h-4 mr-1" /> Rhythm
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

      {/* Count-in Display */}
      {countIn >= 0 && (
        <div className="mb-4 text-center" data-testid="count-in">
          <div className="text-5xl font-bold text-primary animate-pulse">
            {countIn + 1}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Count in...</div>
        </div>
      )}

      {/* Rhythm Staff Display */}
      <div className="mb-6 p-4 bg-background border rounded-lg">
        <RhythmStaff notes={rhythmSequence} activeIndex={currentNote} />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 sm:gap-6 text-xs text-muted-foreground mb-8">
        {(["whole", "half", "quarter", "eighth", "sixteenth"] as NoteValue[]).map((v) => (
          <div key={v} className="flex items-center gap-1">
            <span className="font-medium">{NOTE_LABELS[v]}</span>
            <span>({NOTE_BEATS[v]})</span>
          </div>
        ))}
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
