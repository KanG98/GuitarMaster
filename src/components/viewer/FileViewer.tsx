"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileRecord } from "@/lib/fileService";
import { useIsMobile } from "@/hooks/useIsMobile";

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
        className="w-full h-full object-contain select-none"
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
  const isMobile = useIsMobile();
  const step = 1;

  const leftFile = files[currentIndex];
  const rightFile = !isMobile && currentIndex + 1 < files.length ? files[currentIndex + 1] : null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex + step < files.length;

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(Math.max(0, currentIndex - step));
  }, [hasPrev, currentIndex, step, onNavigate]);

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(currentIndex + step);
  }, [hasNext, currentIndex, step, onNavigate]);

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

  // Swipe support for mobile
  useEffect(() => {
    if (!isMobile) return;
    let startX = 0;
    let startY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) goNext();
        else goPrev();
      }
    };
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isMobile, goNext, goPrev]);

  if (!leftFile) return null;

  // Build counter label
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
      <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 text-white">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="text-xs sm:text-sm font-medium truncate">{isMobile ? leftFile.name : nameLabel}</span>
          <span className="text-xs text-white/50" data-testid="page-counter">
            {counterLabel}
          </span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
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
        {/* Left arrow - hidden on mobile (use swipe) */}
        {hasPrev && (
          <button
            onClick={goPrev}
            aria-label="Previous pages"
            className="hidden sm:block absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
        )}

        {/* Content - single page on mobile, dual on desktop */}
        <div className={`w-full h-full flex items-center justify-center gap-1 ${isMobile ? "px-0 py-0" : "px-10 py-2"}`}>
          <div className="flex-1 h-full flex items-center justify-center">
            <FileContent file={leftFile} />
          </div>
          {rightFile && (
            <div className="flex-1 h-full flex items-center justify-center">
              <FileContent file={rightFile} />
            </div>
          )}
        </div>

        {/* Right arrow - hidden on mobile (use swipe) */}
        {hasNext && (
          <button
            onClick={goNext}
            aria-label="Next pages"
            className="hidden sm:block absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        )}
      </div>

      {/* Bottom hint - hidden on mobile */}
      <div className="hidden sm:block text-center py-2 text-xs text-white/30">
        Use arrow keys to navigate &middot; Esc to close
      </div>
    </div>
  );
}
