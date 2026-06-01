"use client";

import { useState, useEffect, useRef } from "react";
import {
  Guitar, Ear, BookOpen, Music, Activity, Timer, BarChart3, ListMusic,
  Ellipsis, Palette, X,
} from "lucide-react";
import { ThemePicker } from "./ThemePicker";

export type ToolName = "songs" | "practices" | "earTrainer" | "chordLibrary" | "theory" | "rhythm" | "metronome" | "stats";

interface HeaderProps {
  currentTool: ToolName;
  onToolChange: (tool: ToolName) => void;
}

type Tool = { id: ToolName; label: string; icon: React.ComponentType<{ className?: string }> };

const TOOLS_ALL: Tool[] = [
  { id: "songs", label: "Songs", icon: Guitar },
  { id: "practices", label: "Practices", icon: ListMusic },
  { id: "earTrainer", label: "Ear Trainer", icon: Ear },
  { id: "chordLibrary", label: "Chords", icon: BookOpen },
  { id: "theory", label: "Theory", icon: Music },
  { id: "rhythm", label: "Rhythm", icon: Activity },
  { id: "metronome", label: "Metronome", icon: Timer },
  { id: "stats", label: "Stats", icon: BarChart3 },
];

const BOTTOM_PRIMARY: Tool[] = [
  TOOLS_ALL[0], // Songs
  TOOLS_ALL[1], // Practices
  TOOLS_ALL[6], // Metronome
];

const MORE_TOOLS = TOOLS_ALL.filter((t) => t.id !== "songs" && t.id !== "practices" && t.id !== "metronome");

const CURRENT_LABELS: Record<ToolName, string> = {
  songs: "Songs",
  practices: "Practices",
  earTrainer: "Ear Trainer",
  chordLibrary: "Chords",
  theory: "Theory",
  rhythm: "Rhythm",
  metronome: "Metronome",
  stats: "Stats",
};

export function Header({ currentTool, onToolChange }: HeaderProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const [shrink, setShrink] = useState(0);
  const [headerVisible, setHeaderVisible] = useState(true);
  const ticking = useRef(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          setShrink(Math.min(y / 80, 1));

          if (y > lastY.current + 8) {
            setHeaderVisible(false);
          } else if (y < lastY.current - 4) {
            setHeaderVisible(true);
          }
          lastY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Top header bar */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 fixed top-0 left-0 right-0 z-30 sm:sticky sm:top-0 transition-all duration-300 ease-out-expo"
        style={{
          height: 56 + (1 - shrink) * 24 + "px",
          transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
        }}>
        <div className="container mx-auto flex h-full items-end gap-2 px-3 sm:px-4 pb-1.5 sm:pb-0 sm:items-center">
          <button
            className="flex items-center gap-2 hover:opacity-80 active:scale-95 transition-all duration-200 shrink-0"
            onClick={() => onToolChange("songs")}
            data-testid="banner-home"
            style={{ gap: 8 + (1 - shrink) * 4 + "px" }}
          >
            <Guitar className="shrink-0 transition-all duration-150 ease-out sm:block hidden" style={{ height: 24 + (1 - shrink) * 6 + "px", width: 24 + (1 - shrink) * 6 + "px" }} />
            <h1 className="hidden sm:block font-bold tracking-tight transition-all duration-150 ease-out"
              style={{ fontSize: 18 + (1 - shrink) * 4 + "px" }}>
              GuitarMaster
            </h1>
          </button>

          {/* Desktop: tool navigation */}
          <nav className="hidden sm:flex items-center gap-0.5 ml-2">
            {TOOLS_ALL.map((tool) => {
              const isActive = currentTool === tool.id;
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => onToolChange(tool.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ease-out-expo active:scale-95
                    ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tool.label}
                </button>
              );
            })}
          </nav>

          {/* Mobile: large collapsing title */}
          <span className="sm:hidden flex-1 font-bold transition-all duration-150 ease-out leading-none overflow-visible"
            style={{
              fontSize: 32 + (1 - shrink) * 12 + "px",
              transform: `translateY(${shrink * 5}px)`,
              opacity: 0.65 + (1 - shrink) * 0.35,
            }}>
            {CURRENT_LABELS[currentTool]}
          </span>

          {/* Mobile: actions portal target */}
          <div id="header-actions" className="sm:hidden flex items-center gap-1 shrink-0" />

          <div className="shrink-0">
            <ThemePicker className="hidden sm:inline-flex" />
          </div>
        </div>
      </header>

      {/* Mobile: Bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-14 px-1">
          {BOTTOM_PRIMARY.map((tool) => {
            const isActive = currentTool === tool.id;
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolChange(tool.id)}
                className={`relative flex flex-col items-center justify-center gap-0.5 h-12 min-w-0 flex-1 rounded-lg
                  transition-all duration-200 ease-out-expo active:scale-90
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Icon className={`h-5 w-5 transition-transform duration-300 ease-out-expo ${isActive ? "scale-110" : ""}`} />
                <span className="text-[10px] font-medium">{tool.label}</span>
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}

          {/* More */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`relative flex flex-col items-center justify-center gap-0.5 h-12 min-w-0 flex-1 rounded-lg
              transition-all duration-200 ease-out-expo active:scale-90
              ${moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Ellipsis className="h-5 w-5" />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile: "More" bottom sheet */}
      {moreOpen && (
        <>
          <div
            className="sm:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setMoreOpen(false)}
          />
          <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-2xl shadow-2xl
            animate-in slide-in-from-bottom duration-300 ease-out-expo
            max-h-[60vh] overflow-y-auto safe-area-inset-bottom">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h3 className="font-semibold">More Tools</h3>
              <button
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted active:scale-90 transition-all duration-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 space-y-1">
              {MORE_TOOLS.map((tool) => {
                const isActive = currentTool === tool.id;
                const Icon = tool.icon;
                return (
                  <button
                    key={tool.id}
                    onClick={() => { onToolChange(tool.id); setMoreOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                      transition-all duration-200 active:scale-[0.98]
                      ${isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"}`}
                  >
                    <Icon className="h-5 w-5" />
                    {tool.label}
                  </button>
                );
              })}
              <div className="border-t mt-2 pt-2">
                <ThemePicker className="w-full" variant="sheet" />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Spacer for bottom bar on mobile */}
    </>
  );
}
