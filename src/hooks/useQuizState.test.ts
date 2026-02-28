import { renderHook, act } from "@testing-library/react";
import { useQuizState } from "./useQuizState";

describe("useQuizState", () => {
  it("should initialize with idle state and zero stats", () => {
    const { result } = renderHook(() => useQuizState());
    
    expect(result.current.quizState).toBe("idle");
    expect(result.current.stats).toEqual({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
  });

  it("should allow state transitions", () => {
    const { result } = renderHook(() => useQuizState());
    
    act(() => {
      result.current.setQuizState("playing");
    });
    
    expect(result.current.quizState).toBe("playing");
  });

  it("should reset all stats when startQuiz is called", () => {
    const { result } = renderHook(() => useQuizState());
    
    // Set some initial values
    act(() => {
      result.current.recordAnswer(true);
      result.current.recordAnswer(false);
    });
    
    expect(result.current.stats.total).toBe(2);
    expect(result.current.stats.correct).toBe(1);
    
    // Start quiz should reset
    act(() => {
      result.current.startQuiz();
    });
    
    expect(result.current.stats).toEqual({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
  });

  it("should record correct answers and update streak", () => {
    const { result } = renderHook(() => useQuizState());
    
    act(() => {
      result.current.recordAnswer(true);
      result.current.recordAnswer(true);
      result.current.recordAnswer(true);
    });
    
    expect(result.current.stats).toEqual({
      correct: 3,
      total: 3,
      streak: 3,
      bestStreak: 3,
    });
  });

  it("should reset streak on wrong answer but keep best streak", () => {
    const { result } = renderHook(() => useQuizState());
    
    act(() => {
      result.current.recordAnswer(true);
      result.current.recordAnswer(true);
      result.current.recordAnswer(false); // Wrong answer
      result.current.recordAnswer(true);
    });
    
    expect(result.current.stats).toEqual({
      correct: 3,
      total: 4,
      streak: 1, // Reset to 1 after wrong answer
      bestStreak: 2, // Preserves the best streak
    });
  });

  it("should reset everything when resetQuiz is called", () => {
    const { result } = renderHook(() => useQuizState());
    
    // Set some state
    act(() => {
      result.current.setQuizState("playing");
      result.current.recordAnswer(true);
    });
    
    // Reset
    act(() => {
      result.current.resetQuiz();
    });
    
    expect(result.current.quizState).toBe("idle");
    expect(result.current.stats).toEqual({
      correct: 0,
      total: 0,
      streak: 0,
      bestStreak: 0,
    });
  });
});