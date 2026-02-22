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
  strings: [number | null, number | null, number | null, number | null, number | null, number | null];
  fingers: [number | null, number | null, number | null, number | null, number | null, number | null];
  baseFret: number;
  barres?: Barre[];
}

export const CHORDS: ChordDefinition[] = [
  // ── OPEN MAJOR ─────────────────────────────────────────
  { id: "C_major", name: "C", root: "C", quality: "major",
    strings: [null, 3, 2, 0, 1, 0], fingers: [null, 3, 2, null, 1, null], baseFret: 1 },
  { id: "D_major", name: "D", root: "D", quality: "major",
    strings: [null, null, 0, 2, 3, 2], fingers: [null, null, null, 1, 3, 2], baseFret: 1 },
  { id: "E_major", name: "E", root: "E", quality: "major",
    strings: [0, 2, 2, 1, 0, 0], fingers: [null, 2, 3, 1, null, null], baseFret: 1 },
  { id: "G_major", name: "G", root: "G", quality: "major",
    strings: [3, 2, 0, 0, 0, 3], fingers: [2, 1, null, null, null, 3], baseFret: 1 },
  { id: "A_major", name: "A", root: "A", quality: "major",
    strings: [null, 0, 2, 2, 2, 0], fingers: [null, null, 1, 2, 3, null], baseFret: 1 },
  { id: "F_major", name: "F", root: "F", quality: "major",
    strings: [1, 1, 2, 3, 3, 1], fingers: [1, 1, 2, 3, 4, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  { id: "B_major", name: "B", root: "B", quality: "major",
    strings: [null, 2, 4, 4, 4, 2], fingers: [null, 1, 2, 3, 4, 1], baseFret: 1,
    barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  { id: "Bb_major", name: "Bb", root: "A#", quality: "major",
    strings: [null, 1, 3, 3, 3, 1], fingers: [null, 1, 2, 3, 4, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 1, toString: 5 }] },
  { id: "Eb_major", name: "Eb", root: "D#", quality: "major",
    strings: [null, null, 5, 3, 4, 3], fingers: [null, null, 3, 1, 2, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 3, toString: 5 }] },
  { id: "Ab_major", name: "Ab", root: "G#", quality: "major",
    strings: [4, 6, 6, 5, 4, 4], fingers: [1, 3, 4, 2, 1, 1], baseFret: 4,
    barres: [{ fret: 4, fromString: 0, toString: 5 }] },

  // ── OPEN MINOR ─────────────────────────────────────────
  { id: "Am_minor", name: "Am", root: "A", quality: "minor",
    strings: [null, 0, 2, 2, 1, 0], fingers: [null, null, 2, 3, 1, null], baseFret: 1 },
  { id: "Em_minor", name: "Em", root: "E", quality: "minor",
    strings: [0, 2, 2, 0, 0, 0], fingers: [null, 2, 3, null, null, null], baseFret: 1 },
  { id: "Dm_minor", name: "Dm", root: "D", quality: "minor",
    strings: [null, null, 0, 2, 3, 1], fingers: [null, null, null, 2, 3, 1], baseFret: 1 },
  { id: "Bm_minor", name: "Bm", root: "B", quality: "minor",
    strings: [null, 2, 4, 4, 3, 2], fingers: [null, 1, 3, 4, 2, 1], baseFret: 1,
    barres: [{ fret: 2, fromString: 1, toString: 5 }] },
  { id: "Fm_minor", name: "Fm", root: "F", quality: "minor",
    strings: [1, 3, 3, 1, 1, 1], fingers: [1, 3, 4, 1, 1, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 0, toString: 5 }] },
  { id: "Gm_minor", name: "Gm", root: "G", quality: "minor",
    strings: [3, 5, 5, 3, 3, 3], fingers: [1, 3, 4, 1, 1, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 0, toString: 5 }] },
  { id: "Cm_minor", name: "Cm", root: "C", quality: "minor",
    strings: [null, 3, 5, 5, 4, 3], fingers: [null, 1, 3, 4, 2, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 1, toString: 5 }] },

  // ── DOMINANT 7TH ───────────────────────────────────────
  { id: "C7", name: "C7", root: "C", quality: "7",
    strings: [null, 3, 2, 3, 1, 0], fingers: [null, 3, 2, 4, 1, null], baseFret: 1 },
  { id: "D7", name: "D7", root: "D", quality: "7",
    strings: [null, null, 0, 2, 1, 2], fingers: [null, null, null, 2, 1, 3], baseFret: 1 },
  { id: "E7", name: "E7", root: "E", quality: "7",
    strings: [0, 2, 0, 1, 0, 0], fingers: [null, 2, null, 1, null, null], baseFret: 1 },
  { id: "G7", name: "G7", root: "G", quality: "7",
    strings: [3, 2, 0, 0, 0, 1], fingers: [3, 2, null, null, null, 1], baseFret: 1 },
  { id: "A7", name: "A7", root: "A", quality: "7",
    strings: [null, 0, 2, 0, 2, 0], fingers: [null, null, 2, null, 3, null], baseFret: 1 },
  { id: "B7", name: "B7", root: "B", quality: "7",
    strings: [null, 2, 1, 2, 0, 2], fingers: [null, 2, 1, 3, null, 4], baseFret: 1 },
  { id: "F7", name: "F7", root: "F", quality: "7",
    strings: [1, 3, 1, 2, 1, 1], fingers: [1, 3, 1, 2, 1, 1], baseFret: 1,
    barres: [{ fret: 1, fromString: 0, toString: 5 }] },

  // ── MINOR 7TH ──────────────────────────────────────────
  { id: "Am7", name: "Am7", root: "A", quality: "m7",
    strings: [null, 0, 2, 0, 1, 0], fingers: [null, null, 2, null, 1, null], baseFret: 1 },
  { id: "Em7", name: "Em7", root: "E", quality: "m7",
    strings: [0, 2, 0, 0, 0, 0], fingers: [null, 2, null, null, null, null], baseFret: 1 },
  { id: "Dm7", name: "Dm7", root: "D", quality: "m7",
    strings: [null, null, 0, 2, 1, 1], fingers: [null, null, null, 2, 1, 1], baseFret: 1 },
  { id: "Bm7", name: "Bm7", root: "B", quality: "m7",
    strings: [null, 2, 0, 2, 0, 2], fingers: [null, 2, null, 3, null, 4], baseFret: 1 },
  { id: "Gm7", name: "Gm7", root: "G", quality: "m7",
    strings: [3, 5, 3, 3, 3, 3], fingers: [1, 3, 1, 1, 1, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 0, toString: 5 }] },
  { id: "Cm7", name: "Cm7", root: "C", quality: "m7",
    strings: [null, 3, 5, 3, 4, 3], fingers: [null, 1, 3, 1, 2, 1], baseFret: 3,
    barres: [{ fret: 3, fromString: 1, toString: 5 }] },

  // ── MAJOR 7TH ──────────────────────────────────────────
  { id: "Cmaj7", name: "Cmaj7", root: "C", quality: "maj7",
    strings: [null, 3, 2, 0, 0, 0], fingers: [null, 3, 2, null, null, null], baseFret: 1 },
  { id: "Dmaj7", name: "Dmaj7", root: "D", quality: "maj7",
    strings: [null, null, 0, 2, 2, 2], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  { id: "Emaj7", name: "Emaj7", root: "E", quality: "maj7",
    strings: [0, 2, 1, 1, 0, 0], fingers: [null, 3, 1, 2, null, null], baseFret: 1 },
  { id: "Gmaj7", name: "Gmaj7", root: "G", quality: "maj7",
    strings: [3, 2, 0, 0, 0, 2], fingers: [3, 2, null, null, null, 1], baseFret: 1 },
  { id: "Amaj7", name: "Amaj7", root: "A", quality: "maj7",
    strings: [null, 0, 2, 1, 2, 0], fingers: [null, null, 2, 1, 3, null], baseFret: 1 },

  // ── SUS2 ───────────────────────────────────────────────
  { id: "Asus2", name: "Asus2", root: "A", quality: "sus2",
    strings: [null, 0, 2, 2, 0, 0], fingers: [null, null, 1, 2, null, null], baseFret: 1 },
  { id: "Dsus2", name: "Dsus2", root: "D", quality: "sus2",
    strings: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null], baseFret: 1 },
  { id: "Esus2", name: "Esus2", root: "E", quality: "sus2",
    strings: [0, 2, 4, 4, 0, 0], fingers: [null, 1, 3, 4, null, null], baseFret: 1 },
  { id: "Gsus2", name: "Gsus2", root: "G", quality: "sus2",
    strings: [3, 0, 0, 0, 3, 3], fingers: [2, null, null, null, 3, 4], baseFret: 1 },

  // ── SUS4 ───────────────────────────────────────────────
  { id: "Asus4", name: "Asus4", root: "A", quality: "sus4",
    strings: [null, 0, 2, 2, 3, 0], fingers: [null, null, 1, 2, 4, null], baseFret: 1 },
  { id: "Dsus4", name: "Dsus4", root: "D", quality: "sus4",
    strings: [null, null, 0, 2, 3, 3], fingers: [null, null, null, 1, 2, 3], baseFret: 1 },
  { id: "Esus4", name: "Esus4", root: "E", quality: "sus4",
    strings: [0, 2, 2, 2, 0, 0], fingers: [null, 2, 3, 4, null, null], baseFret: 1 },
  { id: "Gsus4", name: "Gsus4", root: "G", quality: "sus4",
    strings: [3, 3, 0, 0, 1, 3], fingers: [3, 4, null, null, 1, 2], baseFret: 1 },
  { id: "Csus4", name: "Csus4", root: "C", quality: "sus4",
    strings: [null, 3, 3, 0, 1, 1], fingers: [null, 3, 4, null, 1, 1], baseFret: 1 },

  // ── DIMINISHED ─────────────────────────────────────────
  { id: "Bdim", name: "Bdim", root: "B", quality: "dim",
    strings: [null, 2, 3, 4, 3, null], fingers: [null, 1, 2, 4, 3, null], baseFret: 1 },
  { id: "Cdim", name: "Cdim", root: "C", quality: "dim",
    strings: [null, 3, 4, 5, 4, null], fingers: [null, 1, 2, 4, 3, null], baseFret: 3 },
  { id: "Ddim", name: "Ddim", root: "D", quality: "dim",
    strings: [null, null, 0, 1, 0, 1], fingers: [null, null, null, 1, null, 2], baseFret: 1 },
  { id: "Adim", name: "Adim", root: "A", quality: "dim",
    strings: [null, 0, 1, 2, 1, null], fingers: [null, null, 1, 3, 2, null], baseFret: 1 },
  { id: "Edim", name: "Edim", root: "E", quality: "dim",
    strings: [0, 1, 2, 0, null, null], fingers: [null, 1, 2, null, null, null], baseFret: 1 },

  // ── AUGMENTED ──────────────────────────────────────────
  { id: "Caug", name: "Caug", root: "C", quality: "aug",
    strings: [null, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null], baseFret: 1 },
  { id: "Eaug", name: "Eaug", root: "E", quality: "aug",
    strings: [0, 3, 2, 1, 1, 0], fingers: [null, 4, 3, 1, 2, null], baseFret: 1 },
  { id: "Aaug", name: "Aaug", root: "A", quality: "aug",
    strings: [null, 0, 3, 2, 2, 1], fingers: [null, null, 4, 2, 3, 1], baseFret: 1 },
  { id: "Gaug", name: "Gaug", root: "G", quality: "aug",
    strings: [3, 2, 1, 0, 0, 3], fingers: [4, 3, 2, null, null, 1], baseFret: 1 },

  // ── ADD9 ───────────────────────────────────────────────
  { id: "Cadd9", name: "Cadd9", root: "C", quality: "add9",
    strings: [null, 3, 2, 0, 3, 0], fingers: [null, 2, 1, null, 3, null], baseFret: 1 },
  { id: "Dadd9", name: "Dadd9", root: "D", quality: "add9",
    strings: [null, null, 0, 2, 3, 0], fingers: [null, null, null, 1, 2, null], baseFret: 1 },
  { id: "Eadd9", name: "Eadd9", root: "E", quality: "add9",
    strings: [0, 2, 2, 1, 0, 2], fingers: [null, 2, 3, 1, null, 4], baseFret: 1 },
  { id: "Gadd9", name: "Gadd9", root: "G", quality: "add9",
    strings: [3, 2, 0, 2, 0, 3], fingers: [3, 2, null, 1, null, 4], baseFret: 1 },
  { id: "Aadd9", name: "Aadd9", root: "A", quality: "add9",
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
