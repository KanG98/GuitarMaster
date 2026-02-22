import { render, screen, act, fireEvent } from "@testing-library/react";
import { EarTrainer } from "./EarTrainer";

// Mock audio engine
jest.mock("@/lib/audioEngine", () => ({
  playNote: jest.fn(),
  NOTES: ["C", "D", "E", "F", "G", "A", "B"] as const,
}));

import { playNote } from "@/lib/audioEngine";
const mockPlayNote = playNote as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("EarTrainer", () => {
  test("renders piano keyboard with 7 keys", () => {
    render(<EarTrainer />);
    const keyboard = screen.getByTestId("piano-keyboard");
    const keys = keyboard.querySelectorAll("button");
    expect(keys).toHaveLength(7);
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("G")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  test("renders learn, quiz, and interval mode tabs", () => {
    render(<EarTrainer />);
    expect(screen.getByTestId("mode-learn")).toBeInTheDocument();
    expect(screen.getByTestId("mode-quiz")).toBeInTheDocument();
    expect(screen.getByTestId("mode-interval")).toBeInTheDocument();
  });

  test("starts in learn mode with hint text", () => {
    render(<EarTrainer />);
    expect(screen.getByText(/Click a key or press 1–7/)).toBeInTheDocument();
  });

  test("learn mode: clicking key plays note", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByText("A"));
    expect(mockPlayNote).toHaveBeenCalledWith("A");
  });

  test("switching to quiz mode shows quiz panel", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    expect(screen.getByTestId("quiz-panel")).toBeInTheDocument();
    expect(screen.getByTestId("start-btn")).toBeInTheDocument();
  });

  test("quiz: Start button changes to Reset on click", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));

    const startBtn = screen.getByTestId("start-btn");
    expect(startBtn).toHaveTextContent("Start");

    fireEvent.click(startBtn);
    expect(screen.getByTestId("start-btn")).toHaveTextContent("Reset");
  });

  test("quiz: starting plays a note", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));

    expect(mockPlayNote).toHaveBeenCalled();
  });

  test("quiz: score updates on correct answer", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));

    // Wait for "waiting" state
    act(() => { jest.advanceTimersByTime(600); });

    // Find the note that was played
    const playedNote = mockPlayNote.mock.calls[0][0];

    // Click the correct key
    fireEvent.click(screen.getByText(playedNote));

    expect(screen.getByTestId("score-value")).toHaveTextContent("1 / 1");
    expect(screen.getByTestId("streak-value")).toHaveTextContent("1");
  });

  test("quiz: feedback overlay appears on correct answer", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));

    act(() => { jest.advanceTimersByTime(600); });

    const playedNote = mockPlayNote.mock.calls[0][0];
    fireEvent.click(screen.getByText(playedNote));

    expect(screen.getByTestId("feedback-overlay")).toBeInTheDocument();
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  test("quiz: replay button is disabled until waiting state", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));

    const replayBtn = screen.getByTestId("replay-btn");
    expect(replayBtn).toBeDisabled();
  });

  test("quiz: Reset returns to idle state", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));

    // Now it says "Reset"
    fireEvent.click(screen.getByTestId("start-btn"));

    expect(screen.getByTestId("start-btn")).toHaveTextContent("Start");
    expect(screen.getByTestId("quiz-prompt")).toHaveTextContent('Click "Start" to begin!');
  });

  // --- Interval Direction Mode ---
  test("interval: switching shows direction buttons", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-interval"));
    expect(screen.getByTestId("direction-buttons")).toBeInTheDocument();
    expect(screen.getByTestId("dir-up")).toBeInTheDocument();
    expect(screen.getByTestId("dir-down")).toBeInTheDocument();
    // Piano keyboard should not be visible
    expect(screen.queryByTestId("piano-keyboard")).not.toBeInTheDocument();
  });

  test("interval: Start plays two notes", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-interval"));
    fireEvent.click(screen.getByTestId("start-btn"));

    // First note played immediately
    expect(mockPlayNote).toHaveBeenCalledTimes(1);

    // Second note after 600ms
    act(() => { jest.advanceTimersByTime(600); });
    expect(mockPlayNote).toHaveBeenCalledTimes(2);
  });

  test("interval: correct direction answer updates score", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-interval"));
    fireEvent.click(screen.getByTestId("start-btn"));

    // Wait for both notes + waiting state
    act(() => { jest.advanceTimersByTime(1200); });

    // Determine correct direction from played notes
    const note1 = mockPlayNote.mock.calls[0][0];
    const note2 = mockPlayNote.mock.calls[1][0];
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    const correctDir = notes.indexOf(note2) > notes.indexOf(note1) ? "up" : "down";

    fireEvent.click(screen.getByTestId(`dir-${correctDir}`));

    expect(screen.getByTestId("score-value")).toHaveTextContent("1 / 1");
    expect(screen.getByTestId("streak-value")).toHaveTextContent("1");
  });

  test("interval: feedback overlay appears on answer", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-interval"));
    fireEvent.click(screen.getByTestId("start-btn"));

    act(() => { jest.advanceTimersByTime(1200); });

    const note1 = mockPlayNote.mock.calls[0][0];
    const note2 = mockPlayNote.mock.calls[1][0];
    const notes = ["C", "D", "E", "F", "G", "A", "B"];
    const correctDir = notes.indexOf(note2) > notes.indexOf(note1) ? "up" : "down";

    fireEvent.click(screen.getByTestId(`dir-${correctDir}`));

    expect(screen.getByTestId("feedback-overlay")).toBeInTheDocument();
    expect(screen.getByText("Correct!")).toBeInTheDocument();
  });

  test("interval: shows arrow keyboard hint", () => {
    render(<EarTrainer />);
    fireEvent.click(screen.getByTestId("mode-interval"));
    expect(screen.getByText(/arrows to answer/)).toBeInTheDocument();
  });
});
