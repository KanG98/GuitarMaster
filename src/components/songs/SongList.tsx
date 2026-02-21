"use client";

import { useState } from "react";
import { Plus, Music } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SongCard } from "./SongCard";
import { AddSongDialog } from "./AddSongDialog";
import { SongRecord } from "@/lib/fileService";

interface SongListProps {
  songs: SongRecord[];
  isLoading: boolean;
  onSelectSong: (song: SongRecord) => void;
  onCreateSong: (name: string, artist: string) => Promise<void>;
  onDeleteSong: (song: SongRecord) => void;
}

export function SongList({
  songs,
  isLoading,
  onSelectSong,
  onCreateSong,
  onDeleteSong,
}: SongListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

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
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Song
        </Button>
      </div>

      {songs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Music className="h-12 w-12 mx-auto mb-3 opacity-40" />
          <p>No songs yet</p>
          <p className="text-sm mt-1">Click &quot;Add Song&quot; to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {songs.map((song) => (
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
    </>
  );
}
