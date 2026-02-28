"use client";

const SLOW_SPEEDS = [0.25, 0.5, 0.6, 0.7, 0.75, 0.8, 0.9];
const FAST_SPEEDS = [1, 1.25, 1.5, 1.75, 2];

interface SpeedControlsProps {
  playbackRate: number;
  onChangeSpeed: (rate: number) => void;
}

export function SpeedControls({ playbackRate, onChangeSpeed }: SpeedControlsProps) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2 space-y-1.5">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-8 shrink-0">Slow</span>
        <div className="flex items-center gap-1">
          {SLOW_SPEEDS.map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeSpeed(rate)}
              className={`h-6 px-1.5 text-xs rounded-full transition-colors ${
                playbackRate === rate
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider w-8 shrink-0">Fast</span>
        <div className="flex items-center gap-1">
          {FAST_SPEEDS.map((rate) => (
            <button
              key={rate}
              onClick={() => onChangeSpeed(rate)}
              className={`h-6 px-1.5 text-xs rounded-full transition-colors ${
                playbackRate === rate
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
