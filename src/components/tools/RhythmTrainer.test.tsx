import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RhythmTrainer } from "./RhythmTrainer";

const mockAudioContext = {
  createOscillator: jest.fn(() => ({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: "sine",
  })),
  createGain: jest.fn(() => ({
    connect: jest.fn(),
    gain: {
      setValueAtTime: jest.fn(),
      exponentialRampToValueAtTime: jest.fn(),
      value: 0,
    },
  })),
  destination: {},
  currentTime: 0,
  state: "running",
  resume: jest.fn(),
  close: jest.fn(),
};

Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
});

jest.useFakeTimers();

describe("RhythmTrainer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.useFakeTimers();
  });

  it("renders two rows of rhythm notation", () => {
    render(<RhythmTrainer />);
    const displays = screen.getAllByTestId("rhythm-display");
    expect(displays.length).toBe(2);
  });

  it("renders all required UI elements", () => {
    render(<RhythmTrainer />);

    expect(screen.getByText("Rhythm Trainer")).toBeInTheDocument();
    expect(screen.getByTestId("bpm-slider")).toBeInTheDocument();
    expect(screen.getByTestId("bpm-input")).toBeInTheDocument();
    expect(screen.getByTestId("play-btn")).toBeInTheDocument();
    expect(screen.getByTestId("next-btn")).toBeInTheDocument();
  });

  it("renders sound mode toggle", () => {
    render(<RhythmTrainer />);

    expect(screen.getByTestId("sound-metronome")).toBeInTheDocument();
    expect(screen.getByTestId("sound-rhythm")).toBeInTheDocument();
  });

  it("displays BPM controls with default value", () => {
    render(<RhythmTrainer />);
    const input = screen.getByTestId("bpm-input");
    expect(input).toHaveValue(80);
  });

  it("changes BPM when input value changes", () => {
    render(<RhythmTrainer />);
    const input = screen.getByTestId("bpm-input");
    fireEvent.change(input, { target: { value: "120" } });
    expect(input).toHaveValue(120);
  });

  it("ignores invalid BPM input values", () => {
    render(<RhythmTrainer />);
    const input = screen.getByTestId("bpm-input");

    fireEvent.change(input, { target: { value: "30" } });
    expect(input).toHaveValue(80);

    fireEvent.change(input, { target: { value: "250" } });
    expect(input).toHaveValue(80);
  });

  it("toggles play button text between Play and Pause", async () => {
    render(<RhythmTrainer />);
    const playButton = screen.getByTestId("play-btn");
    expect(playButton).toHaveTextContent("Play");

    fireEvent.click(playButton);
    await waitFor(() => {
      expect(playButton).toHaveTextContent("Pause");
    });

    fireEvent.click(playButton);
    await waitFor(() => {
      expect(playButton).toHaveTextContent("Play");
    });
  });

  it("generates new pattern when Next button is clicked", () => {
    render(<RhythmTrainer />);
    const nextButton = screen.getByTestId("next-btn");
    fireEvent.click(nextButton);

    const displays = screen.getAllByTestId("rhythm-display");
    expect(displays.length).toBe(2);
  });

  it("shows legend with note types including dotted", () => {
    render(<RhythmTrainer />);

    expect(screen.getByText("Whole")).toBeInTheDocument();
    expect(screen.getByText("Half")).toBeInTheDocument();
    expect(screen.getByText("Half·")).toBeInTheDocument();
    expect(screen.getByText("Quarter")).toBeInTheDocument();
    expect(screen.getByText("Quarter·")).toBeInTheDocument();
    expect(screen.getByText("Eighth")).toBeInTheDocument();
    expect(screen.getByText("Eighth·")).toBeInTheDocument();
    expect(screen.getByText("16th")).toBeInTheDocument();
  });

  it("shows count-in when playing", async () => {
    render(<RhythmTrainer />);
    const playButton = screen.getByTestId("play-btn");
    fireEvent.click(playButton);

    await waitFor(() => {
      expect(screen.getByTestId("count-in")).toBeInTheDocument();
    });
  });

  it("cleans up timers on unmount", () => {
    const { unmount } = render(<RhythmTrainer />);
    const playButton = screen.getByTestId("play-btn");
    fireEvent.click(playButton);

    expect(jest.getTimerCount()).toBeGreaterThan(0);
    unmount();
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);
  });
});
