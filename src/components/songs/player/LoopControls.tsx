"use client";

import { Repeat, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatTime } from "@/lib/utils";

interface LoopControlsProps {
  duration: number;
  loopA: number | null;
  loopB: number | null;
  isLooping: boolean;
  hasLoop: boolean;
  onLoopRangeChange: (values: number[]) => void;
  onSetA: () => void;
  onSetB: () => void;
  onToggleLoop: () => void;
  onClearLoop: () => void;
  onRestartLoop: () => void;
}

export function LoopControls({
  duration,
  loopA,
  loopB,
  isLooping,
  hasLoop,
  onLoopRangeChange,
  onSetA,
  onSetB,
  onToggleLoop,
  onClearLoop,
  onRestartLoop,
}: LoopControlsProps) {
  return (
    <div className="flex flex-col gap-3 flex-1 min-w-0">
      {/* Slider row */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
          {formatTime(loopA ?? 0)}
        </span>
        <Slider
          min={0}
          max={Math.max(duration, 1)}
          step={1}
          value={[loopA ?? 0, loopB ?? duration]}
          onValueChange={onLoopRangeChange}
          className="flex-1"
          data-testid="loop-slider"
        />
        <span className="text-xs font-mono text-muted-foreground w-10 shrink-0">
          {formatTime(loopB ?? duration)}
        </span>
      </div>
      {/* Controls row */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onRestartLoop}
          title={hasLoop ? "Restart loop" : "Restart from beginning"}
          data-testid="restart-loop"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
        <button
          onClick={onSetA}
          className="h-7 px-2.5 text-xs font-semibold rounded border bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
          title="Set loop start to current position"
          data-testid="set-loop-a"
        >
          Set A
        </button>
        <button
          onClick={onSetB}
          className="h-7 px-2.5 text-xs font-semibold rounded border bg-muted hover:bg-muted/80 transition-colors text-muted-foreground"
          title="Set loop end to current position"
          data-testid="set-loop-b"
        >
          Set B
        </button>
        <Button
          variant={isLooping ? "secondary" : "ghost"}
          size="sm"
          className={`h-7 px-2 ${isLooping ? "text-primary" : ""}`}
          onClick={onToggleLoop}
          disabled={!hasLoop}
          title={isLooping ? "Disable loop" : "Enable loop"}
        >
          <Repeat className="h-3 w-3" />
        </Button>
        {hasLoop && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground"
            onClick={onClearLoop}
            title="Clear loop points"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
