/**
 * Metronome Engine — Web Audio API based metronome with accurate scheduling.
 *
 * Uses the "lookahead scheduler" pattern: a setInterval checks frequently
 * and schedules audio events ahead of time for sample-accurate timing.
 */

export type TimeSignature = "2/4" | "3/4" | "4/4" | "6/8";

export interface MetronomeConfig {
  bpm: number;
  timeSignature: TimeSignature;
  volume: number; // 0-1
}

export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const DEFAULT_BPM = 120;

export function beatsPerMeasure(ts: TimeSignature): number {
  switch (ts) {
    case "2/4": return 2;
    case "3/4": return 3;
    case "4/4": return 4;
    case "6/8": return 6;
  }
}

export function secondsPerBeat(bpm: number): number {
  return 60 / bpm;
}

export function clampBpm(bpm: number): number {
  return Math.min(MAX_BPM, Math.max(MIN_BPM, Math.round(bpm)));
}

/**
 * Calculate BPM from an array of tap timestamps (ms).
 * Needs at least 2 taps. Uses average interval of last 4 taps max.
 */
export function calcTapTempo(taps: number[]): number | null {
  if (taps.length < 2) return null;
  const recent = taps.slice(-5); // use last 5 taps (4 intervals)
  let totalInterval = 0;
  for (let i = 1; i < recent.length; i++) {
    totalInterval += recent[i] - recent[i - 1];
  }
  const avgMs = totalInterval / (recent.length - 1);
  if (avgMs <= 0) return null;
  const bpm = 60000 / avgMs;
  return clampBpm(bpm);
}

// ── Audio engine (only runs in browser) ──

const LOOKAHEAD_MS = 25; // how often the scheduler runs
const SCHEDULE_AHEAD_S = 0.1; // how far ahead to schedule

const CLICK_FREQ_ACCENT = 1200;
const CLICK_FREQ_NORMAL = 900;
const CLICK_DURATION = 0.04;

let audioCtx: AudioContext | null = null;
let gainNode: GainNode | null = null;
let timerID: ReturnType<typeof setInterval> | null = null;
let nextNoteTime = 0;
let currentBeat = 0;
let _config: MetronomeConfig = { bpm: DEFAULT_BPM, timeSignature: "4/4", volume: 0.7 };
let _onBeat: ((beat: number) => void) | null = null;
let _isPlaying = false;

function ensureContext() {
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioCtx();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  if (!gainNode) {
    gainNode = audioCtx.createGain();
    gainNode.connect(audioCtx.destination);
  }
  return audioCtx;
}

function scheduleClick(time: number, isAccent: boolean) {
  const ctx = audioCtx!;
  const vol = _config.volume;
  const freq = isAccent ? CLICK_FREQ_ACCENT : CLICK_FREQ_NORMAL;

  // Sharp high-frequency tick
  const oscTick = ctx.createOscillator();
  const envTick = ctx.createGain();
  oscTick.type = "triangle";
  oscTick.frequency.value = freq;
  envTick.gain.setValueAtTime(0, time);
  envTick.gain.linearRampToValueAtTime(vol * 0.7, time + 0.002);
  envTick.gain.exponentialRampToValueAtTime(0.001, time + CLICK_DURATION);
  oscTick.connect(envTick);
  envTick.connect(gainNode!);
  oscTick.start(time);
  oscTick.stop(time + CLICK_DURATION);

  // Body resonance for warmth
  const oscBody = ctx.createOscillator();
  const envBody = ctx.createGain();
  oscBody.type = "triangle";
  oscBody.frequency.setValueAtTime(freq * 0.35, time);
  oscBody.frequency.exponentialRampToValueAtTime(freq * 0.15, time + CLICK_DURATION);
  envBody.gain.setValueAtTime(vol * 0.25, time);
  envBody.gain.exponentialRampToValueAtTime(0.001, time + CLICK_DURATION * 1.5);
  oscBody.connect(envBody);
  envBody.connect(gainNode!);
  oscBody.start(time);
  oscBody.stop(time + CLICK_DURATION * 1.5);
}

function scheduler() {
  const ctx = audioCtx!;
  while (nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
    const isAccent = currentBeat === 0;
    scheduleClick(nextNoteTime, isAccent);
    if (_onBeat) _onBeat(currentBeat);
    nextNoteTime += secondsPerBeat(_config.bpm);
    currentBeat = (currentBeat + 1) % beatsPerMeasure(_config.timeSignature);
  }
}

export function startMetronome(config: MetronomeConfig, onBeat?: (beat: number) => void) {
  _config = { ...config };
  _onBeat = onBeat || null;
  const ctx = ensureContext();
  currentBeat = 0;
  nextNoteTime = ctx.currentTime;
  _isPlaying = true;
  scheduler();
  timerID = setInterval(scheduler, LOOKAHEAD_MS);
}

export function stopMetronome() {
  if (timerID !== null) {
    clearInterval(timerID);
    timerID = null;
  }
  _isPlaying = false;
  _onBeat = null;
}

export function updateMetronomeConfig(config: Partial<MetronomeConfig>) {
  Object.assign(_config, config);
}

export function isMetronomePlaying(): boolean {
  return _isPlaying;
}
