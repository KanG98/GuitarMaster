"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Search, X, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChordDiagram } from "./ChordDiagram";
import {
  CHORDS,
  ALL_ROOTS,
  ALL_QUALITIES,
  QUALITY_LABELS,
  ChordDefinition,
  NoteRoot,
  ChordQuality,
} from "@/lib/chordData";

type Mode = "browse" | "quiz";
type QuizState = "idle" | "waiting" | "feedback";
type QuizDirection = "nameToDiagram" | "diagramToName";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function ChordLibrary() {
  const [mode, setMode] = useState<Mode>("browse");

  // Browse state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRoot, setFilterRoot] = useState<NoteRoot | "all">("all");
  const [filterQuality, setFilterQuality] = useState<ChordQuality | "all">("all");

  // Quiz state
  const [quizDirection, setQuizDirection] = useState<QuizDirection>("nameToDiagram");
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [quizChord, setQuizChord] = useState<ChordDefinition | null>(null);
  const [quizOptions, setQuizOptions] = useState<ChordDefinition[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: "correct" | "wrong"; answer: string } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredChords = useMemo(() => {
    return CHORDS.filter((chord) => {
      const rootMatch = filterRoot === "all" || chord.root === filterRoot;
      const qualityMatch = filterQuality === "all" || chord.quality === filterQuality;
      const searchMatch =
        !searchQuery || chord.name.toLowerCase().includes(searchQuery.toLowerCase());
      return rootMatch && qualityMatch && searchMatch;
    });
  }, [filterRoot, filterQuality, searchQuery]);

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRoot("all");
    setFilterQuality("all");
  };

  const nextRound = useCallback(() => {
    const shuffled = shuffleArray(CHORDS);
    const answer = shuffled[0];
    const wrong = shuffled.slice(1, 4);
    const options = shuffleArray([...wrong, answer]);
    setQuizChord(answer);
    setQuizOptions(options);
    setSelectedIndex(null);
    setFeedback(null);
    setQuizState("waiting");
  }, []);

  const startQuiz = useCallback(() => {
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
    nextRound();
  }, [nextRound]);

  const resetQuiz = useCallback(() => {
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    setQuizState("idle");
    setQuizChord(null);
    setQuizOptions([]);
    setSelectedIndex(null);
    setFeedback(null);
    setCorrect(0);
    setTotal(0);
    setStreak(0);
    setBestStreak(0);
  }, []);

  const handleAnswer = useCallback(
    (index: number) => {
      if (quizState !== "waiting" || selectedIndex !== null || !quizChord) return;
      setSelectedIndex(index);
      const isCorrect = quizOptions[index].id === quizChord.id;
      setTotal((p) => p + 1);
      if (isCorrect) {
        setCorrect((p) => p + 1);
        setStreak((p) => {
          const n = p + 1;
          setBestStreak((b) => Math.max(b, n));
          return n;
        });
        setFeedback({ type: "correct", answer: quizChord.name });
      } else {
        setStreak(0);
        setFeedback({ type: "wrong", answer: quizChord.name });
      }
      setQuizState("feedback");
      feedbackTimerRef.current = setTimeout(() => {
        nextRound();
      }, 1500);
    },
    [quizState, selectedIndex, quizChord, quizOptions, nextRound]
  );

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "quiz") resetQuiz();
  };

  const hasActiveFilters = filterRoot !== "all" || filterQuality !== "all" || searchQuery !== "";

  return (
    <div className="space-y-6">
      {/* Mode tabs */}
      <div className="flex gap-2">
        <Button
          variant={mode === "browse" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("browse")}
          data-testid="mode-browse"
        >
          Browse
        </Button>
        <Button
          variant={mode === "quiz" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("quiz")}
          data-testid="mode-quiz"
        >
          Quiz
        </Button>
      </div>

      {/* Browse mode */}
      {mode === "browse" && (
        <div className="space-y-4">
          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex items-center">
              <Search className="absolute left-2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search chords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-sm border rounded-md bg-background outline-none focus:ring-1 focus:ring-primary w-44"
                data-testid="chord-search"
              />
            </div>
            <select
              value={filterRoot}
              onChange={(e) => setFilterRoot(e.target.value as NoteRoot | "all")}
              className="text-sm border rounded-md px-2 py-1.5 bg-background outline-none focus:ring-1 focus:ring-primary"
              data-testid="filter-root"
            >
              <option value="all">All Keys</option>
              {ALL_ROOTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <select
              value={filterQuality}
              onChange={(e) => setFilterQuality(e.target.value as ChordQuality | "all")}
              className="text-sm border rounded-md px-2 py-1.5 bg-background outline-none focus:ring-1 focus:ring-primary"
              data-testid="filter-quality"
            >
              <option value="all">All Types</option>
              {ALL_QUALITIES.map((q) => (
                <option key={q} value={q}>
                  {QUALITY_LABELS[q]}
                </option>
              ))}
            </select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                data-testid="clear-filters"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Clear
              </Button>
            )}
            <span className="text-sm text-muted-foreground ml-auto">
              {filteredChords.length} chord{filteredChords.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Chord grid */}
          {filteredChords.length > 0 ? (
            <div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              data-testid="chord-grid"
            >
              {filteredChords.map((chord) => (
                <div
                  key={chord.id}
                  className="flex flex-col items-center p-3 rounded-xl border bg-card hover:shadow-md transition-all"
                  data-testid={`chord-card-${chord.id}`}
                >
                  <ChordDiagram chord={chord} size={100} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No chords match your filters</p>
            </div>
          )}
        </div>
      )}

      {/* Quiz mode */}
      {mode === "quiz" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Quiz direction toggle */}
          <div className="flex justify-center gap-2" data-testid="quiz-direction">
            <Button
              variant={quizDirection === "nameToDiagram" ? "default" : "outline"}
              size="sm"
              onClick={() => { setQuizDirection("nameToDiagram"); if (quizState !== "idle") resetQuiz(); }}
              data-testid="dir-name-to-diagram"
            >
              Name → Diagram
            </Button>
            <Button
              variant={quizDirection === "diagramToName" ? "default" : "outline"}
              size="sm"
              onClick={() => { setQuizDirection("diagramToName"); if (quizState !== "idle") resetQuiz(); }}
              data-testid="dir-diagram-to-name"
            >
              Diagram → Name
            </Button>
          </div>

          {/* Stats panel */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3" data-testid="quiz-panel">
            <p className="text-center font-medium" data-testid="quiz-prompt">
              {quizState === "idle"
                ? 'Click "Start" to begin!'
                : quizDirection === "nameToDiagram"
                  ? `Which diagram is ${quizChord?.name}?`
                  : "What chord is this?"}
            </p>
            <div className="flex justify-center">
              <Button
                size="sm"
                onClick={quizState === "idle" ? startQuiz : resetQuiz}
                data-testid="start-btn"
              >
                {quizState === "idle" ? (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Start
                  </>
                ) : (
                  <>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </>
                )}
              </Button>
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground">Score</span>
                <p className="font-semibold" data-testid="score-value">
                  {correct} / {total}
                </p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">Streak</span>
                <p className="font-semibold" data-testid="streak-value">
                  {streak}
                </p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">Best</span>
                <p className="font-semibold" data-testid="best-value">
                  {bestStreak}
                </p>
              </div>
            </div>
          </div>

          {/* Diagram → Name: show the chord diagram */}
          {quizState !== "idle" && quizDirection === "diagramToName" && quizChord && (
            <div className="flex justify-center">
              <div className="p-4 rounded-xl border bg-card">
                <ChordDiagram chord={quizChord} size={150} showName={false} />
              </div>
            </div>
          )}

          {/* Quiz options */}
          {quizState !== "idle" && (
            <div
              className={
                quizDirection === "nameToDiagram"
                  ? "grid grid-cols-2 gap-4"
                  : "grid grid-cols-2 gap-3"
              }
              data-testid="quiz-options"
            >
              {quizOptions.map((chord, i) => {
                const isSelected = selectedIndex === i;
                const isCorrectChord = chord.id === quizChord?.id;
                let borderClass = "border-border hover:border-primary";
                if (quizState === "feedback") {
                  if (isCorrectChord)
                    borderClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20";
                  else if (isSelected)
                    borderClass = "border-red-500 bg-red-50 dark:bg-red-950/20";
                }

                if (quizDirection === "nameToDiagram") {
                  return (
                    <button
                      key={chord.id}
                      onClick={() => handleAnswer(i)}
                      disabled={quizState === "feedback"}
                      data-testid={`quiz-option-${i}`}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center
                        ${borderClass}
                        ${quizState !== "feedback" ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <ChordDiagram chord={chord} size={110} showName={false} />
                    </button>
                  );
                }

                // diagramToName — show name buttons
                return (
                  <button
                    key={chord.id}
                    onClick={() => handleAnswer(i)}
                    disabled={quizState === "feedback"}
                    data-testid={`quiz-option-${i}`}
                    className={`p-4 rounded-xl border-2 transition-all text-center text-lg font-semibold
                      ${borderClass}
                      ${quizState !== "feedback" ? "cursor-pointer" : "cursor-default"}`}
                  >
                    {chord.name}
                  </button>
                );
              })}
            </div>
          )}

          {/* Feedback overlay */}
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
                {feedback.type === "correct" ? "Correct!" : `It was ${feedback.answer}!`}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
