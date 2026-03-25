import {
  beatsPerMeasure,
  secondsPerBeat,
  clampBpm,
  calcTapTempo,
  MIN_BPM,
  MAX_BPM,
  DEFAULT_BPM,
} from "./metronomeEngine";

describe("metronomeEngine - pure functions", () => {
  describe("beatsPerMeasure", () => {
    it("returns 2 for 2/4", () => expect(beatsPerMeasure("2/4")).toBe(2));
    it("returns 3 for 3/4", () => expect(beatsPerMeasure("3/4")).toBe(3));
    it("returns 4 for 4/4", () => expect(beatsPerMeasure("4/4")).toBe(4));
    it("returns 6 for 6/8", () => expect(beatsPerMeasure("6/8")).toBe(6));
  });

  describe("secondsPerBeat", () => {
    it("returns 0.5 for 120 BPM", () => expect(secondsPerBeat(120)).toBe(0.5));
    it("returns 1 for 60 BPM", () => expect(secondsPerBeat(60)).toBe(1));
    it("returns 0.25 for 240 BPM", () => expect(secondsPerBeat(240)).toBe(0.25));
  });

  describe("clampBpm", () => {
    it("clamps below MIN_BPM", () => expect(clampBpm(10)).toBe(MIN_BPM));
    it("clamps above MAX_BPM", () => expect(clampBpm(500)).toBe(MAX_BPM));
    it("rounds to nearest integer", () => expect(clampBpm(120.7)).toBe(121));
    it("passes through valid values", () => expect(clampBpm(100)).toBe(100));
  });

  describe("calcTapTempo", () => {
    it("returns null with fewer than 2 taps", () => {
      expect(calcTapTempo([])).toBeNull();
      expect(calcTapTempo([1000])).toBeNull();
    });

    it("calculates 120 BPM from 500ms intervals", () => {
      const taps = [0, 500, 1000, 1500];
      expect(calcTapTempo(taps)).toBe(120);
    });

    it("calculates 60 BPM from 1000ms intervals", () => {
      const taps = [0, 1000, 2000];
      expect(calcTapTempo(taps)).toBe(60);
    });

    it("uses only last 5 taps", () => {
      // First taps are slow (1s), last 5 taps are fast (500ms)
      const taps = [0, 1000, 2000, 3000, 3500, 4000, 4500, 5000];
      // Last 5: [3000, 3500, 4000, 4500, 5000] → 500ms avg → 120 BPM
      expect(calcTapTempo(taps)).toBe(120);
    });

    it("clamps result to valid BPM range", () => {
      // Very fast taps → would exceed MAX_BPM
      const taps = [0, 50, 100];
      expect(calcTapTempo(taps)).toBe(MAX_BPM);
    });
  });

  describe("constants", () => {
    it("has sensible defaults", () => {
      expect(MIN_BPM).toBe(30);
      expect(MAX_BPM).toBe(300);
      expect(DEFAULT_BPM).toBe(120);
    });
  });
});
