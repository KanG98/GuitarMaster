"use client";

import { ChordDefinition } from "@/lib/chordData";

interface ChordDiagramProps {
  chord: ChordDefinition;
  size?: number;
  showName?: boolean;
  onClick?: () => void;
  className?: string;
  "data-testid"?: string;
}

// SVG layout constants
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

function stringX(i: number): number {
  return GRID_LEFT + i * STRING_SPACING;
}

function fretY(j: number): number {
  return GRID_TOP + j * FRET_SPACING;
}

function dotY(row: number): number {
  return GRID_TOP + (row - 0.5) * FRET_SPACING;
}

export function ChordDiagram({
  chord,
  size = 110,
  showName = true,
  onClick,
  className,
  "data-testid": testId,
}: ChordDiagramProps) {
  const scale = size / SVG_WIDTH;

  return (
    <svg
      viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
      width={size}
      height={size * (SVG_HEIGHT / SVG_WIDTH)}
      onClick={onClick}
      className={className}
      style={onClick ? { cursor: "pointer" } : undefined}
      data-testid={testId}
    >
      {/* Fret lines (horizontal) */}
      {Array.from({ length: NUM_FRETS + 1 }, (_, j) => (
        <line
          key={`fret-${j}`}
          x1={GRID_LEFT}
          y1={fretY(j)}
          x2={GRID_RIGHT}
          y2={fretY(j)}
          stroke="currentColor"
          strokeWidth={j === 0 && chord.baseFret === 1 ? 3.5 : 1}
          strokeOpacity={j === 0 && chord.baseFret === 1 ? 1 : 0.4}
        />
      ))}

      {/* String lines (vertical) */}
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

      {/* Fret position label when baseFret > 1 */}
      {chord.baseFret > 1 && (
        <text
          x={GRID_LEFT - 6}
          y={dotY(1)}
          textAnchor="end"
          dominantBaseline="middle"
          fontSize="9"
          fill="currentColor"
          opacity={0.6}
        >
          {chord.baseFret}fr
        </text>
      )}

      {/* X and O markers above nut */}
      {chord.strings.map((fret, i) => {
        const cx = stringX(i);
        const cy = GRID_TOP - 10;
        if (fret === null) {
          // Muted string — X
          return (
            <text
              key={`marker-${i}`}
              x={cx}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="10"
              fill="currentColor"
              opacity={0.5}
            >
              ×
            </text>
          );
        }
        if (fret === 0) {
          // Open string — O
          return (
            <circle
              key={`marker-${i}`}
              cx={cx}
              cy={cy}
              r={4}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              opacity={0.5}
            />
          );
        }
        return null;
      })}

      {/* Barres (render before dots so dots sit on top) */}
      {chord.barres?.map((barre, idx) => {
        const row = barre.fret - (chord.baseFret - 1);
        if (row < 1 || row > NUM_FRETS) return null;
        const y = dotY(row);
        const x1 = stringX(barre.fromString);
        const x2 = stringX(barre.toString);
        return (
          <rect
            key={`barre-${idx}`}
            x={Math.min(x1, x2) - DOT_RADIUS + 1}
            y={y - DOT_RADIUS + 1}
            width={Math.abs(x2 - x1) + DOT_RADIUS * 2 - 2}
            height={DOT_RADIUS * 2 - 2}
            rx={DOT_RADIUS - 1}
            fill="currentColor"
            opacity={0.85}
          />
        );
      })}

      {/* Finger dots */}
      {chord.strings.map((fret, i) => {
        if (fret === null || fret === 0) return null;
        const row = fret - (chord.baseFret - 1);
        if (row < 1 || row > NUM_FRETS) return null;
        const cx = stringX(i);
        const cy = dotY(row);
        const finger = chord.fingers[i];
        return (
          <g key={`dot-${i}`}>
            <circle cx={cx} cy={cy} r={DOT_RADIUS} fill="currentColor" />
            {finger && (
              <text
                x={cx}
                y={cy + 0.5}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="8"
                fill="white"
                fontWeight="bold"
              >
                {finger}
              </text>
            )}
          </g>
        );
      })}

      {/* Chord name */}
      {showName && (
        <text
          x={SVG_WIDTH / 2}
          y={SVG_HEIGHT - 4}
          textAnchor="middle"
          fontSize="11"
          fontWeight="600"
          fill="currentColor"
        >
          {chord.name}
        </text>
      )}
    </svg>
  );
}
