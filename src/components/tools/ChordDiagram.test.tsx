import { render, screen, fireEvent } from "@testing-library/react";
import { ChordDiagram } from "./ChordDiagram";
import { CHORDS } from "@/lib/chordData";

describe("ChordDiagram", () => {
  const cMajor = CHORDS.find((c) => c.id === "C_major")!;
  const fMajor = CHORDS.find((c) => c.id === "F_major")!;
  const abMajor = CHORDS.find((c) => c.id === "Ab_major_v2")!;

  test("renders an SVG element", () => {
    const { container } = render(<ChordDiagram chord={cMajor} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  test("renders 6 vertical string lines", () => {
    const { container } = render(<ChordDiagram chord={cMajor} />);
    const lines = container.querySelectorAll("line");
    const verticals = Array.from(lines).filter(
      (l) => l.getAttribute("x1") === l.getAttribute("x2")
    );
    expect(verticals.length).toBe(6);
  });

  test("renders nut as thick line when baseFret is 1", () => {
    const { container } = render(<ChordDiagram chord={cMajor} />);
    const lines = container.querySelectorAll("line");
    const nutLine = Array.from(lines).find(
      (l) => l.getAttribute("stroke-width") === "3.5"
    );
    expect(nutLine).toBeTruthy();
  });

  test("does NOT render thick nut when baseFret > 1", () => {
    const { container } = render(<ChordDiagram chord={abMajor} />);
    const lines = container.querySelectorAll("line");
    const nutLine = Array.from(lines).find(
      (l) => l.getAttribute("stroke-width") === "3.5"
    );
    expect(nutLine).toBeUndefined();
  });

  test("renders chord name when showName is true (default)", () => {
    render(<ChordDiagram chord={cMajor} />);
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  test("does not render chord name when showName is false", () => {
    render(<ChordDiagram chord={cMajor} showName={false} />);
    // The only "C" would be the chord name text
    const texts = screen.queryAllByText("C");
    expect(texts.length).toBe(0);
  });

  test("renders barre rect for barre chord", () => {
    const { container } = render(<ChordDiagram chord={fMajor} />);
    expect(container.querySelector("rect")).toBeInTheDocument();
  });

  test("renders X markers for muted strings", () => {
    // C major has string 0 (low E) muted
    render(<ChordDiagram chord={cMajor} />);
    expect(screen.getByText("×")).toBeInTheDocument();
  });

  test("renders O markers for open strings", () => {
    // C major has open strings (G and high e)
    const { container } = render(<ChordDiagram chord={cMajor} />);
    const circles = container.querySelectorAll("circle");
    const openCircles = Array.from(circles).filter(
      (c) => c.getAttribute("fill") === "none"
    );
    expect(openCircles.length).toBeGreaterThanOrEqual(2);
  });

  test("renders fret position label when baseFret > 1", () => {
    render(<ChordDiagram chord={abMajor} />);
    expect(screen.getByText("4fr")).toBeInTheDocument();
  });

  test("calls onClick when clicked", () => {
    const mockClick = jest.fn();
    const { container } = render(
      <ChordDiagram chord={cMajor} onClick={mockClick} />
    );
    fireEvent.click(container.querySelector("svg")!);
    expect(mockClick).toHaveBeenCalledTimes(1);
  });

  test("renders finger numbers inside dots", () => {
    // C major has finger 3 on A string, finger 2 on D string, finger 1 on B string
    render(<ChordDiagram chord={cMajor} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});
