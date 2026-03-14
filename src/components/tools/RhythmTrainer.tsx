"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, Shuffle, Drum, Music } from "lucide-react";

/* ── Note Types & Generation ── */
type NoteValue =
  | "whole"
  | "half"
  | "half."
  | "quarter"
  | "quarter."
  | "eighth"
  | "eighth."
  | "sixteenth"
  | "rest-whole"
  | "rest-half"
  | "rest-quarter"
  | "rest-eighth"
  | "rest-sixteenth";
type SoundMode = "metronome" | "rhythm";

interface RhythmNote {
  value: NoteValue;
  beats: number;
}

const NOTE_BEATS: Record<NoteValue, number> = {
  whole: 4,
  half: 2,
  "half.": 3,
  quarter: 1,
  "quarter.": 1.5,
  eighth: 0.5,
  "eighth.": 0.75,
  sixteenth: 0.25,
  "rest-whole": 4,
  "rest-half": 2,
  "rest-quarter": 1,
  "rest-eighth": 0.5,
  "rest-sixteenth": 0.25,
};

function isRest(v: NoteValue): boolean {
  return v.startsWith("rest-");
}

// For beaming: is this note sub-beat (eighth or smaller)?
function isBeamable(v: NoteValue): boolean {
  if (isRest(v)) return false;
  return v === "eighth" || v === "eighth." || v === "sixteenth";
}

// How many beams does this note get?
function beamCount(v: NoteValue): number {
  if (v === "sixteenth") return 2;
  return 1; // eighth, eighth.
}

function generateRhythmBar(): RhythmNote[] {
  const notes: RhythmNote[] = [];
  let remaining = 4;

  while (remaining > 0) {
    const possible: NoteValue[] = [];
    if (remaining >= 4) { possible.push("whole"); possible.push("rest-whole"); }
    if (remaining >= 3) possible.push("half.");
    if (remaining >= 2) { possible.push("half"); possible.push("rest-half"); }
    if (remaining >= 1.5) possible.push("quarter.");
    if (remaining >= 1) { possible.push("quarter"); possible.push("rest-quarter"); }
    if (remaining >= 0.75) possible.push("eighth.");
    if (remaining >= 0.5) { possible.push("eighth"); possible.push("rest-eighth"); }
    if (remaining >= 0.25) { possible.push("sixteenth"); possible.push("rest-sixteenth"); }

    const chosen = possible[Math.floor(Math.random() * possible.length)];
    const beats = NOTE_BEATS[chosen];
    notes.push({ value: chosen, beats });
    remaining = Math.round((remaining - beats) * 100) / 100;
  }

  return notes;
}

function generateRhythmSequence(): RhythmNote[] {
  return [
    ...generateRhythmBar(),
    ...generateRhythmBar(),
    ...generateRhythmBar(),
    ...generateRhythmBar(),
  ];
}

/* ── Split notes into rows by bars ── */
function splitIntoBars(notes: RhythmNote[]): RhythmNote[][] {
  const bars: RhythmNote[][] = [];
  let current: RhythmNote[] = [];
  let beats = 0;

  for (const n of notes) {
    current.push(n);
    beats = Math.round((beats + n.beats) * 100) / 100;
    if (Math.abs(beats - 4) < 0.01) {
      bars.push(current);
      current = [];
      beats = 0;
    }
  }
  if (current.length > 0) bars.push(current);
  return bars;
}

/* ── SVG Row Renderer ── */
function drawNoteHead(filled: boolean, cx: number, cy: number, key: string): React.ReactElement {
  if (filled) {
    return (
      <ellipse key={key} cx={cx} cy={cy} rx={6} ry={4.5} fill="currentColor" transform={`rotate(-15 ${cx} ${cy})`} />
    );
  }
  return (
    <ellipse key={key} cx={cx} cy={cy} rx={6} ry={4.5} stroke="currentColor" strokeWidth={1.8} fill="none" transform={`rotate(-15 ${cx} ${cy})`} />
  );
}

function drawDot(cx: number, cy: number, key: string): React.ReactElement {
  return <circle key={key} cx={cx + 10} cy={cy - 2} r={2} fill="currentColor" />;
}

function isDotted(v: NoteValue): boolean {
  return v.endsWith(".");
}

function drawRest(value: NoteValue, cx: number, cy: number, key: string, isActive: boolean): React.ReactElement {
  const color = isActive ? "var(--primary)" : "currentColor";
  const highlight = isActive ? (
    <circle cx={cx} cy={cy} r={10} fill="currentColor" opacity={0.15} />
  ) : null;

  if (value === "rest-whole") {
    // Filled rectangle hanging below line
    return (
      <g key={key} style={{ color }}>
        <rect x={cx - 8} y={cy - 4} width={16} height={6} fill="currentColor" />
        {highlight}
      </g>
    );
  }
  if (value === "rest-half") {
    // Filled rectangle sitting on line
    return (
      <g key={key} style={{ color }}>
        <rect x={cx - 8} y={cy - 2} width={16} height={6} fill="currentColor" />
        {highlight}
      </g>
    );
  }
  if (value === "rest-quarter") {
    // Zigzag shape for quarter rest
    return (
      <g key={key} style={{ color }}>
        <path
          d={`M${cx - 3},${cy - 12} l6,6 l-6,6 l6,6 l-6,6`}
          stroke="currentColor"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {highlight}
      </g>
    );
  }
  if (value === "rest-eighth") {
    // Dot with angled line
    return (
      <g key={key} style={{ color }}>
        <circle cx={cx + 2} cy={cy - 6} r={2.5} fill="currentColor" />
        <line x1={cx + 2} y1={cy - 6} x2={cx - 4} y2={cy + 8} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        {highlight}
      </g>
    );
  }
  // rest-sixteenth: two dots with angled line
  return (
    <g key={key} style={{ color }}>
      <circle cx={cx + 2} cy={cy - 8} r={2.5} fill="currentColor" />
      <circle cx={cx + 4} cy={cy - 2} r={2.5} fill="currentColor" />
      <line x1={cx + 2} y1={cy - 8} x2={cx - 4} y2={cy + 8} stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
      {highlight}
    </g>
  );
}

interface RowProps {
  notes: RhythmNote[];
  globalIndexOffset: number;
  activeIndex: number;
  barLineAfterFirst: boolean; // show bar line between bar 1 and 2
}

function RhythmRow({ notes, globalIndexOffset, activeIndex, barLineAfterFirst }: RowProps) {
  const padding = 20;
  const width = 600;
  const usable = width - padding * 2;
  const staffY = 32;
  const stemH = 28;

  // Even spacing
  const gap = usable / notes.length;
  const positions = notes.map((_, i) => padding + gap * i + gap * 0.35);

  // Bar line position (between 2 bars in this row)
  let barLineX: number | null = null;
  if (barLineAfterFirst) {
    let beats = 0;
    for (let i = 0; i < notes.length; i++) {
      beats = Math.round((beats + notes[i].beats) * 100) / 100;
      if (Math.abs(beats - 4) < 0.01 && i < notes.length - 1) {
        const thisEnd = positions[i] + gap * 0.35;
        const nextStart = positions[i + 1] - gap * 0.15;
        barLineX = (thisEnd + nextStart) / 2;
        break;
      }
    }
  }

  const elements: React.ReactElement[] = [];

  // Bar line
  if (barLineX !== null) {
    elements.push(
      <line key="bar" x1={barLineX} y1={staffY - stemH - 2} x2={barLineX} y2={staffY + 8} stroke="currentColor" strokeWidth={1.2} opacity={0.3} />
    );
  }

  // Collect beamable groups
  const drawn = new Set<number>();

  for (let i = 0; i < notes.length; i++) {
    if (drawn.has(i)) continue;

    const note = notes[i];
    const x = positions[i];
    const gi = globalIndexOffset + i;
    const isActive = activeIndex === gi;
    const color = isActive ? "var(--primary)" : "currentColor";

    // Rests
    if (isRest(note.value)) {
      elements.push(drawRest(note.value, x, staffY, `r-${gi}`, isActive));
      drawn.add(i);
      continue;
    }

    // Try to form a beamed group of sub-beat notes
    if (isBeamable(note.value)) {
      // Collect consecutive beamable notes
      const group: { idx: number; x: number; note: RhythmNote; gi: number }[] = [];
      let j = i;
      while (j < notes.length && isBeamable(notes[j].value)) {
        group.push({ idx: j, x: positions[j], note: notes[j], gi: globalIndexOffset + j });
        j++;
      }

      if (group.length >= 2) {
        // Draw beamed group
        const firstX = group[0].x;
        const lastX = group[group.length - 1].x;
        const anyActive = group.some((g) => activeIndex === g.gi);
        const groupColor = anyActive ? "var(--primary)" : "currentColor";

        const groupElems: React.ReactElement[] = [];

        // Noteheads + stems
        for (const g of group) {
          groupElems.push(drawNoteHead(true, g.x, staffY, `nh-${g.gi}`));
          groupElems.push(
            <line key={`st-${g.gi}`} x1={g.x + 5.5} y1={staffY} x2={g.x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          );
          if (isDotted(g.note.value)) {
            groupElems.push(drawDot(g.x, staffY, `dot-${g.gi}`));
          }
          drawn.add(g.idx);
        }

        // Primary beam (all sub-beat notes get at least one beam)
        groupElems.push(
          <line key={`beam1-${gi}`} x1={firstX + 5.5} y1={staffY - stemH} x2={lastX + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={3} />
        );

        // Secondary beam segments for sixteenths
        for (let k = 0; k < group.length; k++) {
          if (beamCount(group[k].note.value) >= 2) {
            // Find consecutive sixteenths in this group
            const sx = group[k].x;
            let endK = k;
            while (endK + 1 < group.length && beamCount(group[endK + 1].note.value) >= 2) {
              endK++;
            }
            if (endK > k) {
              // Full secondary beam across consecutive sixteenths
              const ex = group[endK].x;
              groupElems.push(
                <line key={`beam2-${gi}-${k}`} x1={sx + 5.5} y1={staffY - stemH + 5} x2={ex + 5.5} y2={staffY - stemH + 5} stroke="currentColor" strokeWidth={2.5} />
              );
              k = endK;
            } else {
              // Partial beam (stub) for isolated sixteenth
              const stubDir = k === 0 ? 1 : -1;
              const stubLen = gap * 0.3;
              groupElems.push(
                <line key={`beam2-${gi}-${k}`} x1={sx + 5.5} y1={staffY - stemH + 5} x2={sx + 5.5 + stubDir * stubLen} y2={staffY - stemH + 5} stroke="currentColor" strokeWidth={2.5} />
              );
            }
          }
        }

        // Active highlight
        if (anyActive) {
          groupElems.push(
            <rect key={`hl-${gi}`} x={firstX - 8} y={staffY - 8} width={lastX - firstX + 16} height={16} rx={4} fill="currentColor" opacity={0.1} />
          );
        }

        elements.push(
          <g key={`grp-${gi}`} style={{ color: groupColor }}>
            {groupElems}
          </g>
        );
        continue;
      }
      // Single beamable note — fall through to draw with flag
    }

    drawn.add(i);
    const base = note.value.replace(".", "") as string;

    if (base === "whole") {
      elements.push(
        <g key={`n-${gi}`} style={{ color }}>
          <ellipse cx={x} cy={staffY} rx={8} ry={5.5} stroke="currentColor" strokeWidth={2.2} fill="none" transform={`rotate(-15 ${x} ${staffY})`} />
          {isActive && <ellipse cx={x} cy={staffY} rx={10} ry={7} stroke="currentColor" strokeWidth={0.5} fill="none" opacity={0.4} />}
        </g>
      );
    } else if (base === "half") {
      elements.push(
        <g key={`n-${gi}`} style={{ color }}>
          {drawNoteHead(false, x, staffY, `nh-${gi}`)}
          <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          {isDotted(note.value) && drawDot(x, staffY, `dot-${gi}`)}
          {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
        </g>
      );
    } else if (base === "quarter") {
      elements.push(
        <g key={`n-${gi}`} style={{ color }}>
          {drawNoteHead(true, x, staffY, `nh-${gi}`)}
          <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          {isDotted(note.value) && drawDot(x, staffY, `dot-${gi}`)}
          {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
        </g>
      );
    } else if (base === "eighth") {
      // Single eighth with flag
      elements.push(
        <g key={`n-${gi}`} style={{ color }}>
          {drawNoteHead(true, x, staffY, `nh-${gi}`)}
          <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          <path d={`M${x + 5.5},${staffY - stemH} q8,8 4,16`} stroke="currentColor" strokeWidth={1.8} fill="none" />
          {isDotted(note.value) && drawDot(x, staffY, `dot-${gi}`)}
          {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
        </g>
      );
    } else if (base === "sixteenth") {
      // Single sixteenth with double flag
      elements.push(
        <g key={`n-${gi}`} style={{ color }}>
          {drawNoteHead(true, x, staffY, `nh-${gi}`)}
          <line x1={x + 5.5} y1={staffY} x2={x + 5.5} y2={staffY - stemH} stroke="currentColor" strokeWidth={1.8} />
          <path d={`M${x + 5.5},${staffY - stemH} q8,6 4,14`} stroke="currentColor" strokeWidth={1.8} fill="none" />
          <path d={`M${x + 5.5},${staffY - stemH + 5} q8,6 4,14`} stroke="currentColor" strokeWidth={1.8} fill="none" />
          {isActive && <circle cx={x} cy={staffY} r={10} fill="currentColor" opacity={0.15} />}
        </g>
      );
    }
  }

  return (
    <svg viewBox={`0 0 ${width} 65`} className="w-full h-auto" data-testid="rhythm-display">
      {elements}
    </svg>
  );
}

/* ── Audio ── */
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

/* ── Main Component ── */
export function RhythmTrainer() {
  const [bpm, setBpm] = useState(80);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNote, setCurrentNote] = useState(-1);
  const [countIn, setCountIn] = useState(-1);
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

  rhythmSequenceRef.current = rhythmSequence;
  bpmRef.current = bpm;
  soundModeRef.current = soundMode;

  // Split into 2 rows of 2 bars each
  const bars = splitIntoBars(rhythmSequence);
  const row1Notes = [...(bars[0] || []), ...(bars[1] || [])];
  const row2Notes = [...(bars[2] || []), ...(bars[3] || [])];
  const row1Offset = 0;
  const row2Offset = row1Notes.length;

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
    if (soundModeRef.current === "metronome") {
      const tick = () => playClick(ctx, 600, 0.25);
      tick();
      metronomeRef.current = setInterval(tick, 60000 / bpmRef.current);
    }

    const playNextNote = () => {
      const noteIdx = noteRef.current;
      const sequence = rhythmSequenceRef.current;
      const note = sequence[noteIdx];

      setCurrentNote(noteIdx);
      if (soundModeRef.current === "rhythm" && !isRest(note.value)) {
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

    countInRef.current = 0;
    setCountIn(0);
    setCurrentNote(-1);
    noteRef.current = 0;

    const beatMs = 60000 / bpmRef.current;

    const countInTick = () => {
      const beat = countInRef.current;
      setCountIn(beat);
      playClick(ctx, 1200, 0.5);

      if (beat < COUNT_IN_BEATS - 1) {
        countInRef.current = beat + 1;
        timeoutRef.current = setTimeout(countInTick, beatMs);
      } else {
        setCountIn(-1);
        timeoutRef.current = setTimeout(() => startPlayback(ctx), beatMs);
      }
    };

    countInTick();
  }, [getOrCreateCtx, stopLoop, startPlayback]);

  useEffect(() => {
    if (isPlaying && currentNote >= 0) {
      stopLoop();
      const ctx = getOrCreateCtx();
      startPlayback(ctx);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bpm]);

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

      {/* Rhythm Staff Display — 2 rows */}
      <div className="mb-6 p-4 bg-background border rounded-lg space-y-2">
        {row1Notes.length > 0 && (
          <RhythmRow notes={row1Notes} globalIndexOffset={row1Offset} activeIndex={currentNote} barLineAfterFirst={true} />
        )}
        {row2Notes.length > 0 && (
          <RhythmRow notes={row2Notes} globalIndexOffset={row2Offset} activeIndex={currentNote} barLineAfterFirst={true} />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 sm:gap-5 text-xs text-muted-foreground mb-4">
        {([
          ["Whole", 4],
          ["Half", 2],
          ["Half·", 3],
          ["Quarter", 1],
          ["Quarter·", 1.5],
          ["Eighth", 0.5],
          ["Eighth·", 0.75],
          ["16th", 0.25],
        ] as [string, number][]).map(([label, beats]) => (
          <div key={label} className="flex items-center gap-1">
            <span className="font-medium">{label}</span>
            <span>({beats})</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-3 sm:gap-5 text-xs text-muted-foreground mb-8">
        <span className="font-medium text-muted-foreground/70">Rests:</span>
        {([
          ["Whole", 4],
          ["Half", 2],
          ["Quarter", 1],
          ["Eighth", 0.5],
          ["16th", 0.25],
        ] as [string, number][]).map(([label, beats]) => (
          <div key={`rest-${label}`} className="flex items-center gap-1">
            <span className="font-medium">{label}</span>
            <span>({beats})</span>
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
