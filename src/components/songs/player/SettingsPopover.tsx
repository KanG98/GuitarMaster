"use client";

import { useEffect, useRef } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsPopoverProps {
  skipInputValue: string;
  onSkipInputChange: (value: string) => void;
  onSkipInputBlur: () => void;
  showSettings: boolean;
  onToggleSettings: () => void;
}

export function SettingsPopover({
  skipInputValue,
  onSkipInputChange,
  onSkipInputBlur,
  showSettings,
  onToggleSettings,
}: SettingsPopoverProps) {
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showSettings) return;
    const handler = (e: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        onToggleSettings();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSettings, onToggleSettings]);

  return (
    <div className="relative ml-auto" ref={settingsRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 w-7 p-0"
        onClick={onToggleSettings}
        title="Settings"
        data-testid="settings-btn"
      >
        <Settings className="h-3.5 w-3.5" />
      </Button>
      {showSettings && (
        <div className="absolute right-0 top-full mt-1 z-10 rounded-lg border bg-popover p-3 shadow-md" data-testid="settings-popover">
          <label className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground whitespace-nowrap">Skip (seconds)</span>
            <input
              type="number"
              min={1}
              max={120}
              value={skipInputValue}
              onChange={(e) => onSkipInputChange(e.target.value)}
              onBlur={onSkipInputBlur}
              className="w-16 text-sm border rounded px-2 py-1 bg-background outline-none focus:ring-1 focus:ring-primary"
              data-testid="skip-amount-input"
            />
          </label>
        </div>
      )}
    </div>
  );
}
