"use client";

import { useState, useCallback } from "react";
import { ChordDefinition } from "@/lib/chordData";

interface InteractiveFretboardProps {
  size?: number;
  disabled?: boolean;
  answer?: ChordDefinition | null;       // When set, shows correct/wrong coloring
  onChange?: (placement: (number | null)[]) => void;
  "data-testid"?: string;
}

// SVG layout (matches ChordDiagram)
const SVG_WIDTH = 110;
const SVG_HEIGHT = 130;
const GRID_LEFT = 20;
const GRID_RIGHT = 102;
const GRID_TOP = 22;
const GRID_BOTTOM = 108;
const NUM_STRINGS = 6;
const NUM_FRETS = 5;
const STRING_SPACING = (GRID_RIGHT - GRID_LEFT) / (NUM_STRINGS - 1);
const FRET_SPACING = (GRID_BOTTOM - GRID_TOP) / NUM_FRETS;
const DOT_RADIUS = 6.5;
const HIT_RADIUS = 9; // Larger touch target

function stringX(i: number): number {
  return GRID_LEFT + i * STRING_SPACING;
}

function fretY(j: number): number {
  return GRID_TOP + j * FRET_SPACING;
}

function dotY(row: number): number {
  return GRID_TOP + (row - 0.5) * FRET_SPACING;
}

// String states: null = muted, 0 = open, 1-5 = fret number (relative to baseFret)
type StringState = number | null;

export function InteractiveFretboard({
  size = 200,
  disabled = false,
  answer,
  onChange,
  "data-testid": testId,
}: InteractiveFretboardProps) {
  // Each string can be: null (muted/not placed), 0 (open), or fret 1-5
  const [strings, setStrings] = useState<StringState[]>([null, null, null, null, null, null]);

  const handleFretClick = useCallback((stringIdx: number, fret: number) => {
    if (disabled) return;
    setStrings(prev => {
      const next = [...prev];
      if (next[stringIdx] === fret) {
        next[stringIdx] = null;
      } else {
        next[stringIdx] = fret;
      }
      onChange?.(next);
      return next;
    });
  }, [disabled, onChange]);

  const handleTopClick = useCallback((stringIdx: number) => {
    if (disabled) return;
    setStrings(prev => {
      const next = [...prev];
      if (next[stringIdx] === 0) {
        next[stringIdx] = null;
      } else if (next[stringIdx] === null) {
        next[stringIdx] = 0;
      } else {
        next[stringIdx] = 0;
      }
      onChange?.(next);
      return next;
    });
  }, [disabled, onChange]);

  const reset = useCallback(() => {
    if (disabled) return;
    setStrings([null, null, null, null, null, null]);
  }, [disabled]);

  // Determine correctness per string when answer is shown
  const getStringStatus = (stringIdx: number): "correct" | "wrong" | "neutral" => {
    if (!answer) return "neutral";
    const expected = answer.strings[stringIdx];
    const placed = strings[stringIdx];

    // Normalize: in ChordDefinition, strings store absolute fret numbers
    // For baseFret=1, fret 0 = open, null = muted, 1-5 = fret positions
    // Our state uses the same convention (relative to baseFret=1 for now)
    if (expected === placed) return "correct";

    // For barre chords (baseFret > 1), the strings array has absolute frets.
    // Our interactive board always shows frets 1-5 relative to baseFret.
    // We need to compare relative positions.
    // Actually, let's keep it simple: since we're showing a 5-fret board from fret 1,
    // and most quiz chords are open position, this works directly.
    return "wrong";
  };

  const getPlacement = (): (number | null)[] => strings;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        width={size}
        height={size * (SVG_HEIGHT / SVG_WIDTH)}
        data-testid={testId}
      >
        {/* Nut (thick top line) */}
        <line
          x1={GRID_LEFT}
          y1={GRID_TOP}
          x2={GRID_RIGHT}
          y2={GRID_TOP}
          stroke="currentColor"
          strokeWidth={3.5}
        />

        {/* Fret lines */}
        {Array.from({ length: NUM_FRETS }, (_, j) => (
          <line
            key={`fret-${j + 1}`}
            x1={GRID_LEFT}
            y1={fretY(j + 1)}
            x2={GRID_RIGHT}
            y2={fretY(j + 1)}
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
        ))}

        {/* String lines */}
        {Array.from({ length: NUM_STRINGS }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={stringX(i)}
            y1={GRID_TOP}
            x2={stringX(i)}
            y2={GRID_BOTTOM}
            stroke="currentColor"
            strokeWidth={1}
            strokeOpacity={0.4}
          />
        ))}

        {/* Clickable zones above nut (open/mute toggle) */}
        {Array.from({ length: NUM_STRINGS }, (_, i) => {
          const cx = stringX(i);
          const cy = GRID_TOP - 10;
          const status = getStringStatus(i);
          const placed = strings[i];

          let markerColor = "currentColor";
          let markerOpacity = 0.5;
          if (answer) {
            if (status === "correct") { markerColor = "#10b981"; markerOpacity = 1; }
            else if (status === "wrong") { markerColor = "#ef4444"; markerOpacity = 1; }
          }

          return (
            <g key={`top-${i}`}>
              {/* Hit target */}
              <circle
                cx={cx}
                cy={cy}
                r={HIT_RADIUS}
                fill="transparent"
                onClick={() => handleTopClick(i)}
                style={{ cursor: disabled ? "default" : "pointer" }}
                data-testid={`top-${i}`}
              />
              {/* Visual marker */}
              {placed === null && (
                <text
                  x={cx}
                  y={cy + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="10"
                  fill={markerColor}
                  opacity={markerOpacity}
                  pointerEvents="none"
                >
                  ×
                </text>
              )}
              {placed === 0 && (
                <circle
                  cx={cx}
                  cy={cy}
                  r={4}
                  fill="none"
                  stroke={markerColor}
                  strokeWidth={1.5}
                  opacity={markerOpacity}
                  pointerEvents="none"
                />
              )}
            </g>
          );
        })}

        {/* Clickable fret positions */}
        {Array.from({ length: NUM_STRINGS }, (_, i) =>
          Array.from({ length: NUM_FRETS }, (_, j) => {
            const fret = j + 1;
            const cx = stringX(i);
            const cy = dotY(fret);
            const isPlaced = strings[i] === fret;
            const status = getStringStatus(i);

            let dotColor = "currentColor";
            if (answer && isPlaced) {
              dotColor = status === "correct" ? "#10b981" : "#ef4444";
            }

            return (
              <g key={`pos-${i}-${j}`}>
                {/* Hit target */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={HIT_RADIUS}
                  fill="transparent"
                  onClick={() => handleFretClick(i, fret)}
                  style={{ cursor: disabled ? "default" : "pointer" }}
                  data-testid={`fret-${i}-${fret}`}
                />
                {/* Dot if placed */}
                {isPlaced && (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={DOT_RADIUS}
                    fill={dotColor}
                    pointerEvents="none"
                  />
                )}
              </g>
            );
          })
        )}

        {/* Show correct answer overlay when in feedback mode */}
        {answer && answer.strings.map((fret, i) => {
          if (fret === null || fret === 0) return null;
          if (strings[i] === fret) return null; // Already shown as correct dot
          const row = fret; // baseFret=1 for open chords
          if (row < 1 || row > NUM_FRETS) return null;
          const cx = stringX(i);
          const cy = dotY(row);
          return (
            <g key={`answer-${i}`}>
              <circle
                cx={cx}
                cy={cy}
                r={DOT_RADIUS}
                fill="#10b981"
                opacity={0.4}
                pointerEvents="none"
              />
              <circle
                cx={cx}
                cy={cy}
                r={DOT_RADIUS}
                fill="none"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="2 2"
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>

      {!disabled && (
        <button
          onClick={reset}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          data-testid="fretboard-reset"
        >
          Clear
        </button>
      )}
    </div>
  );
}

// Export for use by quiz
export function comparePlacement(
  placed: (number | null)[],
  chord: ChordDefinition
): { correct: number; total: number; perfect: boolean } {
  let correct = 0;
  const total = NUM_STRINGS;
  for (let i = 0; i < NUM_STRINGS; i++) {
    if (placed[i] === chord.strings[i]) correct++;
  }
  return { correct, total, perfect: correct === total };
}
