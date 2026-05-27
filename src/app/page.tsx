"use client";

import { useState, useEffect, useCallback } from "react";
import { Header, ToolName } from "@/components/shared/Header";
import { SongList } from "@/components/songs/SongList";
import { SongDetail } from "@/components/songs/SongDetail";
import { EarTrainer } from "@/components/tools/EarTrainer";
import { ChordLibrary } from "@/components/tools/ChordLibrary";
import { DiatonicQuiz } from "@/components/tools/DiatonicQuiz";
import { RhythmTrainer } from "@/components/tools/RhythmTrainer";
import { Metronome } from "@/components/tools/Metronome";
import { PracticeStats } from "@/components/tools/PracticeStats";
import { useSongManager } from "@/hooks/useSongManager";
import { SongRecord, createSong, uploadFile } from "@/lib/fileService";

export default function Home() {
  const { songs, isLoading, addSong, removeSong, togglePracticeStatus, togglePin, refresh } = useSongManager();
  const [selectedSong, setSelectedSong] = useState<SongRecord | null>(null);
  const [currentTool, setCurrentTool] = useState<ToolName>("songs");

  useEffect(() => {
    fetch("/api/songs/init").catch(() => {});
  }, []);

  const handleLookupAddSong = useCallback(
    async (
      name: string,
      artist: string,
      serverFilePath: string,
      fileName: string,
      mimeType: string
    ) => {
      const record = await createSong(name, artist);

      const res = await fetch(
        `/api/songs/file?path=${encodeURIComponent(serverFilePath)}`
      );
      if (!res.ok) {
        throw new Error("Failed to fetch song file");
      }
      const blob = await res.blob();
      const file = new File([blob], fileName, { type: mimeType });
      await uploadFile(record.id, file);
      await refresh();
    },
    [refresh]
  );

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
                onSongUpdate={setSelectedSong}
              />
            ) : (
              <SongList
                songs={songs}
                isLoading={isLoading}
                onSelectSong={setSelectedSong}
                onCreateSong={addSong}
                onDeleteSong={handleDeleteSong}
                onLookupAddSong={handleLookupAddSong}
                section="songs"
                onTogglePractice={(songId) => togglePracticeStatus(songId, true)}
                onTogglePin={togglePin}
              />
            )}
          </>
        )}
        {currentTool === "practices" && (
          <>
            {selectedSong ? (
              <SongDetail
                song={selectedSong}
                onBack={() => { setSelectedSong(null); setTimeout(refresh, 500); }}
                onDeleteSong={() => handleDeleteSong(selectedSong)}
                onSongUpdate={setSelectedSong}
              />
            ) : (
              <SongList
                songs={songs}
                isLoading={isLoading}
                onSelectSong={setSelectedSong}
                onCreateSong={addSong}
                onDeleteSong={handleDeleteSong}
                onLookupAddSong={handleLookupAddSong}
                section="practices"
                onTogglePractice={(songId) => togglePracticeStatus(songId, false)}
                onTogglePin={togglePin}
              />
            )}
          </>
        )}
        {currentTool === "earTrainer" && <EarTrainer />}
        {currentTool === "chordLibrary" && <ChordLibrary />}
        {currentTool === "theory" && <DiatonicQuiz />}
        {currentTool === "rhythm" && <RhythmTrainer />}
        {currentTool === "metronome" && <Metronome />}
        {currentTool === "stats" && <PracticeStats />}
      </main>
    </div>
  );
}
