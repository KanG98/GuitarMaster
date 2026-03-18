"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import { Search, X, Play, RotateCcw, Guitar } from "lucide-react";
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
  getPrimaryChords,
} from "@/lib/chordData";
import { InteractiveFretboard, comparePlacement } from "./InteractiveFretboard";

type Mode = "browse" | "quiz" | "build";
type QuizState = "idle" | "waiting" | "feedback";
type QuizDirection = "nameToDiagram" | "diagramToName";

interface ChordGroup {
  name: string;
  voicings: ChordDefinition[];
}

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
  const primaryChords = useMemo(() => getPrimaryChords(), []);
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

  // Build quiz state
  const [buildChord, setBuildChord] = useState<ChordDefinition | null>(null);
  const [buildState, setBuildState] = useState<"idle" | "placing" | "feedback">("idle");
  const [buildAnswer, setBuildAnswer] = useState<ChordDefinition | null>(null); // set on submit to show overlay
  const [buildCorrect, setBuildCorrect] = useState(0);
  const [buildTotal, setBuildTotal] = useState(0);
  const [buildStreak, setBuildStreak] = useState(0);
  const [buildBestStreak, setBuildBestStreak] = useState(0);
  const [buildFeedback, setBuildFeedback] = useState<{ type: "correct" | "wrong"; score: string } | null>(null);
  const buildFretboardRef = useRef<{ getPlacement: () => (number | null)[], reset: () => void } | null>(null);
  const buildTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Key to force remount InteractiveFretboard on new round
  const [buildKey, setBuildKey] = useState(0);

  // Filter and group chords for browse
  const filteredGroups = useMemo(() => {
    const filtered = CHORDS.filter((chord) => {
      const rootMatch = filterRoot === "all" || chord.root === filterRoot;
      const qualityMatch = filterQuality === "all" || chord.quality === filterQuality;
      const searchMatch =
        !searchQuery || chord.name.toLowerCase().includes(searchQuery.toLowerCase());
      return rootMatch && qualityMatch && searchMatch;
    });

    // Group by chord name, preserving order of first appearance
    const groups: ChordGroup[] = [];
    const groupMap = new Map<string, ChordGroup>();
    for (const chord of filtered) {
      let group = groupMap.get(chord.name);
      if (!group) {
        group = { name: chord.name, voicings: [] };
        groupMap.set(chord.name, group);
        groups.push(group);
      }
      group.voicings.push(chord);
    }
    return groups;
  }, [filterRoot, filterQuality, searchQuery]);

  const totalChordCount = useMemo(
    () => filteredGroups.reduce((sum, g) => sum + g.voicings.length, 0),
    [filteredGroups]
  );

  const clearFilters = () => {
    setSearchQuery("");
    setFilterRoot("all");
    setFilterQuality("all");
  };

  const nextRound = useCallback(() => {
    const shuffled = shuffleArray(primaryChords);
    const answer = shuffled[0];
    const wrong = shuffled.filter((c) => c.name !== answer.name).slice(0, 3);
    const options = shuffleArray([...wrong, answer]);
    setQuizChord(answer);
    setQuizOptions(options);
    setSelectedIndex(null);
    setFeedback(null);
    setQuizState("waiting");
  }, [primaryChords]);

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

  // Build quiz: only use open-position chords (baseFret === 1, no frets > 5)
  const buildableChords = useMemo(() => {
    return getPrimaryChords().filter(
      (c) => c.baseFret === 1 && c.strings.every((f) => f === null || f <= 5)
    );
  }, []);

  const nextBuildRound = useCallback(() => {
    const shuffled = shuffleArray(buildableChords);
    setBuildChord(shuffled[0]);
    setBuildAnswer(null);
    setBuildFeedback(null);
    setBuildState("placing");
    setBuildKey((k) => k + 1);
  }, [buildableChords]);

  const startBuild = useCallback(() => {
    setBuildCorrect(0);
    setBuildTotal(0);
    setBuildStreak(0);
    setBuildBestStreak(0);
    nextBuildRound();
  }, [nextBuildRound]);

  const resetBuild = useCallback(() => {
    if (buildTimerRef.current) {
      clearTimeout(buildTimerRef.current);
      buildTimerRef.current = null;
    }
    setBuildState("idle");
    setBuildChord(null);
    setBuildAnswer(null);
    setBuildFeedback(null);
    setBuildCorrect(0);
    setBuildTotal(0);
    setBuildStreak(0);
    setBuildBestStreak(0);
    setBuildKey((k) => k + 1);
  }, []);

  // Called from a separate Submit button — reads placement from InteractiveFretboard via ref-like pattern
  // We'll use a state-based approach instead of ref
  const [buildPlacement, setBuildPlacement] = useState<(number | null)[]>([null, null, null, null, null, null]);

  const handleBuildSubmit = useCallback(() => {
    if (buildState !== "placing" || !buildChord) return;
    const result = comparePlacement(buildPlacement, buildChord);
    setBuildTotal((p) => p + 1);
    setBuildAnswer(buildChord); // triggers answer overlay in fretboard

    if (result.perfect) {
      setBuildCorrect((p) => p + 1);
      setBuildStreak((p) => {
        const n = p + 1;
        setBuildBestStreak((b) => Math.max(b, n));
        return n;
      });
      setBuildFeedback({ type: "correct", score: `${result.correct}/${result.total}` });
    } else {
      setBuildStreak(0);
      setBuildFeedback({ type: "wrong", score: `${result.correct}/${result.total}` });
    }
    setBuildState("feedback");
    buildTimerRef.current = setTimeout(() => {
      nextBuildRound();
    }, 2500);
  }, [buildState, buildChord, buildPlacement, nextBuildRound]);

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    if (newMode === "quiz") resetQuiz();
    if (newMode === "build") resetBuild();
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
        <Button
          variant={mode === "build" ? "default" : "outline"}
          size="sm"
          onClick={() => switchMode("build")}
          data-testid="mode-build"
        >
          <Guitar className="h-3 w-3 mr-1" />
          Build It
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
              {filteredGroups.length} chord{filteredGroups.length !== 1 ? "s" : ""}
              {totalChordCount !== filteredGroups.length && (
                <span className="text-xs ml-1">({totalChordCount} voicings)</span>
              )}
            </span>
          </div>

          {/* Chord groups */}
          {filteredGroups.length > 0 ? (
            <div className="space-y-6" data-testid="chord-grid">
              {filteredGroups.map((group) => (
                <div key={group.name} data-testid={`chord-group-${group.name}`}>
                  <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                    {group.name}
                    {group.voicings.length > 1 && (
                      <span className="text-xs font-normal ml-2">
                        {group.voicings.length} positions
                      </span>
                    )}
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-1">
                    {group.voicings.map((chord) => (
                      <div
                        key={chord.id}
                        className="flex flex-col items-center p-3 rounded-xl border bg-card hover:shadow-md transition-all shrink-0"
                        data-testid={`chord-card-${chord.id}`}
                      >
                        <ChordDiagram chord={chord} size={100} />
                        <p className="text-xs text-muted-foreground mt-1">{chord.position}</p>
                      </div>
                    ))}
                  </div>
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

          {/* Feedback banner */}
          {feedback && (
            <div
              className={`text-center py-3 px-4 rounded-lg font-semibold text-lg ${
                feedback.type === "correct"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
              }`}
              data-testid="feedback-overlay"
            >
              {feedback.type === "correct" ? "Correct!" : `It was ${feedback.answer}!`}
            </div>
          )}
        </div>
      )}

      {/* Build It mode */}
      {mode === "build" && (
        <div className="space-y-6 max-w-2xl mx-auto">
          {/* Stats panel */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3" data-testid="build-panel">
            <p className="text-center font-medium text-lg" data-testid="build-prompt">
              {buildState === "idle"
                ? "Place fingers on the fretboard to build the chord!"
                : `Build: ${buildChord?.name}`}
            </p>
            <p className="text-center text-sm text-muted-foreground">
              Tap fret positions to place fingers. Tap above the nut to toggle open/muted.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                size="sm"
                onClick={buildState === "idle" ? startBuild : resetBuild}
                data-testid="build-start-btn"
              >
                {buildState === "idle" ? (
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
              {buildState === "placing" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleBuildSubmit}
                  data-testid="build-submit-btn"
                >
                  Check
                </Button>
              )}
            </div>
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <span className="text-muted-foreground">Score</span>
                <p className="font-semibold" data-testid="build-score">
                  {buildCorrect} / {buildTotal}
                </p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">Streak</span>
                <p className="font-semibold" data-testid="build-streak">
                  {buildStreak}
                </p>
              </div>
              <div className="text-center">
                <span className="text-muted-foreground">Best</span>
                <p className="font-semibold" data-testid="build-best">
                  {buildBestStreak}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive fretboard */}
          {buildState !== "idle" && (
            <div className="flex justify-center">
              <InteractiveFretboard
                key={buildKey}
                size={250}
                disabled={buildState === "feedback"}
                answer={buildAnswer}
                onChange={setBuildPlacement}
                data-testid="build-fretboard"
              />
            </div>
          )}

          {/* Correct answer diagram shown during feedback */}
          {buildState === "feedback" && buildChord && (
            <div className="flex justify-center gap-8 items-start">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Correct answer</p>
                <div className="p-3 rounded-xl border bg-card">
                  <ChordDiagram chord={buildChord} size={130} />
                </div>
              </div>
            </div>
          )}

          {/* Feedback banner */}
          {buildFeedback && (
            <div
              className={`text-center py-3 px-4 rounded-lg font-semibold text-lg ${
                buildFeedback.type === "correct"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
              }`}
              data-testid="build-feedback"
            >
              {buildFeedback.type === "correct"
                ? "Perfect! 🎸"
                : `${buildFeedback.score} strings correct`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
