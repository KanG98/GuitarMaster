"use client";

import { useState, useCallback } from "react";
import { Play, RotateCcw, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizState } from "@/hooks/useQuizState";
import {
  ALL_KEYS,
  DEGREE_INTERVALS,
  ALL_INTERVALS,
  getRandomDegree,
  getChordForKeyAndDegree,
  generateDistractors,
  type KeyName,
  type QuizMode,
} from "@/lib/diatonicData";

interface ChordQuestion {
  mode: "chords";
  degree: string;
  quality: string;
  correctAnswer: string;
  options: string[];
}

interface IntervalQuestion {
  mode: "intervals";
  chord: string;
  degree: string;
  correctAnswer: string;
  options: string[];
}

type QuestionData = ChordQuestion | IntervalQuestion;

interface FeedbackData {
  type: "correct" | "wrong";
  correctAnswer: string;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function DiatonicQuiz() {
  const { quizState, setQuizState, stats, startQuiz, resetQuiz, recordAnswer } = useQuizState();
  const [selectedKey, setSelectedKey] = useState<KeyName>("C");
  const [quizMode, setQuizMode] = useState<QuizMode>("chords");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const generateQuestion = useCallback((key: KeyName, mode: QuizMode): QuestionData => {
    const degree = getRandomDegree();
    const entry = getChordForKeyAndDegree(key, degree);

    if (mode === "intervals") {
      const correctInterval = DEGREE_INTERVALS[degree];
      const wrongIntervals = ALL_INTERVALS.filter(i => i !== correctInterval);
      const distractors = shuffleArray(wrongIntervals).slice(0, 3);
      return {
        mode: "intervals",
        chord: entry.chord,
        degree,
        correctAnswer: correctInterval,
        options: shuffleArray([correctInterval, ...distractors]),
      };
    }

    const distractors = generateDistractors(key, entry.chord, 3);
    return {
      mode: "chords",
      degree,
      quality: entry.quality,
      correctAnswer: entry.chord,
      options: shuffleArray([entry.chord, ...distractors]),
    };
  }, []);

  const handleStart = useCallback(() => {
    startQuiz();
    const question = generateQuestion(selectedKey, quizMode);
    setCurrentQuestion(question);
    setFeedback(null);
    setQuizState("playing");
  }, [selectedKey, quizMode, startQuiz, setQuizState, generateQuestion]);

  const handleReset = useCallback(() => {
    resetQuiz();
    setCurrentQuestion(null);
    setFeedback(null);
  }, [resetQuiz]);

  const switchMode = (mode: QuizMode) => {
    if (mode === quizMode) return;
    setQuizMode(mode);
    if (quizState !== "idle") handleReset();
  };

  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (!currentQuestion || quizState !== "playing") return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    recordAnswer(isCorrect);

    setFeedback({
      type: isCorrect ? "correct" : "wrong",
      correctAnswer: currentQuestion.correctAnswer,
    });
    setQuizState("feedback");

    setTimeout(() => {
      const nextQuestion = generateQuestion(selectedKey, quizMode);
      setCurrentQuestion(nextQuestion);
      setFeedback(null);
      setQuizState("playing");
    }, 1500);
  }, [currentQuestion, quizState, recordAnswer, setQuizState, selectedKey, quizMode, generateQuestion]);

  const getPromptText = () => {
    if (quizState === "idle") return "Ready to test your diatonic chord knowledge?";
    if (!currentQuestion) return "Generating question...";

    if (currentQuestion.mode === "intervals") {
      return `What notes compose the <strong>${currentQuestion.chord}</strong> chord? (${currentQuestion.degree})`;
    }

    return `What is the <strong>${currentQuestion.degree}</strong> (${currentQuestion.quality}) chord in the key of <strong>${selectedKey}</strong>?`;
  };

  const getOptionClass = (option: string) => {
    if (quizState !== "feedback" || !feedback) return "";
    if (option === feedback.correctAnswer) return "bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-500 dark:text-emerald-200";
    return "";
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Music className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Diatonic Chord Quiz</h1>
        </div>
        <p className="text-muted-foreground">
          Test your knowledge of diatonic chords in different keys
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 justify-center">
        <Button
          variant={quizMode === "chords" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("chords")}
          data-testid="mode-chords"
        >
          Chords
        </Button>
        <Button
          variant={quizMode === "intervals" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("intervals")}
          data-testid="mode-intervals"
        >
          Intervals
        </Button>
      </div>

      {/* Key Selector */}
      <div className="flex justify-center">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Key:</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value as KeyName)}
            disabled={quizState !== "idle"}
            className="text-sm border rounded-md px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary"
            data-testid="key-selector"
          >
            {ALL_KEYS.map((key) => (
              <option key={key} value={key}>{key}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Quiz Panel */}
      <div className="rounded-lg border bg-muted/30 p-6 space-y-4" data-testid="quiz-panel">
        <p
          className="text-center font-medium text-lg"
          data-testid="quiz-prompt"
          dangerouslySetInnerHTML={{ __html: getPromptText() }}
        />

        <div className="flex justify-center">
          <Button
            size="sm"
            onClick={quizState === "idle" ? handleStart : handleReset}
            data-testid="start-btn"
            className="active:scale-90 transition-transform duration-150"
          >
            {quizState === "idle" ? (
              <><Play className="h-3 w-3 mr-1" /> Start Quiz</>
            ) : (
              <><RotateCcw className="h-3 w-3 mr-1" /> Reset</>
            )}
          </Button>
        </div>

        {/* Quiz Options */}
        {currentQuestion && quizState !== "idle" && (
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto" data-testid="quiz-options">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={option}
                variant="outline"
                size="lg"
                onClick={() => handleAnswer(option)}
                disabled={quizState !== "playing"}
                data-testid={`quiz-option-${index}`}
                className={`active:scale-95 transition-all duration-150 ${getOptionClass(option)}`}
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex justify-center gap-6 text-sm pt-2">
          <div className="text-center">
            <span className="text-muted-foreground">Score</span>
            <p className="font-semibold" data-testid="score-value">{stats.correct} / {stats.total}</p>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">Streak</span>
            <p className="font-semibold" data-testid="streak-value">{stats.streak}</p>
          </div>
          <div className="text-center">
            <span className="text-muted-foreground">Best</span>
            <p className="font-semibold" data-testid="best-value">{stats.bestStreak}</p>
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`text-center p-4 rounded-lg border ${
            feedback.type === "correct"
              ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200"
              : "bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200"
          }`}
          data-testid="feedback-overlay"
        >
          <p className="font-medium">
            {feedback.type === "correct" ? "✓ Correct!" : "✗ Incorrect"}
          </p>
          {feedback.type === "wrong" && (
            <p className="text-sm mt-1">
              The correct answer was: <strong>{feedback.correctAnswer}</strong>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
