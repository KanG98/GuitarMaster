"use client";

import { NoteName, NOTES, playNote } from "@/lib/audioEngine";

interface PianoKeyboardProps {
  activeKey: string | null;
  flashKeys: Record<string, "correct" | "wrong">;
  disabled: boolean;
  onKeyClick: (note: NoteName) => void;
  /** Height class for keys, e.g. "h-40" or "h-28" */
  heightClass?: string;
  /** data-testid for the container */
  testId?: string;
  /** If true, keys highlight when in a sequence (interval feedback) */
  highlightNotes?: NoteName[];
}

export function PianoKeyboard({
  activeKey,
  flashKeys,
  disabled,
  onKeyClick,
  heightClass = "h-40",
  testId = "piano-keyboard",
  highlightNotes,
}: PianoKeyboardProps) {
  return (
    <div className="flex gap-1.5" data-testid={testId}>
      {NOTES.map((note) => {
        const isActive = activeKey === note;
        const flash = flashKeys[note];
        const inSequence = highlightNotes?.includes(note);

        let bgClass = "bg-white hover:bg-gray-100 text-gray-900";
        if (flash === "correct") bgClass = "bg-emerald-400 text-white";
        else if (flash === "wrong") bgClass = "bg-red-400 text-white";
        else if (inSequence) bgClass = "bg-primary/30 text-gray-900 border-primary";
        else if (isActive) bgClass = "bg-gray-200 text-gray-900";

        return (
          <button
            key={note}
            data-note={note}
            disabled={disabled}
            onClick={() => onKeyClick(note)}
            className={`flex-1 ${heightClass} rounded-lg border-2 border-gray-300 text-lg font-bold
              transition-all duration-100 shadow-md
              ${bgClass}
              ${disabled ? "opacity-50 cursor-not-allowed" : "active:translate-y-0.5 active:shadow-sm cursor-pointer"}
            `}
          >
            {note}
          </button>
        );
      })}
    </div>
  );
}
