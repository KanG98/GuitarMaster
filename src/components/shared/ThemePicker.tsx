"use client";

import { useState, useRef, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeColors, loadSavedTheme, saveTheme } from "@/lib/themes";

export function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(THEMES[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved theme on mount
    const savedTheme = loadSavedTheme();
    setCurrentTheme(savedTheme);
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
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

  // Parse primary color for preview circle background
  const getPrimaryColor = (oklchValue: string): string => {
    // Convert oklch to hsl for better browser compatibility
    // For simplicity, we'll use the oklch value directly in modern browsers
    return oklchValue;
  };

  return (
    <div className="relative" ref={dropdownRef}>
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