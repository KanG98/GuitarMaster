"use client";

import { useState } from "react";
import { Header, ToolName } from "@/components/shared/Header";
import { SongList } from "@/components/songs/SongList";
import { SongDetail } from "@/components/songs/SongDetail";
import { EarTrainer } from "@/components/tools/EarTrainer";
import { ChordLibrary } from "@/components/tools/ChordLibrary";
import { useSongManager } from "@/hooks/useSongManager";
import { SongRecord } from "@/lib/fileService";

export default function Home() {
  const { songs, isLoading, addSong, removeSong, refresh } = useSongManager();
  const [selectedSong, setSelectedSong] = useState<SongRecord | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolName>("songs");

  const handleDeleteSong = async (song: SongRecord) => {
    if (!confirm(`Delete "${song.name}" and all its files?`)) return;
    await removeSong(song.id);
    if (selectedSong?.id === song.id) {
      setSelectedSong(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentTool={currentTool} onToolChange={setCurrentTool} />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {currentTool === "songs" && (
          <>
            {selectedSong ? (
              <SongDetail
                song={selectedSong}
                onBack={() => { setSelectedSong(null); setTimeout(refresh, 500); }}
                onDeleteSong={() => handleDeleteSong(selectedSong)}
              />
            ) : (
              <SongList
                songs={songs}
                isLoading={isLoading}
                onSelectSong={setSelectedSong}
                onCreateSong={addSong}
                onDeleteSong={handleDeleteSong}
              />
            )}
          </>
        )}
        {currentTool === "earTrainer" && <EarTrainer />}
        {currentTool === "chordLibrary" && <ChordLibrary />}
      </main>
    </div>
  );
}
