export type NoteRoot = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "A#" | "B";

export type ChordQuality =
  | "major" | "minor" | "7" | "m7" | "maj7"
  | "sus2" | "sus4" | "dim" | "aug" | "add9";

export interface Barre {
  fret: number;
  fromString: number;
  toString: number;
}

export interface ChordDefinition {
  id: string;
  name: string;
  root: NoteRoot;
  quality: ChordQuality;
  position: string;
  strings: [number | null, number | null, number | null, number | null, number | null, number | null];
  fingers: [number | null, number | null, number | null, number | null, number | null, number | null];
  baseFret: number;
  barres?: Barre[];
}

// Helper: E-shape barre major (root on 6th string)
function eShapeMajor(id: string, name: string, root: NoteRoot, fret: number): ChordDefinition {
  return { id, name, root, quality: "major", position: `${fret}fr`,
    strings: [fret, fret, fret + 1, fret + 2, fret + 2, fret],
    fingers: [1, 1, 2, 3, 4, 1], baseFret: fret,
    barres: [{ fret, fromString: 0, toString: 5 }] };
}

// Helper: A-shape barre major (root on 5th string)
function aShapeMajor(id: string, name: string, root: NoteRoot, fret: number): ChordDefinition {
  return { id, name, root, quality: "major", position: `${fret}fr`,
    strings: [null, fret, fret + 2, fret + 2, fret + 2, fret],
    fingers: [null, 1, 2, 3, 4, 1], baseFret: fret,
    barres: [{ fret, fromString: 1, toString: 5 }] };
}

// Helper: E-shape barre minor (root on 6th string)
function eShapeMinor(id: string, name: string, root: NoteRoot, fret: number): ChordDefinition {
  return { id, name, root, quality: "minor", position: `${fret}fr`,
    strings: [fret, fret, fret + 1, fret + 2, fret + 2, fret],
    fingers: [1, 1, 2, 3, 4, 1], baseFret: fret,
    barres: [{ fret, fromString: 0, toString: 5 }] };
}

// Helper: Am-shape barre minor (root on 5th string)
function aShapeMinor(id: string, name: string, root: NoteRoot, fret: number): ChordDefinition {
  return { id, name, root, quality: "minor", position: `${fret}fr`,
    strings: [null, fret, fret + 2, fret + 2, fret + 1, fret],
    fingers: [null, 1, 3, 4, 2, 1], baseFret: fret,
    barres: [{ fret, fromString: 1, toString: 5 }] };
}

// Helper: E7-shape barre (root on 6th string)
function eShape7(id: string, name: string, root: NoteRoot, fret: number): ChordDefinition {
  return { id, name, root, quality: "7", position: `${fret}fr`,
    strings: [fret, fret, fret + 1, fret, fret + 2, fret],
    fingers: [1, 1, 2, 1, 3, 1], baseFret: fret,
    barres: [{ fret, fromString: 0, toString: 5 }] };
}

// Helper: Am7-shape barre (root on 5th string)
function aShapeM7(id: string, name: string, root: NoteRoot, fret: number): ChordDefinition {
  return { id, name, root, quality: "m7", position: `${fret}fr`,
    strings: [null, fret, fret + 2, fret, fret + 1, fret],
    fingers: [null, 1, 3, 1, 2, 1], baseFret: fret,
    barres: [{ fret, fromString: 1, toString: 5 }] };
}

export const CHORDS: ChordDefinition[] = [
  // ══════════════════════════════════════════════════════════
  // MAJOR
  // ══════════════════════════════════════════════════════════

  // C Major
  { id: "C_major", name: "C", root: "C", quality: "major", position: "Open",
    strings: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], baseFret: 1 },
  aShapeMajor("C_major_v2", "C", "C", 3),
  eShapeMajor("C_major_v3", "C", "C", 8),

  // D Major
  { id: "D_major", name: "D", root: "D", quality: "major", position: "Open",
    strings: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
  aShapeMajor("D_major_v2", "D", "D", 5),
  eShapeMajor("D_major_v3", "D", "D", 10),

  // E Major
  { id: "E_major", name: "E", root: "E", quality: "major", position: "Open",
    strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], baseFret: 1 },
  aShapeMajor("E_major_v2", "E", "E", 7),

  // F Major
  { id: "F_major", name: "F", root: "F", quality: "major", position: "1fr",
    strings: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  aShapeMajor("F_major_v2", "F", "F", 8),

  // F# Major
  eShapeMajor("Fs_major", "F#", "F#", 2),
  aShapeMajor("Fs_major_v2", "F#", "F#", 9),

  // G Major
  { id: "G_major", name: "G", root: "G", quality: "major", position: "Open",
    strings: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], baseFret: 1 },
  eShapeMajor("G_major_v2", "G", "G", 3),
  aShapeMajor("G_major_v3", "G", "G", 10),

  // Ab Major
  { id: "Ab_major", name: "Ab", root: "G#", quality: "major", position: "4fr",
    strings: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4,
    barres: [{ fret: 4, fromString: 0, toString: 5 }] },

  // A Major
  { id: "A_major", name: "A", root: "A", quality: "major", position: "Open",
    strings: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  eShapeMajor("A_major_v2", "A", "A", 5),

  // Bb Major
  { id: "Bb_major", name: "Bb", root: "A#", quality: "major", position: "1fr",
    strings: [null, 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 1, toString: 5 }] },
  eShapeMajor("Bb_major_v2", "Bb", "A#", 6),

  // B Major
  { id: "B_major", name: "B", root: "B", quality: "major", position: "2fr",
    strings: [null, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], baseFret: 1,
    barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  eShapeMajor("B_major_v2", "B", "B", 7),

  // Eb Major
  { id: "Eb_major", name: "Eb", root: "D#", quality: "major", position: "3fr",
    strings: [null, null, 5, 3, 4, 3], fingers: [null, null, 3, 1, 2, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 3, toString: 5 }] },
  eShapeMajor("Eb_major_v2", "Eb", "D#", 6),

  // ══════════════════════════════════════════════════════════
  // MINOR
  // ══════════════════════════════════════════════════════════

  // Am
  { id: "Am_minor", name: "Am", root: "A", quality: "minor", position: "Open",
    strings: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], baseFret: 1 },
  eShapeMinor("Am_minor_v2", "Am", "A", 5),

  // Bm
  { id: "Bm_minor", name: "Bm", root: "B", quality: "minor", position: "2fr",
    strings: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], baseFret: 1,
    barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  eShapeMinor("Bm_minor_v2", "Bm", "B", 7),

  // Cm
  { id: "Cm_minor", name: "Cm", root: "C", quality: "minor", position: "3fr",
    strings: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 1, toString: 5 }] },
  eShapeMinor("Cm_minor_v2", "Cm", "C", 8),

  // C#m
  aShapeMinor("Csm_minor", "C#m", "C#", 4),
  eShapeMinor("Csm_minor_v2", "C#m", "C#", 9),

  // Dm
  { id: "Dm_minor", name: "Dm", root: "D", quality: "minor", position: "Open",
    strings: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], baseFret: 1 },
  aShapeMinor("Dm_minor_v2", "Dm", "D", 5),
  eShapeMinor("Dm_minor_v3", "Dm", "D", 10),

  // Em
  { id: "Em_minor", name: "Em", root: "E", quality: "minor", position: "Open",
    strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
  aShapeMinor("Em_minor_v2", "Em", "E", 7),

  // Fm
  { id: "Fm_minor", name: "Fm", root: "F", quality: "minor", position: "1fr",
    strings: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  aShapeMinor("Fm_minor_v2", "Fm", "F", 8),

  // F#m
  eShapeMinor("Fsm_minor", "F#m", "F#", 2),
  aShapeMinor("Fsm_minor_v2", "F#m", "F#", 9),

  // Gm
  { id: "Gm_minor", name: "Gm", root: "G", quality: "minor", position: "3fr",
    strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 0, toString: 5 }] },
  aShapeMinor("Gm_minor_v2", "Gm", "G", 10),

  // G#m
  eShapeMinor("Gsm_minor", "G#m", "G#", 4),

  // Bbm
  eShapeMinor("Bbm_minor", "Bbm", "A#", 6),

  // ══════════════════════════════════════════════════════════
  // DOMINANT 7TH
  // ══════════════════════════════════════════════════════════

  { id: "C7", name: "C7", root: "C", quality: "7", position: "Open",
    strings: [null, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], baseFret: 1 },
  eShape7("C7_v2", "C7", "C", 8),

  { id: "D7", name: "D7", root: "D", quality: "7", position: "Open",
    strings: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], baseFret: 1 },
  eShape7("D7_v2", "D7", "D", 10),

  { id: "E7", name: "E7", root: "E", quality: "7", position: "Open",
    strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], baseFret: 1 },

  { id: "F7", name: "F7", root: "F", quality: "7", position: "1fr",
    strings: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 0, toString: 5 }] },

  { id: "G7", name: "G7", root: "G", quality: "7", position: "Open",
    strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], baseFret: 1 },
  eShape7("G7_v2", "G7", "G", 3),

  { id: "A7", name: "A7", root: "A", quality: "7", position: "Open",
    strings: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], baseFret: 1 },
  eShape7("A7_v2", "A7", "A", 5),

  { id: "B7", name: "B7", root: "B", quality: "7", position: "Open",
    strings: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], baseFret: 1 },
  eShape7("B7_v2", "B7", "B", 7),

  // ══════════════════════════════════════════════════════════
  // MINOR 7TH
  // ══════════════════════════════════════════════════════════

  { id: "Am7", name: "Am7", root: "A", quality: "m7", position: "Open",
    strings: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], baseFret: 1 },
  aShapeM7("Am7_v2", "Am7", "A", 5),

  { id: "Em7", name: "Em7", root: "E", quality: "m7", position: "Open",
    strings: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], baseFret: 1 },

  { id: "Dm7", name: "Dm7", root: "D", quality: "m7", position: "Open",
    strings: [null, null, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], baseFret: 1 },
  aShapeM7("Dm7_v2", "Dm7", "D", 5),

  { id: "Bm7", name: "Bm7", root: "B", quality: "m7", position: "Open",
    strings: [null, 2, 0, 2, 0, 2], fingers: [null, 2, null, 3, null, 4], baseFret: 1 },
  aShapeM7("Bm7_v2", "Bm7", "B", 7),

  { id: "Gm7", name: "Gm7", root: "G", quality: "m7", position: "3fr",
    strings: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 0, toString: 5 }] },

  { id: "Cm7", name: "Cm7", root: "C", quality: "m7", position: "3fr",
    strings: [null, 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 1, toString: 5 }] },
  aShapeM7("Cm7_v2", "Cm7", "C", 8),

  // ══════════════════════════════════════════════════════════
  // MAJOR 7TH
  // ══════════════════════════════════════════════════════════

  { id: "Cmaj7", name: "Cmaj7", root: "C", quality: "maj7", position: "Open",
    strings: [null, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], baseFret: 1 },
  { id: "Dmaj7", name: "Dmaj7", root: "D", quality: "maj7", position: "Open",
    strings: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  { id: "Emaj7", name: "Emaj7", root: "E", quality: "maj7", position: "Open",
    strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], baseFret: 1 },
  { id: "Gmaj7", name: "Gmaj7", root: "G", quality: "maj7", position: "Open",
    strings: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1], baseFret: 1 },
  { id: "Amaj7", name: "Amaj7", root: "A", quality: "maj7", position: "Open",
    strings: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], baseFret: 1 },

  // ══════════════════════════════════════════════════════════
  // SUS2
  // ══════════════════════════════════════════════════════════

  { id: "Asus2", name: "Asus2", root: "A", quality: "sus2", position: "Open",
    strings: [null, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], baseFret: 1 },
  { id: "Dsus2", name: "Dsus2", root: "D", quality: "sus2", position: "Open",
    strings: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null], baseFret: 1 },
  { id: "Esus2", name: "Esus2", root: "E", quality: "sus2", position: "Open",
    strings: [0, 2, 4, 4, 0, 0], fingers: [null, 1, 3, 4, null, null], baseFret: 1 },
  { id: "Gsus2", name: "Gsus2", root: "G", quality: "sus2", position: "Open",
    strings: [3, 0, 0, 0, 3, 3], fingers: [2, null, null, null, 3, 4], baseFret: 1 },

  // ══════════════════════════════════════════════════════════
  // SUS4
  // ══════════════════════════════════════════════════════════

  { id: "Asus4", name: "Asus4", root: "A", quality: "sus4", position: "Open",
    strings: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 4, null], baseFret: 1 },
  { id: "Dsus4", name: "Dsus4", root: "D", quality: "sus4", position: "Open",
    strings: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  { id: "Esus4", name: "Esus4", root: "E", quality: "sus4", position: "Open",
    strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], baseFret: 1 },
  { id: "Gsus4", name: "Gsus4", root: "G", quality: "sus4", position: "Open",
    strings: [3, 3, 0, 0, 1, 3], fingers: [3, 4, null, null, 1, 2], baseFret: 1 },
  { id: "Csus4", name: "Csus4", root: "C", quality: "sus4", position: "Open",
    strings: [null, 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], baseFret: 1 },

  // ══════════════════════════════════════════════════════════
  // DIMINISHED
  // ══════════════════════════════════════════════════════════

  { id: "Bdim", name: "Bdim", root: "B", quality: "dim", position: "Open",
    strings: [null, 2, 3, 4, 3, null], fingers: [null, 1, 2, 4, 3, null], baseFret: 1 },
  { id: "Cdim", name: "Cdim", root: "C", quality: "dim", position: "3fr",
    strings: [null, 3, 4, 5, 4, null], fingers: [null, 1, 2, 4, 3, null], baseFret: 3 },
  { id: "Ddim", name: "Ddim", root: "D", quality: "dim", position: "Open",
    strings: [null, null, 0, 1, 0, 1], fingers: [null, null, null, 1, null, 2], baseFret: 1 },
  { id: "Adim", name: "Adim", root: "A", quality: "dim", position: "Open",
    strings: [null, 0, 1, 2, 1, null], fingers: [null, null, 1, 3, 2, null], baseFret: 1 },
  { id: "Edim", name: "Edim", root: "E", quality: "dim", position: "Open",
    strings: [0, 1, 2, 0, null, null], fingers: [null, 1, 2, null, null, null], baseFret: 1 },

  // ══════════════════════════════════════════════════════════
  // AUGMENTED
  // ══════════════════════════════════════════════════════════

  { id: "Caug", name: "Caug", root: "C", quality: "aug", position: "Open",
    strings: [null, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null], baseFret: 1 },
  { id: "Eaug", name: "Eaug", root: "E", quality: "aug", position: "Open",
    strings: [0, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null], baseFret: 1 },
  { id: "Aaug", name: "Aaug", root: "A", quality: "aug", position: "Open",
    strings: [null, 0, 3, 2, 2, 1], fingers: [null, null, 4, 2, 3, 1], baseFret: 1 },
  { id: "Gaug", name: "Gaug", root: "G", quality: "aug", position: "Open",
    strings: [3, 2, 1, 0, 0, 3], fingers: [4, 3, 2, null, null, 1], baseFret: 1 },

  // ══════════════════════════════════════════════════════════
  // ADD9
  // ══════════════════════════════════════════════════════════

  { id: "Cadd9", name: "Cadd9", root: "C", quality: "add9", position: "Open",
    strings: [null, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], baseFret: 1 },
  { id: "Dadd9", name: "Dadd9", root: "D", quality: "add9", position: "Open",
    strings: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null], baseFret: 1 },
  { id: "Eadd9", name: "Eadd9", root: "E", quality: "add9", position: "Open",
    strings: [0, 2, 2, 1, 0, 2], fingers: [null, 2, 3, 1, null, 4], baseFret: 1 },
  { id: "Gadd9", name: "Gadd9", root: "G", quality: "add9", position: "Open",
    strings: [3, 2, 0, 2, 0, 3], fingers: [3, 2, null, 1, null, 4], baseFret: 1 },
  { id: "Aadd9", name: "Aadd9", root: "A", quality: "add9", position: "Open",
    strings: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
];

export const QUALITY_LABELS: Record<ChordQuality, string> = {
  major: "Major",
  minor: "Minor",
  "7": "Dominant 7th",
  m7: "Minor 7th",
  maj7: "Major 7th",
  sus2: "Sus2",
  sus4: "Sus4",
  dim: "Diminished",
  aug: "Augmented",
  add9: "Add9",
};

export const ALL_ROOTS: NoteRoot[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
export const ALL_QUALITIES: ChordQuality[] = ["major", "minor", "7", "m7", "maj7", "sus2", "sus4", "dim", "aug", "add9"];

// Get only the first/primary voicing for each chord name (used for quiz)
export function getPrimaryChords(): ChordDefinition[] {
  const seen = new Set<string>();
  return CHORDS.filter((chord) => {
    if (seen.has(chord.name)) return false;
    seen.add(chord.name);
    return true;
  });
}
