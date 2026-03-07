export type KeyName = "C" | "C#" | "D" | "D#" | "E" | "F" | "F#" | "G" | "G#" | "A" | "Bb" | "B";

export const ALL_KEYS: KeyName[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B"];

export const DEGREE_LABELS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th"] as const;
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
    { degree: "1st", quality: "Major", chord: "C" },
    { degree: "2nd", quality: "minor", chord: "Dm" },
    { degree: "3rd", quality: "minor", chord: "Em" },
    { degree: "4th", quality: "Major", chord: "F" },
    { degree: "5th", quality: "Major", chord: "G" },
    { degree: "6th", quality: "minor", chord: "Am" },
    { degree: "7th", quality: "dim", chord: "Bdim" },
  ],
  "C#": [
    { degree: "1st", quality: "Major", chord: "C#" },
    { degree: "2nd", quality: "minor", chord: "D#m" },
    { degree: "3rd", quality: "minor", chord: "Fm" },
    { degree: "4th", quality: "Major", chord: "F#" },
    { degree: "5th", quality: "Major", chord: "G#" },
    { degree: "6th", quality: "minor", chord: "A#m" },
    { degree: "7th", quality: "dim", chord: "Cdim" },
  ],
  D: [
    { degree: "1st", quality: "Major", chord: "D" },
    { degree: "2nd", quality: "minor", chord: "Em" },
    { degree: "3rd", quality: "minor", chord: "F#m" },
    { degree: "4th", quality: "Major", chord: "G" },
    { degree: "5th", quality: "Major", chord: "A" },
    { degree: "6th", quality: "minor", chord: "Bm" },
    { degree: "7th", quality: "dim", chord: "C#dim" },
  ],
  "D#": [
    { degree: "1st", quality: "Major", chord: "D#" },
    { degree: "2nd", quality: "minor", chord: "Fm" },
    { degree: "3rd", quality: "minor", chord: "Gm" },
    { degree: "4th", quality: "Major", chord: "G#" },
    { degree: "5th", quality: "Major", chord: "Bb" },
    { degree: "6th", quality: "minor", chord: "Cm" },
    { degree: "7th", quality: "dim", chord: "Ddim" },
  ],
  E: [
    { degree: "1st", quality: "Major", chord: "E" },
    { degree: "2nd", quality: "minor", chord: "F#m" },
    { degree: "3rd", quality: "minor", chord: "G#m" },
    { degree: "4th", quality: "Major", chord: "A" },
    { degree: "5th", quality: "Major", chord: "B" },
    { degree: "6th", quality: "minor", chord: "C#m" },
    { degree: "7th", quality: "dim", chord: "D#dim" },
  ],
  F: [
    { degree: "1st", quality: "Major", chord: "F" },
    { degree: "2nd", quality: "minor", chord: "Gm" },
    { degree: "3rd", quality: "minor", chord: "Am" },
    { degree: "4th", quality: "Major", chord: "Bb" },
    { degree: "5th", quality: "Major", chord: "C" },
    { degree: "6th", quality: "minor", chord: "Dm" },
    { degree: "7th", quality: "dim", chord: "Edim" },
  ],
  "F#": [
    { degree: "1st", quality: "Major", chord: "F#" },
    { degree: "2nd", quality: "minor", chord: "G#m" },
    { degree: "3rd", quality: "minor", chord: "A#m" },
    { degree: "4th", quality: "Major", chord: "B" },
    { degree: "5th", quality: "Major", chord: "C#" },
    { degree: "6th", quality: "minor", chord: "D#m" },
    { degree: "7th", quality: "dim", chord: "Fdim" },
  ],
  G: [
    { degree: "1st", quality: "Major", chord: "G" },
    { degree: "2nd", quality: "minor", chord: "Am" },
    { degree: "3rd", quality: "minor", chord: "Bm" },
    { degree: "4th", quality: "Major", chord: "C" },
    { degree: "5th", quality: "Major", chord: "D" },
    { degree: "6th", quality: "minor", chord: "Em" },
    { degree: "7th", quality: "dim", chord: "F#dim" },
  ],
  "G#": [
    { degree: "1st", quality: "Major", chord: "G#" },
    { degree: "2nd", quality: "minor", chord: "A#m" },
    { degree: "3rd", quality: "minor", chord: "Cm" },
    { degree: "4th", quality: "Major", chord: "C#" },
    { degree: "5th", quality: "Major", chord: "D#" },
    { degree: "6th", quality: "minor", chord: "Fm" },
    { degree: "7th", quality: "dim", chord: "Gdim" },
  ],
  A: [
    { degree: "1st", quality: "Major", chord: "A" },
    { degree: "2nd", quality: "minor", chord: "Bm" },
    { degree: "3rd", quality: "minor", chord: "C#m" },
    { degree: "4th", quality: "Major", chord: "D" },
    { degree: "5th", quality: "Major", chord: "E" },
    { degree: "6th", quality: "minor", chord: "F#m" },
    { degree: "7th", quality: "dim", chord: "G#dim" },
  ],
  Bb: [
    { degree: "1st", quality: "Major", chord: "Bb" },
    { degree: "2nd", quality: "minor", chord: "Cm" },
    { degree: "3rd", quality: "minor", chord: "Dm" },
    { degree: "4th", quality: "Major", chord: "Eb" },
    { degree: "5th", quality: "Major", chord: "F" },
    { degree: "6th", quality: "minor", chord: "Gm" },
    { degree: "7th", quality: "dim", chord: "Adim" },
  ],
  B: [
    { degree: "1st", quality: "Major", chord: "B" },
    { degree: "2nd", quality: "minor", chord: "C#m" },
    { degree: "3rd", quality: "minor", chord: "D#m" },
    { degree: "4th", quality: "Major", chord: "E" },
    { degree: "5th", quality: "Major", chord: "F#" },
    { degree: "6th", quality: "minor", chord: "G#m" },
    { degree: "7th", quality: "dim", chord: "A#dim" },
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