export type KeyName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "Bb" | "B";

export const ALL_KEYS: KeyName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

export const DEGREE_LABELS = ["I", "II", "III", "IV", "V", "VI", "VII"] as const;
export type Degree = typeof DEGREE_LABELS[number];

export const DEGREE_QUALITIES = ["Major", "minor", "minor", "Major", "Major", "minor", "dim"] as const;

export interface DiatonicEntry {
  degree: Degree;
  quality: string;
  chord: string;  // e.g. "Dm", "F#dim"
}

// Full diatonic triads for each key
export const DIATONIC_TABLE: Record<KeyName, DiatonicEntry[]> = {
  C: [
    { degree: "I", quality: "Major", chord: "C" },
    { degree: "II", quality: "minor", chord: "Dm" },
    { degree: "III", quality: "minor", chord: "Em" },
    { degree: "IV", quality: "Major", chord: "F" },
    { degree: "V", quality: "Major", chord: "G" },
    { degree: "VI", quality: "minor", chord: "Am" },
    { degree: "VII", quality: "dim", chord: "Bdim" },
  ],
  "C#": [
    { degree: "I", quality: "Major", chord: "C#" },
    { degree: "II", quality: "minor", chord: "D#m" },
    { degree: "III", quality: "minor", chord: "Fm" },
    { degree: "IV", quality: "Major", chord: "F#" },
    { degree: "V", quality: "Major", chord: "G#" },
    { degree: "VI", quality: "minor", chord: "A#m" },
    { degree: "VII", quality: "dim", chord: "Cdim" },
  ],
  D: [
    { degree: "I", quality: "Major", chord: "D" },
    { degree: "II", quality: "minor", chord: "Em" },
    { degree: "III", quality: "minor", chord: "F#m" },
    { degree: "IV", quality: "Major", chord: "G" },
    { degree: "V", quality: "Major", chord: "A" },
    { degree: "VI", quality: "minor", chord: "Bm" },
    { degree: "VII", quality: "dim", chord: "C#dim" },
  ],
  "D#": [
    { degree: "I", quality: "Major", chord: "D#" },
    { degree: "II", quality: "minor", chord: "Fm" },
    { degree: "III", quality: "minor", chord: "Gm" },
    { degree: "IV", quality: "Major", chord: "G#" },
    { degree: "V", quality: "Major", chord: "Bb" },
    { degree: "VI", quality: "minor", chord: "Cm" },
    { degree: "VII", quality: "dim", chord: "Ddim" },
  ],
  E: [
    { degree: "I", quality: "Major", chord: "E" },
    { degree: "II", quality: "minor", chord: "F#m" },
    { degree: "III", quality: "minor", chord: "G#m" },
    { degree: "IV", quality: "Major", chord: "A" },
    { degree: "V", quality: "Major", chord: "B" },
    { degree: "VI", quality: "minor", chord: "C#m" },
    { degree: "VII", quality: "dim", chord: "D#dim" },
  ],
  F: [
    { degree: "I", quality: "Major", chord: "F" },
    { degree: "II", quality: "minor", chord: "Gm" },
    { degree: "III", quality: "minor", chord: "Am" },
    { degree: "IV", quality: "Major", chord: "Bb" },
    { degree: "V", quality: "Major", chord: "C" },
    { degree: "VI", quality: "minor", chord: "Dm" },
    { degree: "VII", quality: "dim", chord: "Edim" },
  ],
  "F#": [
    { degree: "I", quality: "Major", chord: "F#" },
    { degree: "II", quality: "minor", chord: "G#m" },
    { degree: "III", quality: "minor", chord: "A#m" },
    { degree: "IV", quality: "Major", chord: "B" },
    { degree: "V", quality: "Major", chord: "C#" },
    { degree: "VI", quality: "minor", chord: "D#m" },
    { degree: "VII", quality: "dim", chord: "Fdim" },
  ],
  G: [
    { degree: "I", quality: "Major", chord: "G" },
    { degree: "II", quality: "minor", chord: "Am" },
    { degree: "III", quality: "minor", chord: "Bm" },
    { degree: "IV", quality: "Major", chord: "C" },
    { degree: "V", quality: "Major", chord: "D" },
    { degree: "VI", quality: "minor", chord: "Em" },
    { degree: "VII", quality: "dim", chord: "F#dim" },
  ],
  "G#": [
    { degree: "I", quality: "Major", chord: "G#" },
    { degree: "II", quality: "minor", chord: "A#m" },
    { degree: "III", quality: "minor", chord: "Cm" },
    { degree: "IV", quality: "Major", chord: "C#" },
    { degree: "V", quality: "Major", chord: "D#" },
    { degree: "VI", quality: "minor", chord: "Fm" },
    { degree: "VII", quality: "dim", chord: "Gdim" },
  ],
  A: [
    { degree: "I", quality: "Major", chord: "A" },
    { degree: "II", quality: "minor", chord: "Bm" },
    { degree: "III", quality: "minor", chord: "C#m" },
    { degree: "IV", quality: "Major", chord: "D" },
    { degree: "V", quality: "Major", chord: "E" },
    { degree: "VI", quality: "minor", chord: "F#m" },
    { degree: "VII", quality: "dim", chord: "G#dim" },
  ],
  Bb: [
    { degree: "I", quality: "Major", chord: "Bb" },
    { degree: "II", quality: "minor", chord: "Cm" },
    { degree: "III", quality: "minor", chord: "Dm" },
    { degree: "IV", quality: "Major", chord: "Eb" },
    { degree: "V", quality: "Major", chord: "F" },
    { degree: "VI", quality: "minor", chord: "Gm" },
    { degree: "VII", quality: "dim", chord: "Adim" },
  ],
  B: [
    { degree: "I", quality: "Major", chord: "B" },
    { degree: "II", quality: "minor", chord: "C#m" },
    { degree: "III", quality: "minor", chord: "D#m" },
    { degree: "IV", quality: "Major", chord: "E" },
    { degree: "V", quality: "Major", chord: "F#" },
    { degree: "VI", quality: "minor", chord: "G#m" },
    { degree: "VII", quality: "dim", chord: "A#dim" },
  ],
};

// Helper functions for quiz generation
export function getRandomDegree(): Degree {
  return DEGREE_LABELS[Math.floor(Math.random() * DEGREE_LABELS.length)];
}

export function getChordForKeyAndDegree(key: KeyName, degree: Degree): DiatonicEntry {
  const entry = DIATONIC_TABLE[key].find(e => e.degree === degree);
  if (!entry) throw new Error(`Degree ${degree} not found in key ${key}`);
  return entry;
}

export function generateDistractors(key: KeyName, correctChord: string, count: number = 3): string[] {
  const keyChords = DIATONIC_TABLE[key].map(e => e.chord);
  const otherKeys = ALL_KEYS.filter(k => k !== key);
  
  const distractors: string[] = [];
  
  // First, try to get distractors from the same key (other degrees)
  const sameKeyChords = keyChords.filter(chord => chord !== correctChord);
  distractors.push(...sameKeyChords.slice(0, count));
  
  // If we need more distractors, get from other keys
  if (distractors.length < count) {
    const allOtherChords = otherKeys
      .flatMap(k => DIATONIC_TABLE[k].map(e => e.chord))
      .filter(chord => chord !== correctChord && !distractors.includes(chord));
    
    const needed = count - distractors.length;
    const shuffled = allOtherChords.sort(() => Math.random() - 0.5);
    distractors.push(...shuffled.slice(0, needed));
  }
  
  return distractors.slice(0, count);
}