"use client";

import { Guitar, Ear, BookOpen, Music, Activity, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemePicker } from "./ThemePicker";

export type ToolName = "songs" | "earTrainer" | "chordLibrary" | "theory" | "rhythm" | "metronome";

interface HeaderProps {
  currentTool: ToolName;
  onToolChange: (tool: ToolName) => void;
}

export function Header({ currentTool, onToolChange }: HeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <button
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          onClick={() => onToolChange("songs")}
          data-testid="banner-home"
        >
          <Guitar className="h-6 w-6" />
          <h1 className="hidden sm:block text-lg font-bold tracking-tight">GuitarMaster</h1>
        </button>
        <div className="flex items-center gap-2">
          <ThemePicker />
          <nav className="flex items-center gap-0.5 sm:gap-1">
            <Button
              variant={currentTool === "songs" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("songs")}
              data-testid="nav-songs"
              title="Songs"
            >
              <Guitar className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Songs</span>
            </Button>
            <Button
              variant={currentTool === "earTrainer" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("earTrainer")}
              data-testid="nav-ear-trainer"
              title="Ear Trainer"
            >
              <Ear className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Ear Trainer</span>
            </Button>
            <Button
              variant={currentTool === "chordLibrary" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("chordLibrary")}
              data-testid="nav-chord-library"
              title="Chords"
            >
              <BookOpen className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Chords</span>
            </Button>
            <Button
              variant={currentTool === "theory" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("theory")}
              data-testid="nav-theory"
              title="Theory"
            >
              <Music className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Theory</span>
            </Button>
            <Button
              variant={currentTool === "rhythm" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("rhythm")}
              data-testid="nav-rhythm"
              title="Rhythm"
            >
              <Activity className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Rhythm</span>
            </Button>
            <Button
              variant={currentTool === "metronome" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onToolChange("metronome")}
              data-testid="nav-metronome"
              title="Metronome"
            >
              <Timer className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Metronome</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
