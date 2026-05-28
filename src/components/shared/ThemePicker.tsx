"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeColors, loadSavedTheme, saveTheme } from "@/lib/themes";

interface ThemePickerProps {
  className?: string;
  variant?: "dropdown" | "sheet";
}

export function ThemePicker({ className = "", variant = "dropdown" }: ThemePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(THEMES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedTheme = loadSavedTheme();
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleThemeSelect = (theme: ThemeColors) => {
    setCurrentTheme(theme);
    saveTheme(theme);
    setIsOpen(false);
  };

  const getPrimaryColor = (oklchValue: string): string => {
    return oklchValue;
  };

  if (variant === "sheet") {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
          <Palette className="h-4 w-4" />
          Theme
        </div>
        <div className="grid grid-cols-4 gap-2 px-4 pb-4">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme)}
              data-testid={`theme-option-${theme.id}`}
              className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200 active:scale-95
                ${currentTheme.id === theme.id ? "bg-primary/10 ring-1 ring-primary/30" : "hover:bg-muted"}`}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: getPrimaryColor(theme.primary) }}
              >
                {currentTheme.id === theme.id && (
                  <Check className={`h-3.5 w-3.5 ${theme.id === "default" ? "text-foreground" : "text-white"}`} />
                )}
              </div>
              <span className="text-[11px] font-medium text-muted-foreground">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        data-testid="theme-picker-button"
        title="Change Theme"
        className="h-9 w-9 p-0"
      >
        <Palette className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-56 bg-popover border rounded-md shadow-md z-50"
          data-testid="theme-picker-dropdown"
        >
          <div className="p-2 space-y-1">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme)}
                className="w-full flex items-center gap-3 p-2 rounded-sm hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                data-testid={`theme-option-${theme.id}`}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 border-border flex items-center justify-center"
                  style={{ backgroundColor: getPrimaryColor(theme.primary) }}
                >
                  {currentTheme.id === theme.id && (
                    <Check className="h-3 w-3 text-primary-foreground" />
                  )}
                </div>
                <span className="text-lg">{theme.emoji}</span>
                <span className="flex-1 text-sm">{theme.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
