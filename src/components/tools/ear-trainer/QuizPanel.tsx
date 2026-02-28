"use client";

import { Play, RotateCcw, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuizPanelProps {
  quizState: "idle" | "playing" | "waiting" | "feedback";
  promptText: string;
  correct: number;
  total: number;
  streak: number;
  bestStreak: number;
  onStart: () => void;
  onReset: () => void;
  onReplay: () => void;
}

export function QuizPanel({
  quizState,
  promptText,
  correct,
  total,
  streak,
  bestStreak,
  onStart,
  onReset,
  onReplay,
}: QuizPanelProps) {
  return (
    <div className="rounded-lg border bg-muted/30 p-4 space-y-3" data-testid="quiz-panel">
      <p className="text-center font-medium" data-testid="quiz-prompt">
        {promptText}
      </p>

      <div className="flex justify-center gap-2">
        <Button
          size="sm"
          onClick={quizState === "idle" ? onStart : onReset}
          data-testid="start-btn"
          className="active:scale-90 transition-transform duration-150"
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
          onClick={onReplay}
          data-testid="replay-btn"
          className="active:scale-90 transition-transform duration-150"
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
  );
}
