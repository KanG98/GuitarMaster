"use client";

import { Guitar, Ear, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ToolName = "songs" | "earTrainer" | "chordLibrary";

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
          <h1 className="text-lg font-bold tracking-tight">GuitarMaster</h1>
        </button>
        <nav className="flex items-center gap-1">
          <Button
            variant={currentTool === "songs" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onToolChange("songs")}
            data-testid="nav-songs"
          >
            <Guitar className="h-4 w-4 mr-1" />
            Songs
          </Button>
          <Button
            variant={currentTool === "earTrainer" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onToolChange("earTrainer")}
            data-testid="nav-ear-trainer"
          >
            <Ear className="h-4 w-4 mr-1" />
            Ear Trainer
          </Button>
          <Button
            variant={currentTool === "chordLibrary" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => onToolChange("chordLibrary")}
            data-testid="nav-chord-library"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Chords
          </Button>
        </nav>
      </div>
    </header>
  );
}
