"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Plus, Music, Search, X, Filter } from "lucide-react";
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
}

export function SongList({
  songs,
  isLoading,
  onSelectSong,
  onCreateSong,
  onDeleteSong,
  onLookupAddSong,
}: SongListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const [artistFilter, setArtistFilter] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const filterRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const artists = useMemo(() => {
    const map = new Map<string, number>();
    songs.forEach((s) => { if (s.artist) map.set(s.artist, (map.get(s.artist) || 0) + 1); });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b));
  }, [songs]);

  const filteredArtists = filterSearch
    ? artists.filter(([name]) => name.toLowerCase().includes(filterSearch.toLowerCase()))
    : artists;

  const filteredSongs = artistFilter
    ? songs.filter((s) => s.artist === artistFilter)
    : songs;

  // Close dropdown on outside click
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

  // Focus search input when dropdown opens
  useEffect(() => {
    if (filterOpen) searchInputRef.current?.focus();
  }, [filterOpen]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Your Songs</h2>
        <div className="flex items-center gap-2">
          {artists.length > 0 && (
            <div className="relative" ref={filterRef} data-testid="artist-filter">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setFilterOpen(!filterOpen); setFilterSearch(""); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    artistFilter
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-input"
                  }`}
                  data-testid="filter-toggle"
                >
                  <Filter className="h-3.5 w-3.5" />
                  {artistFilter || "Artist"}
                </button>
                {artistFilter && (
                  <button
                    onClick={() => { setArtistFilter(null); setFilterOpen(false); }}
                    className="p-1 rounded-full hover:bg-muted text-muted-foreground"
                    data-testid="filter-clear"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {filterOpen && (
                <div className="absolute right-0 z-10 mt-1 w-64 rounded-lg border bg-background shadow-lg" data-testid="filter-dropdown">
                  <div className="flex items-center gap-2 px-3 py-2 border-b">
                    <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={filterSearch}
                      onChange={(e) => setFilterSearch(e.target.value)}
                      placeholder="Search artists..."
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
                      data-testid="filter-search"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto py-1">
                    <button
                      onClick={() => { setArtistFilter(null); setFilterOpen(false); setFilterSearch(""); }}
                      className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${
                        artistFilter === null ? "font-semibold text-primary" : ""
                      }`}
                    >
                      All artists ({songs.length})
                    </button>
                    {filteredArtists.map(([name, count]) => (
                      <button
                        key={name}
                        onClick={() => { setArtistFilter(name); setFilterOpen(false); setFilterSearch(""); }}
                        className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors flex justify-between ${
                          artistFilter === name ? "font-semibold text-primary" : ""
                        }`}
                      >
                        <span className="truncate">{name}</span>
                        <span className="text-muted-foreground ml-2 shrink-0">{count}</span>
                      </button>
                    ))}
                    {filteredArtists.length === 0 && (
                      <p className="px-3 py-2 text-sm text-muted-foreground">No artists found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <Button variant="outline" onClick={() => setLookupOpen(true)}>
            <Search className="h-4 w-4 mr-1" />
            Look Up
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Song
          </Button>
        </div>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No songs yet</p>
          <p className="text-sm mt-1">Click &quot;Add Song&quot; to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSongs.map((song) => (
            <SongCard
              key={song.id}
              song={song}
              onClick={() => onSelectSong(song)}
              onDelete={() => onDeleteSong(song)}
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
      />
    </>
  );
}
