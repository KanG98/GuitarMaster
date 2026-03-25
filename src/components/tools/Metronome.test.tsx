import { render, screen, fireEvent } from "@testing-library/react";
import { Metronome } from "./Metronome";

// Mock the metronome engine
const mockStart = jest.fn();
const mockStop = jest.fn();
const mockUpdate = jest.fn();

jest.mock("@/lib/metronomeEngine", () => ({
  ...jest.requireActual("@/lib/metronomeEngine"),
  startMetronome: (...args: unknown[]) => mockStart(...args),
  stopMetronome: () => mockStop(),
  updateMetronomeConfig: (cfg: unknown) => mockUpdate(cfg),
  isMetronomePlaying: () => false,
}));

describe("Metronome", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with default 120 BPM", () => {
    render(<Metronome />);
    expect(screen.getByTestId("bpm-display")).toHaveTextContent("120");
  });

  it("renders start button", () => {
    render(<Metronome />);
    expect(screen.getByTestId("metronome-toggle")).toBeInTheDocument();
  });

  it("renders time signature selector defaulting to 4/4", () => {
    render(<Metronome />);
    expect(screen.getByTestId("ts-4/4")).toHaveAttribute("data-active", "true");
  });

  it("increases BPM when + button clicked", () => {
    render(<Metronome />);
    const plus = screen.getByTestId("bpm-increase");
    fireEvent.click(plus);
    expect(screen.getByTestId("bpm-display")).toHaveTextContent("121");
  });

  it("decreases BPM when - button clicked", () => {
    render(<Metronome />);
    const minus = screen.getByTestId("bpm-decrease");
    fireEvent.click(minus);
    expect(screen.getByTestId("bpm-display")).toHaveTextContent("119");
  });

  it("does not go below 30 BPM", () => {
    render(<Metronome />);
    const minus = screen.getByTestId("bpm-decrease");
    for (let i = 0; i < 100; i++) fireEvent.click(minus);
    expect(screen.getByTestId("bpm-display")).toHaveTextContent("30");
  });

  it("does not go above 300 BPM", () => {
    render(<Metronome />);
    const plus = screen.getByTestId("bpm-increase");
    for (let i = 0; i < 200; i++) fireEvent.click(plus);
    expect(screen.getByTestId("bpm-display")).toHaveTextContent("300");
  });

  it("changes time signature when clicked", () => {
    render(<Metronome />);
    const ts34 = screen.getByTestId("ts-3/4");
    fireEvent.click(ts34);
    expect(ts34).toHaveAttribute("data-active", "true");
    expect(screen.getByTestId("ts-4/4")).toHaveAttribute("data-active", "false");
  });

  it("calls startMetronome when play is clicked", () => {
    render(<Metronome />);
    fireEvent.click(screen.getByTestId("metronome-toggle"));
    expect(mockStart).toHaveBeenCalledWith(
      expect.objectContaining({ bpm: 120, timeSignature: "4/4" }),
      expect.any(Function)
    );
  });

  it("has a tap tempo button", () => {
    render(<Metronome />);
    expect(screen.getByTestId("tap-tempo")).toBeInTheDocument();
  });

  it("renders beat indicators matching time signature", () => {
    render(<Metronome />);
    const dots = screen.getAllByTestId(/^beat-dot-/);
    expect(dots).toHaveLength(4); // 4/4 default
  });

  it("renders 3 beat indicators for 3/4", () => {
    render(<Metronome />);
    fireEvent.click(screen.getByTestId("ts-3/4"));
    const dots = screen.getAllByTestId(/^beat-dot-/);
    expect(dots).toHaveLength(3);
  });
});
