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
import { searchYouTube, YouTubeSearchResult, buildGuitarTabQuery } from "@/lib/youtubeService";

interface SongDetailProps {
  song: SongRecord;
  onBack: () => void;
  onDeleteSong: () => void;
}

export function SongDetail({ song, onBack, onDeleteSong }: SongDetailProps) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const [videoId, setVideoId] = useState<string | null>(song.youtubeVideoId);
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [youtubeResults, setYoutubeResults] = useState<YouTubeSearchResult[]>([]);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);
  const practiceSecondsRef = useRef(song.totalPracticeSeconds);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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

  // Auto-search YouTube when entering a song with no video
  useEffect(() => {
    if (!song.youtubeVideoId) {
      handleYouTubeSearch(buildGuitarTabQuery(song.name, song.artist));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song.id]);

  const handleUpload = async (selectedFiles: File[]) => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(selectedFiles.length > 1 ? `Uploading 1 / ${selectedFiles.length}...` : "");
    const errors: string[] = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      if (selectedFiles.length > 1) {
        setUploadProgress(`Uploading ${i + 1} / ${selectedFiles.length}...`);
      }
      try {
        const record = await uploadFile(song.id, selectedFiles[i]);
        setFiles((prev) => [...prev, record]);
      } catch (err) {
        errors.push(`${selectedFiles[i].name}: ${err instanceof Error ? err.message : "failed"}`);
      }
    }
    setIsUploading(false);
    setUploadProgress("");
    if (errors.length > 0) {
      setError(`Failed to upload: ${errors.join(", ")}`);
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
    setYoutubeError(null);
    try {
      const results = await searchYouTube(query);
      setYoutubeResults(results);
    } catch (err) {
      setYoutubeError(err instanceof Error ? err.message : "YouTube search failed");
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
          <PracticeTimer songId={song.id} initialSeconds={song.totalPracticeSeconds} secondsRef={practiceSecondsRef} isPlaying={videoId ? isVideoPlaying : undefined} />
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

      {videoId ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <YouTubeSection
              videoId={videoId}
              songName={song.name}
              artist={song.artist}
              isSearching={isSearchingYouTube}
              searchResults={youtubeResults}
              searchError={youtubeError}
              onSearch={handleYouTubeSearch}
              onSelectVideo={handleSelectVideo}
              onRemoveVideo={handleRemoveVideo}
              onPlayingChange={setIsVideoPlaying}
            />
          </div>
          <div className="lg:col-span-2">
            {files.length === 0 && (
              <UploadZone
                onFilesSelected={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={error}
                compact={false}
              />
            )}
            <FileGallery
              files={files}
              isLoading={isLoading}
              onView={(_file, index) => setViewIndex(window.innerWidth < 640 ? index : index - (index % 2))}
              onDelete={handleDeleteFile}
              onReorder={handleReorder}
              uploadSlot={files.length > 0 && (
                <UploadZone
                  onFilesSelected={handleUpload}
                  isUploading={isUploading}
                  uploadProgress={uploadProgress}
                  error={error}
                  compact
                />
              )}
            />
          </div>
        </div>
      ) : (
        <>
          <YouTubeSection
            videoId={videoId}
            songName={song.name}
            artist={song.artist}
            isSearching={isSearchingYouTube}
            searchResults={youtubeResults}
            searchError={youtubeError}
            onSearch={handleYouTubeSearch}
            onSelectVideo={handleSelectVideo}
            onRemoveVideo={handleRemoveVideo}
            onPlayingChange={setIsVideoPlaying}
          />
          {files.length === 0 && (
            <UploadZone
              onFilesSelected={handleUpload}
              isUploading={isUploading}
              uploadProgress={uploadProgress}
              error={error}
              compact={false}
            />
          )}
          <FileGallery
            files={files}
            isLoading={isLoading}
            onView={(_file, index) => setViewIndex(window.innerWidth < 640 ? index : index - (index % 2))}
            onDelete={handleDeleteFile}
            onReorder={handleReorder}
            uploadSlot={files.length > 0 && (
              <UploadZone
                onFilesSelected={handleUpload}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                error={error}
                compact
              />
            )}
          />
        </>
      )}
    </div>
  );
}
