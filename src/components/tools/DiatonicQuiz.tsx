"use client";

import { useState, useCallback, useEffect } from "react";
import { Play, RotateCcw, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuizState } from "@/hooks/useQuizState";
import { 
  DIATONIC_TABLE, 
  ALL_KEYS, 
  getRandomDegree, 
  getChordForKeyAndDegree,
  generateDistractors,
  type KeyName, 
  type Degree,
  type DiatonicEntry
} from "@/lib/diatonicData";

interface QuestionData {
  key: KeyName;
  degree: Degree;
  correctAnswer: DiatonicEntry;
  options: string[];
}

interface FeedbackData {
  type: "correct" | "wrong";
  correctAnswer: string;
  selectedAnswer?: string;
}

export function DiatonicQuiz() {
  const { quizState, setQuizState, stats, startQuiz, resetQuiz, recordAnswer } = useQuizState();
  const [selectedKey, setSelectedKey] = useState<KeyName>("C");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  const generateQuestion = useCallback((key: KeyName): QuestionData => {
    const degree = getRandomDegree();
    const correctAnswer = getChordForKeyAndDegree(key, degree);
    const distractors = generateDistractors(key, correctAnswer.chord, 3);
    
    // Shuffle options
    const allOptions = [correctAnswer.chord, ...distractors];
    const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);
    
    return {
      key,
      degree,
      correctAnswer,
      options: shuffledOptions,
    };
  }, []);

  const handleStart = useCallback(() => {
    startQuiz();
    const question = generateQuestion(selectedKey);
    setCurrentQuestion(question);
    setFeedback(null);
    setQuizState("playing");
  }, [selectedKey, startQuiz, setQuizState, generateQuestion]);

  const handleReset = useCallback(() => {
    resetQuiz();
    setCurrentQuestion(null);
    setFeedback(null);
  }, [resetQuiz]);

  const handleAnswer = useCallback((selectedAnswer: string) => {
    if (!currentQuestion || quizState !== "playing") return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer.chord;
    recordAnswer(isCorrect);

    setFeedback({
      type: isCorrect ? "correct" : "wrong",
      correctAnswer: currentQuestion.correctAnswer.chord,
      selectedAnswer,
    });
    setQuizState("feedback");

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      const nextQuestion = generateQuestion(selectedKey);
      setCurrentQuestion(nextQuestion);
      setFeedback(null);
      setQuizState("playing");
    }, 1500);
  }, [currentQuestion, quizState, recordAnswer, setQuizState, selectedKey, generateQuestion]);

  const getPromptText = () => {
    if (quizState === "idle") {
      return "Ready to test your diatonic chord knowledge?";
    }
    
    if (!currentQuestion) {
      return "Generating question...";
    }

    const { key, degree, correctAnswer } = currentQuestion;
    return `What is the **${degree}** (${correctAnswer.quality}) chord in the key of **${key}**?`;
  };

  const getButtonVariant = (option: string) => {
    if (quizState !== "feedback") return "outline";
    
    if (!feedback) return "outline";
    
    // Correct answer is always green
    if (option === feedback.correctAnswer) return "default";
    
    // Wrong selected answer is red
    if (option === feedback.selectedAnswer && feedback.type === "wrong") return "destructive";
    
    return "outline";
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

      {/* Key Selector */}
      <div className="flex justify-center">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Key:</label>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value as KeyName)}
            disabled={quizState !== "idle"}
            className="text-sm border rounded-md px-3 py-2 bg-background outline-none focus:ring-1 focus:ring-primary w-[180px]"
            data-testid="key-selector"
          >
            {ALL_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
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
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {currentQuestion.options.map((option, index) => (
              <Button
                key={option}
                variant={getButtonVariant(option)}
                size="lg"
                onClick={() => handleAnswer(option)}
                disabled={quizState !== "playing"}
                data-testid={`quiz-option-${index}`}
                className="active:scale-95 transition-transform duration-150"
              >
                {option}
              </Button>
            ))}
          </div>
        )}

        {/* Stats Display */}
        <div className="flex justify-center gap-6 text-sm pt-2">
          <div className="text-center">
            <span className="text-muted-foreground">Score</span>
            <p className="font-semibold" data-testid="score-value">
              {stats.correct} / {stats.total}
            </p>
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

      {/* Feedback Overlay */}
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