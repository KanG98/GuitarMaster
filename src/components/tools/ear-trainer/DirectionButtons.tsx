"use client";

import { ArrowUp, ArrowDown } from "lucide-react";

type Direction = "up" | "down";

interface DirectionButtonsProps {
  disabled: boolean;
  directionFlash: { dir: Direction; type: "correct" | "wrong" } | null;
  onSubmit: (direction: Direction) => void;
}

export function DirectionButtons({ disabled, directionFlash, onSubmit }: DirectionButtonsProps) {
  return (
    <div className="flex gap-3 justify-center" data-testid="direction-buttons">
      {(["up", "down"] as Direction[]).map((dir) => {
        const flash = directionFlash?.dir === dir ? directionFlash.type : null;
        let bgClass = "bg-white hover:bg-gray-100 text-gray-900";
        if (flash === "correct") bgClass = "bg-emerald-400 text-white";
        else if (flash === "wrong") bgClass = "bg-red-400 text-white";

        return (
          <button
            key={dir}
            disabled={disabled}
            onClick={() => onSubmit(dir)}
            data-testid={`dir-${dir}`}
            className={`flex-1 max-w-48 h-40 rounded-lg border-2 border-gray-300 text-lg font-bold
              transition-all duration-100 shadow-md flex flex-col items-center justify-center gap-2
              ${bgClass}
              ${disabled ? "opacity-50 cursor-not-allowed" : "active:translate-y-0.5 active:shadow-sm cursor-pointer"}
            `}
          >
            {dir === "up" ? <ArrowUp className="h-8 w-8" /> : <ArrowDown className="h-8 w-8" />}
            {dir === "up" ? "Up" : "Down"}
          </button>
        );
      })}
    </div>
  );
}
