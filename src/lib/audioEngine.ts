const NOTE_FREQUENCIES: Record<string, number> = {
  C: 261.63,
  D: 293.66,
  E: 329.63,
  F: 349.23,
  G: 392.0,
  A: 440.0,
  B: 493.88,
};

const HARMONICS: [number, number][] = [
  [1, 1.0],
  [2, 0.5],
  [3, 0.2],
  [4, 0.05],
];

const ENVELOPE = {
  attack: 0.005,
  decay: 0.3,
  sustain: 0.15,
  release: 1.2,
};

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function init() {
  if (ctx) {
    if (ctx.state === "suspended") ctx.resume();
    return;
  }
  ctx = new AudioContext();
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.5;
  masterGain.connect(ctx.destination);
}

export function playNote(noteName: string): void {
  init();
  const freq = NOTE_FREQUENCIES[noteName];
  if (!freq || !ctx || !masterGain) return;

  const now = ctx.currentTime;
  const { attack, decay, release } = ENVELOPE;
  const duration = attack + decay + release + 0.1;

  const noteGain = ctx.createGain();
  noteGain.connect(masterGain);

  // ADSR envelope
  noteGain.gain.setValueAtTime(0.001, now);
  noteGain.gain.linearRampToValueAtTime(0.8, now + attack);
  noteGain.gain.exponentialRampToValueAtTime(
    Math.max(ENVELOPE.sustain * 0.8, 0.001),
    now + attack + decay
  );
  noteGain.gain.exponentialRampToValueAtTime(
    0.001,
    now + attack + decay + release
  );

  for (const [harmonicNum, amplitude] of HARMONICS) {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq * harmonicNum;

    const partialGain = ctx.createGain();
    partialGain.gain.value = amplitude;

    osc.connect(partialGain);
    partialGain.connect(noteGain);

    osc.start(now);
    osc.stop(now + duration);
  }
}

export const NOTES = ["C", "D", "E", "F", "G", "A", "B"] as const;
export type NoteName = (typeof NOTES)[number];
