import { playNote, NOTES } from "./audioEngine";

// Mock Web Audio API
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockConnect = jest.fn();
const mockSetValueAtTime = jest.fn();
const mockLinearRampToValueAtTime = jest.fn();
const mockExponentialRampToValueAtTime = jest.fn();

const mockGainParam = {
  value: 0,
  setValueAtTime: mockSetValueAtTime,
  linearRampToValueAtTime: mockLinearRampToValueAtTime,
  exponentialRampToValueAtTime: mockExponentialRampToValueAtTime,
};

const mockGainNode = {
  gain: mockGainParam,
  connect: mockConnect,
};

const mockOscillator = {
  type: "sine",
  frequency: { value: 0 },
  connect: mockConnect,
  start: mockStart,
  stop: mockStop,
};

Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    currentTime: 0,
    state: "running",
    destination: {},
    resume: jest.fn(),
    createGain: jest.fn(() => ({ ...mockGainNode, gain: { ...mockGainParam } })),
    createOscillator: jest.fn(() => ({ ...mockOscillator, frequency: { value: 0 } })),
  })),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("audioEngine", () => {
  test("NOTES contains C through B", () => {
    expect(NOTES).toEqual(["C", "D", "E", "F", "G", "A", "B"]);
  });

  test("playNote creates oscillators for harmonics", () => {
    playNote("A");
    // 4 harmonics = 4 oscillators created
    expect(mockStart).toHaveBeenCalledTimes(4);
    expect(mockStop).toHaveBeenCalledTimes(4);
  });

  test("playNote does nothing for unknown note", () => {
    playNote("X");
    expect(mockStart).not.toHaveBeenCalled();
  });
});
