"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileGallery } from "@/components/viewer/FileGallery";
import { FileViewer } from "@/components/viewer/FileViewer";
import { PracticeTimer } from "./PracticeTimer";
import { YouTubeSection } from "./YouTubeSection";
import {
  SongRecord,
  FileRecord,
  uploadFile,
  getFiles,
  deleteFile,
  updateFileOrder,
  updatePracticeTime,
  updateSongVideo,
} from "@/lib/fileService";
import { searchYouTube, YouTubeSearchResult } from "@/lib/youtubeService";

interface SongDetailProps {
  song: SongRecord;
  onBack: () => void;
  onDeleteSong: () => void;
}

export function SongDetail({ song, onBack, onDeleteSong }: SongDetailProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [videoId, setVideoId] = useState<string | null>(song.youtubeVideoId);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeSearchResult[]>([]);
  const practiceSecondsRef = useRef(song.totalPracticeSeconds);

  const handleBack = async () => {
    const delta = practiceSecondsRef.current - song.totalPracticeSeconds;
    if (delta > 0) {
      await updatePracticeTime(song.id, delta);
    }
    onBack();
  };

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getFiles(song.id);
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, [song.id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);
    try {
      const record = await uploadFile(song.id, file);
      setFiles((prev) => [...prev, record]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (file: FileRecord) => {
    if (!confirm(`Delete "${file.name}"?`)) return;
    await deleteFile(song.id, file.id);
    refresh();
  };

  const handleReorder = async (reordered: FileRecord[]) => {
    setFiles(reordered);
    await updateFileOrder(song.id, reordered.map((f) => f.id));
  };

  const handleYouTubeSearch = async (query: string) => {
    setIsSearchingYouTube(true);
    try {
      const results = await searchYouTube(query);
      setYoutubeResults(results);
    } catch {
      // Search failure is non-critical
    } finally {
      setIsSearchingYouTube(false);
    }
  };

  const handleSelectVideo = async (newVideoId: string) => {
    setVideoId(newVideoId);
    setYoutubeResults([]);
    await updateSongVideo(song.id, newVideoId);
  };

  const handleRemoveVideo = async () => {
    setVideoId(null);
    setYoutubeResults([]);
    await updateSongVideo(song.id, null);
  };

  return (
    <div className="space-y-6">
      {viewIndex !== null && (
        <FileViewer
          files={files}
          currentIndex={viewIndex}
          onNavigate={setViewIndex}
          onClose={() => setViewIndex(null)}
        />
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-xl font-bold">{song.name}</h2>
            {song.artist && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-3 w-3" />
                {song.artist}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <PracticeTimer songId={song.id} initialSeconds={song.totalPracticeSeconds} secondsRef={practiceSecondsRef} />
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onDeleteSong}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete Song
          </Button>
        </div>
      </div>

      <YouTubeSection
        videoId={videoId}
        songName={song.name}
        artist={song.artist}
        isSearching={isSearchingYouTube}
        searchResults={youtubeResults}
        onSearch={handleYouTubeSearch}
        onSelectVideo={handleSelectVideo}
        onRemoveVideo={handleRemoveVideo}
      />

      <UploadZone
        onFileSelected={handleUpload}
        isUploading={isUploading}
        error={error}
        compact={files.length > 0}
      />

      <FileGallery
        files={files}
        isLoading={isLoading}
        onView={(_file, index) => setViewIndex(index - (index % 2))}
        onDelete={handleDeleteFile}
        onReorder={handleReorder}
      />
    </div>
  );
}
