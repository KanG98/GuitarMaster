"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Play, RotateCcw, Volume2, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playNote, NOTES, NoteName } from "@/lib/audioEngine";

type Mode = "learn" | "quiz" | "interval";
type QuizState = "idle" | "playing" | "waiting" | "feedback";
type Direction = "up" | "down";

interface Feedback {
  type: "correct" | "wrong";
  note: string;
}

const KEY_MAP: Record<string, NoteName> = {
  "1": "C", "2": "D", "3": "E", "4": "F",
  "5": "G", "6": "A", "7": "B",
};

function pickRandomNote(exclude: string | null): NoteName {
  let note: NoteName;
  do {
    note = NOTES[Math.floor(Math.random() * NOTES.length)];
  } while (note === exclude && NOTES.length > 1);
  return note;
}

function pickIntervalPair(): [NoteName, NoteName] {
  const i = Math.floor(Math.random() * NOTES.length);
  let j: number;
  do {
    j = Math.floor(Math.random() * NOTES.length);
  } while (j === i);
  return [NOTES[i], NOTES[j]];
}

export function EarTrainer() {
  const [mode, setMode] = useState<Mode>("learn");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentNote, setCurrentNote] = useState<NoteName | null>(null);
  const [intervalPair, setIntervalPair] = useState<[NoteName, NoteName] | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [flashKeys, setFlashKeys] = useState<Record<string, "correct" | "wrong">>({});
  const [directionFlash, setDirectionFlash] = useState<{ dir: Direction; type: "correct" | "wrong" } | null>(null);

  const quizStateRef = useRef(quizState);
  const currentNoteRef = useRef(currentNote);
  const intervalPairRef = useRef(intervalPair);
  const modeRef = useRef(mode);
  quizStateRef.current = quizState;
  currentNoteRef.current = currentNote;
  intervalPairRef.current = intervalPair;
  modeRef.current = mode;

  const highlightKey = useCallback((note: string) => {
    setActiveKey(note);
    setTimeout(() => setActiveKey(null), 200);
  }, []);

  const flashKey = useCallback((note: string, type: "correct" | "wrong") => {
    setFlashKeys((prev) => ({ ...prev, [note]: type }));
    setTimeout(() => {
      setFlashKeys((prev) => {
        const next = { ...prev };
        delete next[note];
        return next;
      });
    }, 800);
  }, []);

  const flashDirection = useCallback((dir: Direction, type: "correct" | "wrong") => {
    setDirectionFlash({ dir, type });
    setTimeout(() => setDirectionFlash(null), 800);
  }, []);

  const showFeedback = useCallback((isCorrect: boolean, note: string) => {
    setFeedback({ type: isCorrect ? "correct" : "wrong", note });
    setTimeout(() => setFeedback(null), 1000);
  }, []);

  // --- Note Quiz ---
  const nextRound = useCallback(() => {
    setQuizState("playing");
    const note = pickRandomNote(currentNoteRef.current);
    setCurrentNote(note);
    playNote(note);

    setTimeout(() => {
      setQuizState("waiting");
    }, 600);
  }, []);

  const startQuiz = useCallback(() => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
    setCurrentNote(null);
    nextRound();
  }, [nextRound]);

  const resetQuiz = useCallback(() => {
    setQuizState("idle");
    setCurrentNote(null);
    setIntervalPair(null);
  }, []);

  const replay = useCallback(() => {
    if (quizStateRef.current === "waiting" && currentNoteRef.current) {
      playNote(currentNoteRef.current);
    }
  }, []);

  const submitAnswer = useCallback((noteName: NoteName) => {
    if (quizStateRef.current !== "waiting") return;

    setQuizState("feedback");
    const isCorrect = noteName === currentNoteRef.current;

    setTotal((p) => p + 1);
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setStreak((p) => {
        const next = p + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      flashKey(noteName, "correct");
    } else {
      setStreak(0);
      flashKey(noteName, "wrong");
      if (currentNoteRef.current) flashKey(currentNoteRef.current, "correct");
    }

    playNote(currentNoteRef.current!);
    showFeedback(isCorrect, currentNoteRef.current!);

    setTimeout(() => {
      nextRound();
    }, 1200);
  }, [flashKey, showFeedback, nextRound]);

  // --- Interval Direction ---
  const playIntervalPair = useCallback((pair: [NoteName, NoteName]) => {
    playNote(pair[0]);
    setTimeout(() => playNote(pair[1]), 600);
  }, []);

  const nextIntervalRound = useCallback(() => {
    setQuizState("playing");
    const pair = pickIntervalPair();
    setIntervalPair(pair);
    playIntervalPair(pair);

    setTimeout(() => {
      setQuizState("waiting");
    }, 1200);
  }, [playIntervalPair]);

  const startInterval = useCallback(() => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
    setIntervalPair(null);
    nextIntervalRound();
  }, [nextIntervalRound]);

  const replayInterval = useCallback(() => {
    if (quizStateRef.current === "waiting" && intervalPairRef.current) {
      playIntervalPair(intervalPairRef.current);
    }
  }, [playIntervalPair]);

  const submitDirection = useCallback((direction: Direction) => {
    if (quizStateRef.current !== "waiting" || !intervalPairRef.current) return;

    setQuizState("feedback");
    const [note1, note2] = intervalPairRef.current;
    const correctDir: Direction = NOTES.indexOf(note2) > NOTES.indexOf(note1) ? "up" : "down";
    const isCorrect = direction === correctDir;

    setTotal((p) => p + 1);
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setStreak((p) => {
        const next = p + 1;
        setBestStreak((b) => Math.max(b, next));
        return next;
      });
      flashDirection(direction, "correct");
    } else {
      setStreak(0);
      flashDirection(direction, "wrong");
      flashDirection(correctDir, "correct");
    }

    showFeedback(isCorrect, correctDir === "up" ? "Up" : "Down");

    setTimeout(() => {
      nextIntervalRound();
    }, 1200);
  }, [flashDirection, showFeedback, nextIntervalRound]);

  const handleKeyClick = useCallback((note: NoteName) => {
    if (modeRef.current === "learn") {
      playNote(note);
      highlightKey(note);
    } else if (modeRef.current === "quiz") {
      submitAnswer(note);
    }
  }, [highlightKey, submitAnswer]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.repeat) return;

      // Arrow keys for interval mode
      if (modeRef.current === "interval") {
        if (e.key === "ArrowUp") {
          e.preventDefault();
          submitDirection("up");
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          submitDirection("down");
          return;
        }
        if (e.key === " " || e.code === "Space") {
          e.preventDefault();
          replayInterval();
          return;
        }
        return;
      }

      // Note keys for learn/quiz
      const note = KEY_MAP[e.key];
      if (note) {
        e.preventDefault();
        handleKeyClick(note);
        if (modeRef.current === "learn") highlightKey(note);
        return;
      }

      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (modeRef.current === "quiz") replay();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleKeyClick, highlightKey, replay, submitDirection, replayInterval]);

  const switchMode = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    resetQuiz();
  };

  const keysDisabled = quizState === "playing" || quizState === "feedback";
  const isQuizMode = mode === "quiz" || mode === "interval";

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        <Button
          variant={mode === "learn" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("learn")}
          data-testid="mode-learn"
        >
          Learn
        </Button>
        <Button
          variant={mode === "quiz" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("quiz")}
          data-testid="mode-quiz"
        >
          Quiz
        </Button>
        <Button
          variant={mode === "interval" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("interval")}
          data-testid="mode-interval"
        >
          <ArrowUpDown className="h-3 w-3 mr-1" />
          Interval
        </Button>
      </div>

      {/* Quiz Panel (shared by quiz and interval modes) */}
      {isQuizMode && (
        <div className="rounded-lg border bg-muted/30 p-4 space-y-3" data-testid="quiz-panel">
          <p className="text-center font-medium" data-testid="quiz-prompt">
            {quizState === "idle" && 'Click "Start" to begin!'}
            {quizState === "playing" && "Listen..."}
            {quizState === "waiting" && (mode === "interval" ? "Up or Down?" : "What note was that?")}
            {quizState === "feedback" && ""}
          </p>

          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              onClick={quizState === "idle" ? (mode === "interval" ? startInterval : startQuiz) : resetQuiz}
              data-testid="start-btn"
            >
              {quizState === "idle" ? (
                <><Play className="h-3 w-3 mr-1" /> Start</>
              ) : (
                <><RotateCcw className="h-3 w-3 mr-1" /> Reset</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={quizState !== "waiting"}
              onClick={mode === "interval" ? replayInterval : replay}
              data-testid="replay-btn"
            >
              <Volume2 className="h-3 w-3 mr-1" /> Replay
            </Button>
          </div>

          <div className="flex justify-center gap-6 text-sm">
            <div className="text-center">
              <span className="text-muted-foreground">Score</span>
              <p className="font-semibold" data-testid="score-value">{correct} / {total}</p>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground">Streak</span>
              <p className="font-semibold" data-testid="streak-value">{streak}</p>
            </div>
            <div className="text-center">
              <span className="text-muted-foreground">Best</span>
              <p className="font-semibold" data-testid="best-value">{bestStreak}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hint text for learn mode */}
      {mode === "learn" && (
        <p className="text-sm text-muted-foreground text-center">
          Click a key or press 1–7 to hear the note
        </p>
      )}

      {/* Piano Keyboard (learn & quiz modes) */}
      {(mode === "learn" || mode === "quiz") && (
        <div className="flex gap-1.5" data-testid="piano-keyboard">
          {NOTES.map((note) => {
            const isActive = activeKey === note;
            const flash = flashKeys[note];

            let bgClass = "bg-white hover:bg-gray-100 text-gray-900";
            if (flash === "correct") bgClass = "bg-emerald-400 text-white";
            else if (flash === "wrong") bgClass = "bg-red-400 text-white";
            else if (isActive) bgClass = "bg-gray-200 text-gray-900";

            return (
              <button
                key={note}
                data-note={note}
                disabled={mode === "quiz" && keysDisabled}
                onClick={() => handleKeyClick(note)}
                className={`flex-1 h-40 rounded-lg border-2 border-gray-300 text-lg font-bold
                  transition-all duration-100 shadow-md
                  ${bgClass}
                  ${mode === "quiz" && keysDisabled ? "opacity-50 cursor-not-allowed" : "active:translate-y-0.5 active:shadow-sm cursor-pointer"}
                `}
              >
                {note}
              </button>
            );
          })}
        </div>
      )}

      {/* Direction Buttons (interval mode) */}
      {mode === "interval" && (
        <div className="flex gap-3 justify-center" data-testid="direction-buttons">
          {(["up", "down"] as Direction[]).map((dir) => {
            const flash = directionFlash?.dir === dir ? directionFlash.type : null;
            let bgClass = "bg-white hover:bg-gray-100 text-gray-900";
            if (flash === "correct") bgClass = "bg-emerald-400 text-white";
            else if (flash === "wrong") bgClass = "bg-red-400 text-white";

            return (
              <button
                key={dir}
                disabled={keysDisabled}
                onClick={() => submitDirection(dir)}
                data-testid={`dir-${dir}`}
                className={`flex-1 max-w-48 h-40 rounded-lg border-2 border-gray-300 text-lg font-bold
                  transition-all duration-100 shadow-md flex flex-col items-center justify-center gap-2
                  ${bgClass}
                  ${keysDisabled ? "opacity-50 cursor-not-allowed" : "active:translate-y-0.5 active:shadow-sm cursor-pointer"}
                `}
              >
                {dir === "up" ? <ArrowUp className="h-8 w-8" /> : <ArrowDown className="h-8 w-8" />}
                {dir === "up" ? "Up" : "Down"}
              </button>
            );
          })}
        </div>
      )}

      {/* Feedback Overlay */}
      {feedback && (
        <div
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          data-testid="feedback-overlay"
        >
          <p
            className={`text-5xl font-bold animate-bounce ${
              feedback.type === "correct" ? "text-emerald-500" : "text-red-500"
            }`}
          >
            {feedback.type === "correct" ? "Correct!" : `It was ${feedback.note}`}
          </p>
        </div>
      )}

      {/* Footer hint */}
      <p className="text-xs text-muted-foreground text-center">
        {mode === "learn" && "Keyboard: 1–7 for notes"}
        {mode === "quiz" && "Keyboard: 1–7 for notes, Space to replay"}
        {mode === "interval" && "Keyboard: ↑/↓ arrows to answer, Space to replay"}
      </p>
    </div>
  );
}
