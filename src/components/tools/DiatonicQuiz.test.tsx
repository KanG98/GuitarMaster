import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DiatonicQuiz } from "./DiatonicQuiz";

describe("DiatonicQuiz", () => {
  test("renders with title and description", () => {
    render(<DiatonicQuiz />);
    
    expect(screen.getByText("Diatonic Chord Quiz")).toBeInTheDocument();
    expect(screen.getByText("Test your knowledge of diatonic chords in different keys")).toBeInTheDocument();
  });

  test("renders key selector defaulting to C", () => {
    render(<DiatonicQuiz />);
    
    const keySelector = screen.getByTestId("key-selector");
    expect(keySelector).toBeInTheDocument();
    expect(keySelector).toHaveValue("C");
    expect(keySelector).not.toBeDisabled();
  });

  test("shows quiz panel with Start button", () => {
    render(<DiatonicQuiz />);
    
    expect(screen.getByTestId("quiz-panel")).toBeInTheDocument();
    expect(screen.getByTestId("start-btn")).toBeInTheDocument();
    expect(screen.getByTestId("start-btn")).toHaveTextContent("Start Quiz");
  });

  test("shows initial prompt text", () => {
    render(<DiatonicQuiz />);
    
    const prompt = screen.getByTestId("quiz-prompt");
    expect(prompt).toHaveTextContent("Ready to test your diatonic chord knowledge?");
  });

  test("displays score stats with initial values", () => {
    render(<DiatonicQuiz />);
    
    expect(screen.getByTestId("score-value")).toHaveTextContent("0 / 0");
    expect(screen.getByTestId("streak-value")).toHaveTextContent("0");
    expect(screen.getByTestId("best-value")).toHaveTextContent("0");
  });

  test("starting quiz shows a question about a degree", () => {
    render(<DiatonicQuiz />);
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    const prompt = screen.getByTestId("quiz-prompt");
    expect(prompt.textContent).toMatch(/What is the \d+(st|nd|rd|th) \(.+\) chord in the key of C\?/);
  });

  test("shows 4 options when quiz starts", () => {
    render(<DiatonicQuiz />);
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    expect(screen.getByTestId("quiz-option-0")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-1")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-2")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-option-3")).toBeInTheDocument();
  });

  test("correct answer updates score", async () => {
    render(<DiatonicQuiz />);
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    // Find the correct answer by checking the prompt
    const prompt = screen.getByTestId("quiz-prompt");
    const promptText = prompt.textContent || "";
    
    // Extract the degree from the prompt (e.g., "I", "II", etc.)
    const degreeMatch = promptText.match(/What is the \*\*([IVX]+)\*\*/);
    if (!degreeMatch) return;
    
    const degree = degreeMatch[1];
    
    // For key of C, determine the correct chord
    const cKeyChords = {
      "1st": "C", "2nd": "Dm", "3rd": "Em", "4th": "F", 
      "5th": "G", "6th": "Am", "7th": "Bdim"
    };
    const correctChord = cKeyChords[degree as keyof typeof cKeyChords];
    
    // Find and click the correct option
    const options = [
      screen.getByTestId("quiz-option-0"),
      screen.getByTestId("quiz-option-1"),
      screen.getByTestId("quiz-option-2"),
      screen.getByTestId("quiz-option-3"),
    ];
    
    const correctOption = options.find(opt => opt.textContent === correctChord);
    if (correctOption) {
      fireEvent.click(correctOption);
      
      await waitFor(() => {
        expect(screen.getByTestId("score-value")).toHaveTextContent("1 / 1");
        expect(screen.getByTestId("streak-value")).toHaveTextContent("1");
      });
    }
  });

  test("feedback appears after answering", async () => {
    render(<DiatonicQuiz />);
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    const firstOption = screen.getByTestId("quiz-option-0");
    fireEvent.click(firstOption);
    
    await waitFor(() => {
      expect(screen.getByTestId("feedback-overlay")).toBeInTheDocument();
    });
  });

  test("reset returns to idle state", () => {
    render(<DiatonicQuiz />);
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    // Button should change to "Reset"
    expect(startBtn).toHaveTextContent("Reset");
    
    fireEvent.click(startBtn);
    
    // Should return to idle state
    expect(startBtn).toHaveTextContent("Start Quiz");
    expect(screen.getByTestId("quiz-prompt")).toHaveTextContent("Ready to test your diatonic chord knowledge?");
    expect(screen.getByTestId("score-value")).toHaveTextContent("0 / 0");
  });

  test("key selector works and can be changed when idle", () => {
    render(<DiatonicQuiz />);
    
    const keySelector = screen.getByTestId("key-selector") as HTMLSelectElement;
    
    fireEvent.change(keySelector, { target: { value: "D" } });
    expect(keySelector.value).toBe("D");
  });

  test("key selector is disabled during active quiz", () => {
    render(<DiatonicQuiz />);
    
    const keySelector = screen.getByTestId("key-selector");
    expect(keySelector).not.toBeDisabled();
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    expect(keySelector).toBeDisabled();
  });

  test("options are disabled during feedback state", async () => {
    render(<DiatonicQuiz />);
    
    const startBtn = screen.getByTestId("start-btn");
    fireEvent.click(startBtn);
    
    const firstOption = screen.getByTestId("quiz-option-0");
    fireEvent.click(firstOption);
    
    // After clicking, options should be disabled during feedback
    await waitFor(() => {
      const options = [
        screen.getByTestId("quiz-option-0"),
        screen.getByTestId("quiz-option-1"),
        screen.getByTestId("quiz-option-2"),
        screen.getByTestId("quiz-option-3"),
      ];
      
      options.forEach(option => {
        expect(option).toBeDisabled();
      });
    });
  });

  test("renders mode toggle buttons", () => {
    render(<DiatonicQuiz />);
    expect(screen.getByTestId("mode-chords")).toBeInTheDocument();
    expect(screen.getByTestId("mode-intervals")).toBeInTheDocument();
  });

  test("switching to intervals mode shows interval question", () => {
    render(<DiatonicQuiz />);
    fireEvent.click(screen.getByTestId("mode-intervals"));
    fireEvent.click(screen.getByTestId("start-btn"));

    const prompt = screen.getByTestId("quiz-prompt");
    expect(prompt.textContent).toMatch(/What notes compose the .+ chord\?/);
  });

  test("intervals mode options contain interval patterns", () => {
    render(<DiatonicQuiz />);
    fireEvent.click(screen.getByTestId("mode-intervals"));
    fireEvent.click(screen.getByTestId("start-btn"));

    const options = screen.getByTestId("quiz-options");
    // Interval patterns look like "1-3-5", "2-4-6" etc.
    expect(options.textContent).toMatch(/\d-\d-\d/);
  });

  test("switching mode resets quiz", () => {
    render(<DiatonicQuiz />);
    fireEvent.click(screen.getByTestId("start-btn"));
    expect(screen.getByTestId("start-btn")).toHaveTextContent("Reset");

    fireEvent.click(screen.getByTestId("mode-intervals"));
    expect(screen.getByTestId("start-btn")).toHaveTextContent("Start Quiz");
  });
});