"use client";

import { useState, useCallback } from "react";

export type QuizState = "idle" | "playing" | "waiting" | "feedback";

export interface QuizStats {
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
}

export function useQuizState() {
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const startQuiz = useCallback(() => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
    setQuizState("idle"); // Let caller transition to next state
  }, []);

  const resetQuiz = useCallback(() => {
    setQuizState("idle");
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
  }, []);

  const recordAnswer = useCallback((isCorrect: boolean) => {
    setTotal((p) => p + 1);
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setStreak((p) => {
        const next = p + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }, []);

  const stats: QuizStats = { correct, total, streak, bestStreak };

  return {
    quizState,
    setQuizState,
    stats,
    startQuiz,
    resetQuiz,
    recordAnswer,
  };
}