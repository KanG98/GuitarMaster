"use client";

import { useRef, useState } from "react";
import { ArrowLeft, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileGallery } from "@/components/viewer/FileGallery";
import { FileViewer } from "@/components/viewer/FileViewer";
import { PracticeTimer } from "./PracticeTimer";
import { YouTubeSection } from "./YouTubeSection";
import { SongRecord, updatePracticeTime } from "@/lib/fileService";
import { useSongFiles } from "@/hooks/useSongFiles";
import { useYouTubeSearch } from "@/hooks/useYouTubeSearch";

interface SongDetailProps {
  song: SongRecord;
  onBack: () => void;
  onDeleteSong: () => void;
}

export function SongDetail({ song, onBack, onDeleteSong }: SongDetailProps) {
  const [viewIndex, setViewIndex] = useState<number | null>(null);
  const practiceSecondsRef = useRef(song.totalPracticeSeconds);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
