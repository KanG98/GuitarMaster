"use client";

import { Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoteName } from "@/lib/audioEngine";

type Direction = "up" | "down";

interface IntervalFeedbackProps {
  isCorrect: boolean;
  notes: NoteName[];
  correctDirs: Direction[];
  onReplay: () => void;
  onNext: () => void;
}

export function IntervalFeedback({ isCorrect, notes, correctDirs, onReplay, onNext }: IntervalFeedbackProps) {
  return (
    <div
      className={`rounded-lg p-4 space-y-3 text-center ${
        isCorrect
          ? "bg-emerald-100 dark:bg-emerald-950/30"
          : "bg-red-100 dark:bg-red-950/30"
      }`}
      data-testid="interval-feedback"
    >
      <p className={`text-lg font-bold ${
        isCorrect ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
      }`}>
        {isCorrect ? "Correct!" : "Wrong!"}
      </p>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          Notes: {notes.join(" → ")}
        </p>
        <p className="text-sm text-muted-foreground">
          Directions: {correctDirs.map((d) => d === "up" ? "↑" : "↓").join(" ")}
        </p>
      </div>
      <div className="flex justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onReplay}
          data-testid="feedback-replay-btn"
          className="active:scale-90 transition-transform duration-150"
        >
          <Volume2 className="h-3 w-3 mr-1" /> Replay
        </Button>
        <Button
          size="sm"
          onClick={onNext}
          data-testid="next-btn"
          className="active:scale-90 transition-transform duration-150"
        >
          Next
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
    </div>
  );
}
