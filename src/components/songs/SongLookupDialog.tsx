"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { Search, Loader2, FileMusic, FolderOpen, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SongFileInfo } from "@/lib/songDirectoryService";
import { SongRecord } from "@/lib/fileService";

interface SongLookupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSong: (
    name: string,
    artist: string,
    serverFilePath: string,
    fileName: string,
    mimeType: string
  ) => Promise<void>;
  foldersReady: boolean;
  songs?: SongRecord[];
  onMatchFound?: (songId: string | null) => void;
}

function parseNameAndArtist(
  relativePath: string,
  fileName: string
): { name: string; artist: string } {
  const parts = relativePath.split("/");
  const nameWithoutExt = fileName.replace(/\.[^.]+$/, "");
  if (parts.length > 1) {
    return { name: nameWithoutExt, artist: parts[0] };
  }
  return { name: nameWithoutExt, artist: "" };
}

function formatSize(bytes: number): string {
  if (bytes === 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SongLookupDialog({
  open,
  onOpenChange,
  onAddSong,
  foldersReady,
  songs = [],
  onMatchFound,
}: SongLookupDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SongFileInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAdding, setIsAdding] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed || !onMatchFound) {
      onMatchFound?.(null);
      return;
    }
    const match = songs.find((s) =>
      s.name.toLowerCase().includes(trimmed) ||
      s.artist.toLowerCase().includes(trimmed)
    );
    onMatchFound(match?.id ?? null);
  }, [query, songs, onMatchFound]);

  const sortedResults = useMemo(() => {
    return results
      .map((info) => {
        const { name, artist } = parseNameAndArtist(info.relativePath, info.fileName);
        const existing = songs.find(
          (s) =>
            s.name.toLowerCase() === name.toLowerCase() ||
            (artist && s.artist.toLowerCase() === artist.toLowerCase())
        );
        return { info, alreadyExists: !!existing };
      })
      .sort((a, b) => (a.alreadyExists === b.alreadyExists ? 0 : a.alreadyExists ? -1 : 1));
  }, [results, songs]);

  const handleSearch = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) return;

      setIsSearching(true);
      setError(null);
      setHasSearched(true);
      setResults([]);

      try {
        const res = await fetch(
          `/api/songs/lookup?q=${encodeURIComponent(trimmed)}`
        );
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Search failed");
        } else {
          setResults(data.results || []);
        }
      } catch {
        setError("Failed to connect to search service");
      } finally {
        setIsSearching(false);
      }
    },
    [query]
  );

  const handleAdd = useCallback(
    async (info: SongFileInfo) => {
      setIsAdding(info.relativePath);
      try {
        const { name, artist } = parseNameAndArtist(
          info.relativePath,
          info.fileName
        );
        await onAddSong(
          name,
          artist,
          info.relativePath,
          info.fileName,
          info.type
        );
        onOpenChange(false);
        setQuery("");
        setResults([]);
        setHasSearched(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add song"
        );
      } finally {
        setIsAdding(null);
      }
    },
    [onAddSong, onOpenChange]
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuery("");
      setResults([]);
      setError(null);
      setHasSearched(false);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Look Up Song</DialogTitle>
          <DialogDescription>
            Search for a song file in your local songs directory.
          </DialogDescription>
        </DialogHeader>

        {!foldersReady && (
          <div className="flex items-center gap-3 rounded-md bg-destructive/10 p-4 text-sm text-destructive">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Song directory not found</p>
              <p className="text-destructive/70 mt-0.5">The songs folder is missing. Add songs manually below while we fix this.</p>
            </div>
          </div>
        )}

        {foldersReady && (
          <>
          <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search song name... (e.g. 晴天)"
              className="w-full rounded-md border bg-background py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              autoFocus
            />
          </div>
          <Button type="submit" disabled={!query.trim() || isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </form>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <div className="max-h-64 overflow-y-auto -mx-1">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : hasSearched && results.length === 0 && !error ? (
            <div className="text-center py-8 text-muted-foreground">
              <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No matching files found</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedResults.map(({ info, alreadyExists }) => (
                <div
                  key={info.relativePath}
                  className={`flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors group ${
                    alreadyExists ? "bg-primary/5" : ""
                  }`}
                >
                  {alreadyExists ? (
                    <CheckCircle className="h-5 w-5 shrink-0 text-primary" />
                  ) : (
                    <FileMusic className="h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">
                        {info.fileName}
                      </p>
                      {alreadyExists ? (
                        <Badge variant="default" className="text-[10px] px-1 py-0 shrink-0">
                          In your list
                        </Badge>
                      ) : (
                        info.size > 0 && (
                          <Badge variant="secondary" className="text-[10px] px-1 py-0 shrink-0">
                            {formatSize(info.size)}
                          </Badge>
                        )
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {
                        parseNameAndArtist(info.relativePath, info.fileName)
                          .artist
                      }
                      {parseNameAndArtist(info.relativePath, info.fileName)
                        .artist &&
                        " / "}
                      {info.relativePath}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={alreadyExists ? "secondary" : "ghost"}
                    className={`shrink-0 transition-opacity ${
                      alreadyExists
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100"
                    }`}
                    onClick={() => !alreadyExists && handleAdd(info)}
                    disabled={alreadyExists || isAdding === info.relativePath}
                  >
                    {isAdding === info.relativePath ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : null}
                    {alreadyExists ? "Added" : "Add"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
