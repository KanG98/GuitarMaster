"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileRecord } from "@/lib/fileService";

interface FileViewerProps {
  files: FileRecord[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  onClose: () => void;
}

function FileContent({ file }: { file: FileRecord }) {
  if (file.type.startsWith("image/")) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={file.url}
        alt={file.name}
        className="max-w-full max-h-full object-contain select-none"
        draggable={false}
      />
    );
  }
  return (
    <iframe
      src={file.url}
      className="w-full h-full rounded bg-white"
      title={file.name}
    />
  );
}

export function FileViewer({ files, currentIndex, onNavigate, onClose }: FileViewerProps) {
  const leftFile = files[currentIndex];
  const rightFile = currentIndex + 1 < files.length ? files[currentIndex + 1] : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex + 2 < files.length;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(Math.max(0, currentIndex - 2));
  }, [hasPrev, currentIndex, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + 2);
  }, [hasNext, currentIndex, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goNext();
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goPrev, goNext, onClose]);

  if (!leftFile) return null;

  // Build counter label: "1-2 / 5" or "5 / 5"
  const leftNum = currentIndex + 1;
  const rightNum = rightFile ? currentIndex + 2 : null;
  const counterLabel = rightNum
    ? `${leftNum}-${rightNum} / ${files.length}`
    : `${leftNum} / ${files.length}`;

  // Build file name label
  const nameLabel = rightFile
    ? `${leftFile.name}  |  ${rightFile.name}`
    : leftFile.name;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm font-medium truncate">{nameLabel}</span>
          <span className="text-xs text-white/50" data-testid="page-counter">
            {counterLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" asChild>
            <a href={leftFile.url} download={leftFile.name}>
              <Download className="h-4 w-4" />
            </a>
          </Button>
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Content area with nav buttons */}
      <div className="flex-1 flex items-center justify-center relative min-h-0">
        {/* Left arrow */}
        {hasPrev && (
          <button
            onClick={goPrev}
            aria-label="Previous pages"
            className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* Dual page content */}
        <div className="w-full h-full flex items-center justify-center gap-4 p-4">
          <div className="flex-1 h-full flex items-center justify-center">
            <FileContent file={leftFile} />
          </div>
          {rightFile && (
            <div className="flex-1 h-full flex items-center justify-center">
              <FileContent file={rightFile} />
            </div>
          )}
        </div>

        {/* Right arrow */}
        {hasNext && (
          <button
            onClick={goNext}
            aria-label="Next pages"
            className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-center py-2 text-xs text-white/30">
        Use arrow keys to navigate &middot; Esc to close
      </div>
    </div>
  );
}
