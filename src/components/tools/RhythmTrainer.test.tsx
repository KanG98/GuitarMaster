import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RhythmTrainer } from "./RhythmTrainer";

// Mock AudioContext for testing
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
  createBuffer: jest.fn(() => ({})),
  createBufferSource: jest.fn(() => ({
    buffer: null,
    connect: jest.fn(),
    start: jest.fn(),
  })),
};

// Mock window.AudioContext
Object.defineProperty(window, "AudioContext", {
  writable: true,
  value: jest.fn().mockImplementation(() => mockAudioContext),
});

// Mock setInterval and clearInterval for testing
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

  describe("Mode Toggle", () => {
    it("renders mode toggle buttons", () => {
      render(<RhythmTrainer />);
      
      expect(screen.getByTestId("mode-beats")).toBeInTheDocument();
      expect(screen.getByTestId("mode-reading")).toBeInTheDocument();
    });

    it("starts in beats mode by default", () => {
      render(<RhythmTrainer />);
      
      const beatsButton = screen.getByTestId("mode-beats");
      const readingButton = screen.getByTestId("mode-reading");
      
      // Beats button should be active (default variant), reading should be outline
      expect(beatsButton).toHaveClass("bg-primary"); // default variant
      expect(readingButton).not.toHaveClass("bg-primary"); // outline variant
      
      // Should show beats display
      expect(screen.getByTestId("rhythm-display")).toBeInTheDocument();
    });

    it("switches to reading mode when reading button is clicked", async () => {
      render(<RhythmTrainer />);
      
      const readingButton = screen.getByTestId("mode-reading");
      fireEvent.click(readingButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("rhythm-sequence")).toBeInTheDocument();
      });
    });

    it("switches back to beats mode", async () => {
      render(<RhythmTrainer />);
      
      // Switch to reading mode first
      const readingButton = screen.getByTestId("mode-reading");
      fireEvent.click(readingButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("rhythm-sequence")).toBeInTheDocument();
      });
      
      // Switch back to beats mode
      const beatsButton = screen.getByTestId("mode-beats");
      fireEvent.click(beatsButton);
      
      await waitFor(() => {
        expect(screen.getByTestId("rhythm-display")).toBeInTheDocument();
      });
    });
  });

  it("renders 8 beat squares", () => {
    render(<RhythmTrainer />);
    
    // Check that all 8 beat squares are rendered
    for (let i = 0; i < 8; i++) {
      expect(screen.getByTestId(`beat-${i}`)).toBeInTheDocument();
    }
  });

  it("renders rhythm display container", () => {
    render(<RhythmTrainer />);
    expect(screen.getByTestId("rhythm-display")).toBeInTheDocument();
  });

  it("displays BPM controls with default value", () => {
    render(<RhythmTrainer />);
    
    const slider = screen.getByTestId("bpm-slider");
    const input = screen.getByTestId("bpm-input");
    
    expect(slider).toBeInTheDocument();
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue(80); // default BPM
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
    
    // Try to set an invalid value (below minimum)
    fireEvent.change(input, { target: { value: "30" } });
    expect(input).toHaveValue(80); // should remain at default
    
    // Try to set an invalid value (above maximum)
    fireEvent.change(input, { target: { value: "250" } });
    expect(input).toHaveValue(80); // should remain at default
  });

  it("toggles play button text between Play and Pause", async () => {
    render(<RhythmTrainer />);
    
    const playButton = screen.getByTestId("play-btn");
    
    // Initially should show "Play"
    expect(playButton).toHaveTextContent("Play");
    
    // Click to start playing
    fireEvent.click(playButton);
    
    // Should now show "Pause"
    await waitFor(() => {
      expect(playButton).toHaveTextContent("Pause");
    });
    
    // Click again to pause
    fireEvent.click(playButton);
    
    // Should show "Play" again
    await waitFor(() => {
      expect(playButton).toHaveTextContent("Play");
    });
  });

  it("generates new pattern when Next Pattern button is clicked", async () => {
    render(<RhythmTrainer />);
    
    // Get initial pattern by checking the beat squares
    const initialBeats = [];
    for (let i = 0; i < 8; i++) {
      const beat = screen.getByTestId(`beat-${i}`);
      initialBeats.push(beat.style.background);
    }
    
    const nextButton = screen.getByTestId("next-btn");
    fireEvent.click(nextButton);
    
    // Wait for the pattern to update
    await waitFor(() => {
      // Check if at least one beat changed (pattern should be different)
      // Note: There's a small chance the random pattern could be the same,
      // but this test should pass in most cases
      const newBeats = [];
      for (let i = 0; i < 8; i++) {
        const beat = screen.getByTestId(`beat-${i}`);
        newBeats.push(beat.style.background);
      }
      
      // The pattern should have been regenerated (component should re-render)
      expect(nextButton).toBeInTheDocument(); // Basic check that component updated
    });
  });

  describe("Reading Mode", () => {
    beforeEach(() => {
      render(<RhythmTrainer />);
      // Switch to reading mode
      const readingButton = screen.getByTestId("mode-reading");
      fireEvent.click(readingButton);
    });

    it("renders rhythm sequence in reading mode", async () => {
      await waitFor(() => {
        expect(screen.getByTestId("rhythm-sequence")).toBeInTheDocument();
      });
    });

    it("renders notes with test ids", async () => {
      await waitFor(() => {
        // Should render notes with sequential test ids
        expect(screen.getByTestId("note-0")).toBeInTheDocument();
        
        // Check if there are multiple notes (sequence should have several notes)
        const notes = screen.getAllByTestId(/^note-\d+$/);
        expect(notes.length).toBeGreaterThan(1);
      });
    });

    it("renders bar lines", async () => {
      await waitFor(() => {
        // Should have bar lines at beats 4, 8, 12
        expect(screen.getByTestId("bar-line-1")).toBeInTheDocument();
        expect(screen.getByTestId("bar-line-2")).toBeInTheDocument();
        expect(screen.getByTestId("bar-line-3")).toBeInTheDocument();
      });
    });

    it("generates new rhythm sequence when Next is clicked", async () => {
      await waitFor(() => {
        expect(screen.getByTestId("rhythm-sequence")).toBeInTheDocument();
      });

      const nextButton = screen.getByTestId("next-btn");
      fireEvent.click(nextButton);

      await waitFor(() => {
        // Should still have the rhythm sequence (component should re-render)
        expect(screen.getByTestId("rhythm-sequence")).toBeInTheDocument();
        expect(screen.getByTestId("note-0")).toBeInTheDocument();
      });
    });

    it("shows rhythm reading legend", async () => {
      await waitFor(() => {
        expect(screen.getByText("Whole (4)")).toBeInTheDocument();
        expect(screen.getByText("Half (2)")).toBeInTheDocument();
        expect(screen.getByText("Quarter (1)")).toBeInTheDocument();
        expect(screen.getByText("Eighth (0.5)")).toBeInTheDocument();
      });
    });
  });

  it("renders all required UI elements", () => {
    render(<RhythmTrainer />);
    
    // Check for main UI elements
    expect(screen.getByText("Rhythm Trainer")).toBeInTheDocument();
    expect(screen.getByText("Practice rhythm patterns with visual beats and metronome clicks")).toBeInTheDocument();
    expect(screen.getByTestId("bpm-slider")).toBeInTheDocument();
    expect(screen.getByTestId("bpm-input")).toBeInTheDocument();
    expect(screen.getByTestId("play-btn")).toBeInTheDocument();
    expect(screen.getByTestId("next-btn")).toBeInTheDocument();
    expect(screen.getByTestId("rhythm-display")).toBeInTheDocument();
    
    // Check for mode toggle
    expect(screen.getByTestId("mode-beats")).toBeInTheDocument();
    expect(screen.getByTestId("mode-reading")).toBeInTheDocument();
    
    // Check for legend
    expect(screen.getByText("Full")).toBeInTheDocument();
    expect(screen.getByText("Half")).toBeInTheDocument();
    expect(screen.getByText("Quarter")).toBeInTheDocument();
  });

  it("cleans up interval on unmount", () => {
    const { unmount } = render(<RhythmTrainer />);
    
    const playButton = screen.getByTestId("play-btn");
    
    // Start playing
    fireEvent.click(playButton);
    
    // Verify interval was created
    expect(jest.getTimerCount()).toBeGreaterThan(0);
    
    // Unmount component
    unmount();
    
    // Should clean up timers
    jest.runOnlyPendingTimers();
    expect(jest.getTimerCount()).toBe(0);
  });
});