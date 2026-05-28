"use client";

import { useState } from "react";
import { Link, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface AddSongDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (name: string, artist: string) => Promise<void>;
}

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:v=|\/)([a-zA-Z0-9_-]{11})(?:[&?\/]|$)/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export function AddSongDialog({ open, onOpenChange, onSubmit }: AddSongDialogProps) {
  const [mode, setMode] = useState<"manual" | "link">("manual");
  const [name, setName] = useState("");
  const [artist, setArtist] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [linkError, setLinkError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(name.trim(), artist.trim());
      setName("");
      setArtist("");
      setLinkUrl("");
      setLinkError("");
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFetchLink = async () => {
    const videoId = extractVideoId(linkUrl.trim());
    if (!videoId) {
      setLinkError("Could not find a YouTube video in that URL. Try a different link.");
      return;
    }

    setIsFetching(true);
    setLinkError("");
    try {
      const res = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setName(data.title || "");
    } catch {
      setLinkError("Could not fetch video info. Enter the name manually.");
    } finally {
      setIsFetching(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("");
      setArtist("");
      setLinkUrl("");
      setLinkError("");
      setMode("manual");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Song</DialogTitle>
          <DialogDescription>
            Add a song manually or from a YouTube link.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 p-0.5 rounded-lg bg-muted">
          <button
            onClick={() => { setMode("manual"); setLinkError(""); }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${mode === "manual" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Pencil className="h-3.5 w-3.5" />
            Manual
          </button>
          <button
            onClick={() => setMode("link")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${mode === "link" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Link className="h-3.5 w-3.5" />
            From Link
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "link" && (
            <div className="space-y-2">
              <label htmlFor="song-link" className="text-sm font-medium">
                YouTube URL
              </label>
              <div className="flex gap-2">
                <input
                  id="song-link"
                  type="text"
                  value={linkUrl}
                  onChange={(e) => { setLinkUrl(e.target.value); setLinkError(""); }}
                  placeholder="Paste a YouTube link..."
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleFetchLink}
                  disabled={!linkUrl.trim() || isFetching}
                >
                  {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Fetch"}
                </Button>
              </div>
              {linkError && (
                <p className="text-xs text-destructive">{linkError}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="song-name" className="text-sm font-medium">
              Song Name *
            </label>
            <input
              id="song-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hotel California"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus={mode === "manual"}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="song-artist" className="text-sm font-medium">
              Artist
            </label>
            <input
              id="song-artist"
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="e.g. Eagles"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isSubmitting}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
