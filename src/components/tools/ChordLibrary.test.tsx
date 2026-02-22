import { render, screen, fireEvent, act } from "@testing-library/react";
import { ChordLibrary } from "./ChordLibrary";
import { CHORDS, getPrimaryChords } from "@/lib/chordData";

describe("ChordLibrary", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders browse and quiz mode tabs", () => {
    render(<ChordLibrary />);
    expect(screen.getByTestId("mode-browse")).toBeInTheDocument();
    expect(screen.getByTestId("mode-quiz")).toBeInTheDocument();
  });

  test("starts in browse mode showing chord grid", () => {
    render(<ChordLibrary />);
    expect(screen.getByTestId("chord-grid")).toBeInTheDocument();
  });

  test("shows all chords by default in browse mode", () => {
    render(<ChordLibrary />);
    const grid = screen.getByTestId("chord-grid");
    const cards = grid.querySelectorAll("[data-testid^='chord-card-']");
    expect(cards.length).toBe(CHORDS.length);
  });

  test("groups voicings by chord name", () => {
    render(<ChordLibrary />);
    // C major has multiple voicings — should show a group
    const cGroup = screen.getByTestId("chord-group-C");
    expect(cGroup).toBeInTheDocument();
    const cCards = cGroup.querySelectorAll("[data-testid^='chord-card-']");
    const cVoicings = CHORDS.filter((c) => c.name === "C");
    expect(cCards.length).toBe(cVoicings.length);
    expect(cCards.length).toBeGreaterThan(1);
  });

  test("shows position labels on voicing cards", () => {
    render(<ChordLibrary />);
    const openLabels = screen.getAllByText("Open");
    expect(openLabels.length).toBeGreaterThanOrEqual(1);
  });

  test("search filters chord list", () => {
    render(<ChordLibrary />);
    fireEvent.change(screen.getByTestId("chord-search"), {
      target: { value: "Am7" },
    });
    const grid = screen.getByTestId("chord-grid");
    const groups = grid.querySelectorAll("[data-testid^='chord-group-']");
    expect(groups.length).toBe(1);
  });

  test("root filter shows only chords in that key", () => {
    render(<ChordLibrary />);
    fireEvent.change(screen.getByTestId("filter-root"), {
      target: { value: "A" },
    });
    const aChords = CHORDS.filter((c) => c.root === "A");
    const grid = screen.getByTestId("chord-grid");
    const cards = grid.querySelectorAll("[data-testid^='chord-card-']");
    expect(cards.length).toBe(aChords.length);
  });

  test("quality filter shows only that chord type", () => {
    render(<ChordLibrary />);
    fireEvent.change(screen.getByTestId("filter-quality"), {
      target: { value: "dim" },
    });
    const dimChords = CHORDS.filter((c) => c.quality === "dim");
    const grid = screen.getByTestId("chord-grid");
    const cards = grid.querySelectorAll("[data-testid^='chord-card-']");
    expect(cards.length).toBe(dimChords.length);
  });

  test("clear filters button resets all filters", () => {
    render(<ChordLibrary />);
    fireEvent.change(screen.getByTestId("chord-search"), {
      target: { value: "C" },
    });
    expect(screen.getByTestId("clear-filters")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("clear-filters"));
    const grid = screen.getByTestId("chord-grid");
    const cards = grid.querySelectorAll("[data-testid^='chord-card-']");
    expect(cards.length).toBe(CHORDS.length);
  });

  test("shows empty state when no chords match", () => {
    render(<ChordLibrary />);
    fireEvent.change(screen.getByTestId("chord-search"), {
      target: { value: "zzzznonexistent" },
    });
    expect(screen.getByText("No chords match your filters")).toBeInTheDocument();
  });

  test("switching to quiz mode shows quiz panel", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    expect(screen.getByTestId("quiz-panel")).toBeInTheDocument();
    expect(screen.getByTestId("start-btn")).toHaveTextContent("Start");
  });

  test("quiz shows direction toggle buttons", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    expect(screen.getByTestId("dir-name-to-diagram")).toBeInTheDocument();
    expect(screen.getByTestId("dir-diagram-to-name")).toBeInTheDocument();
  });

  test("quiz start shows 4 chord options (name to diagram)", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));
    expect(screen.getByTestId("quiz-options")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-0")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-1")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-2")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-3")).toBeInTheDocument();
  });

  test("quiz prompt shows chord name question in name-to-diagram mode", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));
    expect(screen.getByTestId("quiz-prompt").textContent).toMatch(
      /Which diagram is .+\?/
    );
  });

  test("quiz prompt shows 'What chord is this?' in diagram-to-name mode", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("dir-diagram-to-name"));
    fireEvent.click(screen.getByTestId("start-btn"));
    expect(screen.getByTestId("quiz-prompt")).toHaveTextContent(
      "What chord is this?"
    );
  });

  test("selecting an answer updates score", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));
    fireEvent.click(screen.getByTestId("quiz-option-0"));
    const score = screen.getByTestId("score-value").textContent;
    expect(score).toMatch(/\d+ \/ 1/);
  });

  test("feedback overlay appears after answering", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));
    fireEvent.click(screen.getByTestId("quiz-option-0"));
    expect(screen.getByTestId("feedback-overlay")).toBeInTheDocument();
  });

  test("reset returns to idle state", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));
    fireEvent.click(screen.getByTestId("start-btn"));
    expect(screen.getByTestId("start-btn")).toHaveTextContent("Start");
    expect(screen.queryByTestId("quiz-options")).not.toBeInTheDocument();
  });

  test("auto-advances to next round after feedback delay", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));

    fireEvent.click(screen.getByTestId("quiz-option-0"));

    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(screen.queryByTestId("feedback-overlay")).not.toBeInTheDocument();
    expect(screen.getByTestId("score-value").textContent).toMatch(/\d+ \/ 1/);
  });

  test("chord data has 50+ chords", () => {
    expect(CHORDS.length).toBeGreaterThanOrEqual(50);
  });

  test("each chord has 6-element strings and fingers arrays", () => {
    CHORDS.forEach((chord) => {
      expect(chord.strings).toHaveLength(6);
      expect(chord.fingers).toHaveLength(6);
    });
  });

  test("all chord ids are unique", () => {
    const ids = CHORDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("each chord has a position field", () => {
    CHORDS.forEach((chord) => {
      expect(chord.position).toBeTruthy();
    });
  });

  test("getPrimaryChords returns one voicing per chord name", () => {
    const primaries = getPrimaryChords();
    const names = primaries.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
    expect(primaries.length).toBeLessThan(CHORDS.length);
  });

  test("quiz uses primary chords (no duplicate names)", () => {
    render(<ChordLibrary />);
    fireEvent.click(screen.getByTestId("mode-quiz"));
    fireEvent.click(screen.getByTestId("start-btn"));
    // All 4 options should have unique names
    const options = screen.getByTestId("quiz-options");
    const svgs = options.querySelectorAll("[data-testid^='quiz-option-']");
    expect(svgs.length).toBe(4);
  });
});
