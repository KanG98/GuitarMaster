"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Plus, Music, Search, X, Filter, ListChecks, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "./SongCard";
import { AddSongDialog } from "./AddSongDialog";
import { SongLookupDialog } from "./SongLookupDialog";
import { SongRecord } from "@/lib/fileService";

interface SongListProps {
  songs: SongRecord[];
  isLoading: boolean;
  onSelectSong: (song: SongRecord) => void;
  onCreateSong: (name: string, artist: string) => Promise<void>;
  onDeleteSong: (song: SongRecord) => void;
  onLookupAddSong: (
    name: string,
    artist: string,
    serverFilePath: string,
    fileName: string,
    mimeType: string
  ) => Promise<void>;
  section?: "songs" | "practices";
  onTogglePractice?: (songId: string) => void;
  onTogglePin?: (songId: string) => void;
}

function PillButton({
  active,
  icon: Icon,
  label,
  onClick,
  className = "",
  destructive = false,
}: {
  active?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  className?: string;
  destructive?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium
        active:scale-95 transition-all duration-200 ease-out-expo
        ${active
          ? "bg-primary/10 text-primary"
          : destructive
            ? "text-muted-foreground hover:text-destructive hover:bg-background/80"
            : "text-muted-foreground hover:text-foreground hover:bg-background/80"
        }
        ${className}`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

const Divider = () => <span className="w-px h-5 bg-border/50" />;

export function SongList({
  songs,
  isLoading,
  onSelectSong,
  onCreateSong,
  onDeleteSong,
  onLookupAddSong,
  section = "songs",
  onTogglePractice,
  onTogglePin,
}: SongListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [foldersReady, setFoldersReady] = useState(true);
  const [artistFilter, setArtistFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const sectionSongs = useMemo(
    () => section === "practices" ? songs.filter((s) => s.practicing) : songs.filter((s) => !s.practicing),
    [songs, section]
  );

  const artists = useMemo(() => {
    const map = new Map<string, number>();
    sectionSongs.forEach((s) => { if (s.artist) map.set(s.artist, (map.get(s.artist) || 0) + 1); });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b));
  }, [sectionSongs]);

  const filteredArtists = filterSearch
    ? artists.filter(([name]) => name.toLowerCase().includes(filterSearch.toLowerCase()))
    : artists;

  const filteredSongs = artistFilter
    ? sectionSongs.filter((s) => s.artist === artistFilter)
    : sectionSongs;

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    if (!confirm(`Delete ${count} song${count > 1 ? "s" : ""}? This cannot be undone.`)) return;
    selectedIds.forEach((id) => {
      const song = songs.find((s) => s.id === id);
      if (song) onDeleteSong(song);
    });
    setSelectedIds(new Set());
    setSelectMode(false);
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelectedIds(new Set());
  };

  const [toolbarVisible, setToolbarVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentY = window.scrollY;
          if (currentY > lastScrollY.current + 8) {
            setToolbarVisible(false);
          } else if (currentY < lastScrollY.current - 4) {
            setToolbarVisible(true);
          }
          lastScrollY.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
        setFilterSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (filterOpen) searchInputRef.current?.focus();
  }, [filterOpen]);

  useEffect(() => {
    fetch("/api/songs/status")
      .then((res) => res.json())
      .then((data) => setFoldersReady(data.ready))
      .catch(() => setFoldersReady(false));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-wrap items-center justify-between gap-3 mb-6 sticky top-14 z-20 bg-background/95 backdrop-blur -mx-4 px-4 py-3 sm:relative sm:top-auto sm:z-auto sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0 sm:py-0 sm:translate-y-0 sm:opacity-100 transition-all duration-300 ease-out-expo ${toolbarVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"}`}>
        <h2 className="text-2xl font-bold tracking-tight hidden sm:block">
          {section === "practices" ? "Your Practices" : "Your Songs"}
        </h2>

        <div className="flex items-center gap-3">
          {selectMode ? (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
              <span className="text-sm font-medium tabular-nums">
                <span className="text-destructive">{selectedIds.size}</span>
                <span className="hidden sm:inline"> selected</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={exitSelectMode}
                className="active:scale-95 transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={selectedIds.size === 0}
                onClick={handleBulkDelete}
                className="active:scale-95 transition-all duration-200"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Delete</span> ({selectedIds.size})
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-0 p-0.5 rounded-xl bg-muted/50 border border-border/60 shadow-sm">
              <PillButton
                icon={ListChecks}
                label="Select"
                onClick={() => setSelectMode(true)}
              />
              <Divider />

              {artists.length > 0 && (
                <>
                  <div className="relative" ref={filterRef} data-testid="artist-filter">
                    <button
                      onClick={() => { setFilterOpen(!filterOpen); setFilterSearch(""); }}
                      className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-sm font-medium
                        active:scale-95 transition-all duration-200 ease-out-expo
                        ${artistFilter
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                        }`}
                      data-testid="filter-toggle"
                    >
                      <Filter className={`h-4 w-4 shrink-0 transition-transform duration-300 ${filterOpen ? "rotate-180" : ""}`} />
                      <span className="hidden sm:inline max-w-[80px] truncate">
                        {artistFilter || "Artist"}
                      </span>
                      {artistFilter && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); setArtistFilter(null); setFilterOpen(false); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setArtistFilter(null); setFilterOpen(false); }}}
                          className="ml-0.5 p-0.5 rounded-full hover:bg-muted-foreground/20 active:scale-75 transition-all duration-200"
                          data-testid="filter-clear"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </button>

                    {filterOpen && (
                      <div
                        className="absolute right-0 z-10 mt-2 w-56 rounded-xl border bg-popover shadow-lg
                          origin-top-right animate-in fade-in zoom-in-95 duration-200"
                        data-testid="filter-dropdown"
                      >
                        <div className="flex items-center gap-2 px-3 py-2.5 border-b">
                          <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <input
                            ref={searchInputRef}
                            type="text"
                            value={filterSearch}
                            onChange={(e) => setFilterSearch(e.target.value)}
                            placeholder="Filter artists..."
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                            data-testid="filter-search"
                          />
                        </div>
                        <div className="max-h-52 overflow-y-auto py-1">
                          <button
                            onClick={() => { setArtistFilter(null); setFilterOpen(false); setFilterSearch(""); }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors ${
                              artistFilter === null ? "font-semibold text-primary bg-primary/5" : ""
                            }`}
                          >
                            All artists
                            <span className="text-muted-foreground ml-1.5 text-xs">({sectionSongs.length})</span>
                          </button>
                          {filteredArtists.map(([name, count]) => (
                            <button
                              key={name}
                              onClick={() => { setArtistFilter(name); setFilterOpen(false); setFilterSearch(""); }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors flex justify-between items-center ${
                                artistFilter === name ? "font-semibold text-primary bg-primary/5" : ""
                              }`}
                            >
                              <span className="truncate">{name}</span>
                              <span className="text-xs text-muted-foreground ml-2 shrink-0 tabular-nums">{count}</span>
                            </button>
                          ))}
                          {filteredArtists.length === 0 && (
                            <p className="px-3 py-4 text-sm text-muted-foreground text-center">No artists found</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <Divider />
                </>
              )}

              {section === "songs" && (
                <PillButton
                  icon={Search}
                  label="Look Up"
                  onClick={() => setLookupOpen(true)}
                  destructive={!foldersReady}
                  className={foldersReady ? "" : "animate-pulse"}
                />
              )}

              <Divider />

              <PillButton
                icon={Plus}
                label={section === "practices" ? "Practice" : "Add Song"}
                onClick={() => setDialogOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {sectionSongs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>{section === "practices" ? "No songs in practice list" : "No songs yet"}</p>
          <p className="text-sm mt-1">
            {section === "practices"
              ? "Click the swap icon on a song to add it here"
              : "Click \"Add Song\" to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-[15vh] pb-[30vh]">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => onSelectSong(song)}
              deleteMode={selectMode}
              isSelected={selectedIds.has(song.id)}
              onToggleSelect={() => toggleSelect(song.id)}
              onTogglePractice={onTogglePractice ? () => onTogglePractice(song.id) : undefined}
              onTogglePin={onTogglePin ? () => onTogglePin(song.id) : undefined}
            />
          ))}
        </div>
      )}

      <AddSongDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onCreateSong}
      />

      <SongLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onAddSong={onLookupAddSong}
        foldersReady={foldersReady}
      />
    </>
  );
}
