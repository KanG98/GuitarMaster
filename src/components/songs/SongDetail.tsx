"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Trash2, User, Music, Mic2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileGallery } from "@/components/viewer/FileGallery";
import { FileViewer } from "@/components/viewer/FileViewer";
import { PracticeTimer } from "./PracticeTimer";
import { YouTubeSection } from "./YouTubeSection";
import { SongRecord, updatePracticeTime } from "@/lib/fileService";
import { buildBackingTrackQuery } from "@/lib/youtubeService";
import { useSongFiles } from "@/hooks/useSongFiles";
import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";
import { useBackingTrackSearch } from "@/hooks/useBackingTrackSearch";

interface SongDetailProps {
  song: SongRecord;
  onBack: () => void;
  onDeleteSong: () => void;
}

export function SongDetail({ song, onBack, onDeleteSong }: SongDetailProps) {
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const practiceSecondsRef = useRef(song.totalPracticeSeconds);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoMode, setVideoMode] = useState<"original" | "backing">("original");

  // Use extracted hooks
  const {
    files,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    handleUpload,
    handleDeleteFile,
    handleReorder,
  } = useSongFiles(song.id);

  const {
    videoId,
    isSearchingYouTube,
    youtubeResults,
    youtubeError,
    handleYouTubeSearch,
    handleSelectVideo,
    handleRemoveVideo,
  } = useYouTubeSearch(song.id, song.name, song.artist, song.youtubeVideoId);

  const {
    videoId: backingTrackId,
    isSearching: isSearchingBacking,
    results: backingResults,
    error: backingError,
    handleSearch: handleBackingSearch,
    handleSelectVideo: handleSelectBacking,
    handleRemoveVideo: handleRemoveBacking,
  } = useBackingTrackSearch(song.id, song.name, song.artist, song.youtubeBackingTrackId);

  const activeVideoId = videoMode === "original" ? videoId : backingTrackId;

  const handleBack = async () => {
    const delta = practiceSecondsRef.current - song.totalPracticeSeconds;
    if (delta > 0) {
      await updatePracticeTime(song.id, delta);
    }
    onBack();
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
          <PracticeTimer songId={song.id} songName={song.name} initialSeconds={song.totalPracticeSeconds} secondsRef={practiceSecondsRef} isPlaying={activeVideoId ? isVideoPlaying : undefined} />
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

      {/* Video mode toggle */}
      <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 w-fit">
        <button
          onClick={() => setVideoMode("original")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            videoMode === "original"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Mic2 className="h-3.5 w-3.5" />
          Original
        </button>
        <button
          onClick={() => setVideoMode("backing")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            videoMode === "backing"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Music className="h-3.5 w-3.5" />
          Backing Track
        </button>
      </div>

      {activeVideoId ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            {videoMode === "original" ? (
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
            ) : (
              <YouTubeSection
                videoId={backingTrackId}
                songName={song.name}
                artist={song.artist}
                isSearching={isSearchingBacking}
                searchResults={backingResults}
                searchError={backingError}
                onSearch={handleBackingSearch}
                onSelectVideo={handleSelectBacking}
                onRemoveVideo={handleRemoveBacking}
                onPlayingChange={setIsVideoPlaying}
                defaultSearchQuery={buildBackingTrackQuery(song.name, song.artist)}
              />
            )}
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
          {videoMode === "original" ? (
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
          ) : (
            <YouTubeSection
              videoId={backingTrackId}
              songName={song.name}
              artist={song.artist}
              isSearching={isSearchingBacking}
              searchResults={backingResults}
              searchError={backingError}
              onSearch={handleBackingSearch}
              onSelectVideo={handleSelectBacking}
              onRemoveVideo={handleRemoveBacking}
              onPlayingChange={setIsVideoPlaying}
              defaultSearchQuery={buildBackingTrackQuery(song.name, song.artist)}
            />
          )}
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
