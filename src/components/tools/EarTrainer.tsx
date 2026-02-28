"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playNote, ensureAudioReady, NOTES, NoteName } from "@/lib/audioEngine";
import { PianoKeyboard } from "./ear-trainer/PianoKeyboard";
import { QuizPanel } from "./ear-trainer/QuizPanel";
import { DirectionButtons } from "./ear-trainer/DirectionButtons";
import { IntervalFeedback } from "./ear-trainer/IntervalFeedback";

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

function pickNoteSequence(length: number): NoteName[] {
  const seq: NoteName[] = [NOTES[Math.floor(Math.random() * NOTES.length)]];
  for (let k = 1; k < length; k++) {
    let note: NoteName;
    do {
      note = NOTES[Math.floor(Math.random() * NOTES.length)];
    } while (note === seq[k - 1]);
    seq.push(note);
  }
  return seq;
}

function getCorrectDirections(notes: NoteName[]): Direction[] {
  return notes.slice(1).map((note, i) =>
    NOTES.indexOf(note) > NOTES.indexOf(notes[i]) ? "up" : "down"
  );
}

export function EarTrainer() {
  const [mode, setMode] = useState<Mode>("learn");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [currentNote, setCurrentNote] = useState<NoteName | null>(null);
  const [noteSequence, setNoteSequence] = useState<NoteName[]>([]);
  const [seqLength, setSeqLength] = useState(2);
  const [answers, setAnswers] = useState<Direction[]>([]);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [flashKeys, setFlashKeys] = useState<Record<string, "correct" | "wrong">>({});
  const [directionFlash, setDirectionFlash] = useState<{ dir: Direction; type: "correct" | "wrong" } | null>(null);
  const [intervalResult, setIntervalResult] = useState<{ isCorrect: boolean; notes: NoteName[]; correctDirs: Direction[] } | null>(null);

  useEffect(() => { ensureAudioReady(); }, []);

  const quizStateRef = useRef(quizState);
  const currentNoteRef = useRef(currentNote);
  const noteSequenceRef = useRef(noteSequence);
  const seqLengthRef = useRef(seqLength);
  const answersRef = useRef(answers);
  const modeRef = useRef(mode);
  quizStateRef.current = quizState;
  currentNoteRef.current = currentNote;
  noteSequenceRef.current = noteSequence;
  seqLengthRef.current = seqLength;
  answersRef.current = answers;
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
    setTimeout(() => { setQuizState("waiting"); }, 600);
  }, []);

  const startQuiz = useCallback(() => {
    setCorrect(0); setTotal(0); setStreak(0); setBestStreak(0);
    setCurrentNote(null);
    nextRound();
  }, [nextRound]);

  const resetQuiz = useCallback(() => {
    setQuizState("idle");
    setCurrentNote(null);
    setNoteSequence([]);
    setAnswers([]);
    setIntervalResult(null);
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
      setStreak((p) => { const next = p + 1; setBestStreak((b) => Math.max(b, next)); return next; });
      flashKey(noteName, "correct");
    } else {
      setStreak(0);
      flashKey(noteName, "wrong");
      if (currentNoteRef.current) flashKey(currentNoteRef.current, "correct");
    }
    playNote(currentNoteRef.current!);
    showFeedback(isCorrect, currentNoteRef.current!);
    setTimeout(() => { nextRound(); }, 1200);
  }, [flashKey, showFeedback, nextRound]);

  // --- Interval Direction ---
  const playNoteSequence = useCallback((notes: NoteName[]) => {
    notes.forEach((note, i) => {
      if (i === 0) playNote(note);
      else setTimeout(() => playNote(note), 600 * i);
    });
  }, []);

  const nextIntervalRound = useCallback(() => {
    setQuizState("playing");
    setAnswers([]);
    setIntervalResult(null);
    const seq = pickNoteSequence(seqLengthRef.current);
    setNoteSequence(seq);
    playNoteSequence(seq);
    setTimeout(() => { setQuizState("waiting"); }, 600 * seqLengthRef.current);
  }, [playNoteSequence]);

  const startInterval = useCallback(() => {
    setCorrect(0); setTotal(0); setStreak(0); setBestStreak(0);
    setNoteSequence([]); setAnswers([]);
    nextIntervalRound();
  }, [nextIntervalRound]);

  const replayInterval = useCallback(() => {
    if ((quizStateRef.current === "waiting" || quizStateRef.current === "feedback") && noteSequenceRef.current.length > 0) {
      playNoteSequence(noteSequenceRef.current);
    }
  }, [playNoteSequence]);

  const submitDirection = useCallback((direction: Direction) => {
    if (quizStateRef.current !== "waiting" || noteSequenceRef.current.length === 0) return;
    const newAnswers = [...answersRef.current, direction];
    const requiredCount = noteSequenceRef.current.length - 1;
    if (newAnswers.length < requiredCount) {
      setAnswers(newAnswers);
      flashDirection(direction, "correct");
      return;
    }
    setAnswers(newAnswers);
    setQuizState("feedback");
    const correctDirs = getCorrectDirections(noteSequenceRef.current);
    const isCorrect = newAnswers.every((a, i) => a === correctDirs[i]);
    setTotal((p) => p + 1);
    if (isCorrect) {
      setCorrect((p) => p + 1);
      setStreak((p) => { const next = p + 1; setBestStreak((b) => Math.max(b, next)); return next; });
      flashDirection(direction, "correct");
    } else {
      setStreak(0);
      flashDirection(direction, "wrong");
    }
    setIntervalResult({ isCorrect, notes: [...noteSequenceRef.current], correctDirs });
  }, [flashDirection]);

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
      if (modeRef.current === "interval") {
        if (e.key === "ArrowUp") { e.preventDefault(); submitDirection("up"); return; }
        if (e.key === "ArrowDown") { e.preventDefault(); submitDirection("down"); return; }
        if (e.key === " " || e.code === "Space") { e.preventDefault(); replayInterval(); return; }
        return;
      }
      const note = KEY_MAP[e.key];
      if (note) { e.preventDefault(); handleKeyClick(note); if (modeRef.current === "learn") highlightKey(note); return; }
      if (e.key === " " || e.code === "Space") { e.preventDefault(); if (modeRef.current === "quiz") replay(); }
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

  // Build prompt text for quiz panel
  const getPromptText = () => {
    if (quizState === "idle") return 'Click "Start" to begin!';
    if (quizState === "playing") return "Listen...";
    if (quizState === "waiting") {
      if (mode === "interval") {
        return seqLength === 2 ? "Up or Down?" : `Direction ${answers.length + 1} of ${seqLength - 1}?`;
      }
      return "What note was that?";
    }
    return "";
  };

  return (
    <div className="space-y-6 max-w-lg mx-auto">
      {/* Mode Tabs */}
      <div className="flex gap-2">
        <Button variant={mode === "learn" ? "default" : "outline"} size="sm" onClick={() => switchMode("learn")} data-testid="mode-learn">Learn</Button>
        <Button variant={mode === "quiz" ? "default" : "outline"} size="sm" onClick={() => switchMode("quiz")} data-testid="mode-quiz">Quiz</Button>
        <Button variant={mode === "interval" ? "default" : "outline"} size="sm" onClick={() => switchMode("interval")} data-testid="mode-interval">
          <ArrowUpDown className="h-3 w-3 mr-1" />Interval
        </Button>
      </div>

      {/* Quiz Panel */}
      {isQuizMode && (
        <QuizPanel
          quizState={quizState}
          promptText={getPromptText()}
          correct={correct}
          total={total}
          streak={streak}
          bestStreak={bestStreak}
          onStart={mode === "interval" ? startInterval : startQuiz}
          onReset={resetQuiz}
          onReplay={mode === "interval" ? replayInterval : replay}
        />
      )}

      {/* Hint text for learn mode */}
      {mode === "learn" && (
        <p className="text-sm text-muted-foreground text-center">Click a key or press 1–7 to hear the note</p>
      )}

      {/* Piano Keyboard (learn & quiz modes) */}
      {(mode === "learn" || mode === "quiz") && (
        <PianoKeyboard
          activeKey={activeKey}
          flashKeys={flashKeys}
          disabled={mode === "quiz" && keysDisabled}
          onKeyClick={handleKeyClick}
          testId="piano-keyboard"
        />
      )}

      {/* Sequence Length Selector (interval mode) */}
      {mode === "interval" && (
        <div className="flex items-center justify-center gap-2" data-testid="seq-length-selector">
          <span className="text-sm text-muted-foreground">Notes:</span>
          {[2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => { setSeqLength(n); resetQuiz(); }}
              disabled={quizState !== "idle"}
              data-testid={`seq-len-${n}`}
              className={`w-8 h-8 rounded-full text-sm font-semibold transition-colors
                ${seqLength === n ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted-foreground/20 text-foreground"}
                ${quizState !== "idle" ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {n}
            </button>
          ))}
        </div>
      )}

      {/* Direction Buttons & Interval UI */}
      {mode === "interval" && (
        <div className="space-y-3">
          <DirectionButtons
            disabled={keysDisabled}
            directionFlash={directionFlash}
            onSubmit={submitDirection}
          />

          {/* Progress dots */}
          {seqLength > 2 && quizState === "waiting" && (
            <div className="flex justify-center gap-1.5" data-testid="progress-dots">
              {Array.from({ length: seqLength - 1 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i < answers.length ? "bg-primary" : i === answers.length ? "bg-primary/40 animate-pulse" : "bg-muted-foreground/20"
                  }`}
                  data-testid={`dot-${i}`}
                />
              ))}
            </div>
          )}

          {/* Reference keyboard */}
          <PianoKeyboard
            activeKey={activeKey}
            flashKeys={{}}
            disabled={false}
            onKeyClick={(note) => { playNote(note); highlightKey(note); }}
            heightClass="h-28"
            testId="interval-keyboard"
            highlightNotes={intervalResult && quizState === "feedback" ? intervalResult.notes : undefined}
          />

          {/* Interval feedback */}
          {intervalResult && quizState === "feedback" && (
            <IntervalFeedback
              isCorrect={intervalResult.isCorrect}
              notes={intervalResult.notes}
              correctDirs={intervalResult.correctDirs}
              onReplay={replayInterval}
              onNext={nextIntervalRound}
            />
          )}
        </div>
      )}

      {/* Feedback Overlay (note quiz only) */}
      {feedback && mode !== "interval" && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50" data-testid="feedback-overlay">
          <p className={`text-5xl font-bold animate-bounce ${feedback.type === "correct" ? "text-emerald-500" : "text-red-500"}`}>
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
