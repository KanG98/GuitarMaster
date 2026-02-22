"use client";

import { useState } from "react";
import { Youtube, Search, Link, X, Pencil, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { YouTubeSearchResult, extractVideoId, buildGuitarTabQuery } from "@/lib/youtubeService";
import { YouTubePlayer } from "./YouTubePlayer";

interface YouTubeSectionProps {
  videoId: string | null;
  songName: string;
  artist: string;
  isSearching: boolean;
  searchResults: YouTubeSearchResult[];
  searchError?: string | null;
  onSearch: (query: string) => void;
  onSelectVideo: (videoId: string) => void;
  onRemoveVideo: () => void;
}

export function YouTubeSection({
  videoId,
  songName,
  artist,
  isSearching,
  searchResults,
  searchError,
  onSearch,
  onSelectVideo,
  onRemoveVideo,
}: YouTubeSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);

  const handlePasteUrl = () => {
    const extracted = extractVideoId(urlInput);
    if (extracted) {
      onSelectVideo(extracted);
      setUrlInput("");
      setUrlError(null);
      setIsEditing(false);
    } else {
      setUrlError("Invalid YouTube URL");
    }
  };

  const handleSearchDefault = () => {
    onSearch(buildGuitarTabQuery(songName, artist));
  };

  const handleSelectResult = (result: YouTubeSearchResult) => {
    onSelectVideo(result.videoId);
    setIsEditing(false);
  };

  const handleRemove = () => {
    onRemoveVideo();
    setIsEditing(false);
  };

  // Searching state
  if (isSearching && !videoId) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Searching YouTube...
      </div>
    );
  }

  // Has video — show player
  if (videoId && !isEditing) {
    return (
      <div className="space-y-1">
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-3 w-3 mr-1" />
            Edit
          </Button>
        </div>
        <YouTubePlayer videoId={videoId} />
      </div>
    );
  }

  // Edit mode or no video — show controls
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Youtube className="h-4 w-4" />
          <span>{videoId ? "Change video" : "No video linked"}</span>
        </div>
        {isEditing && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-muted-foreground"
            onClick={() => setIsEditing(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Current video preview in edit mode */}
      {videoId && isEditing && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full aspect-video rounded-lg"
        />
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSearchDefault}
          disabled={isSearching}
        >
          {isSearching ? (
            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
          ) : (
            <Search className="h-3 w-3 mr-1" />
          )}
          Search YouTube
        </Button>
        {videoId && isEditing && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={handleRemove}
          >
            <X className="h-3 w-3 mr-1" />
            Remove
          </Button>
        )}
      </div>

      {/* Paste URL input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2">
          <Link className="h-3 w-3 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => { setUrlInput(e.target.value); setUrlError(null); }}
            onKeyDown={(e) => { if (e.key === "Enter" && urlInput.trim()) handlePasteUrl(); }}
            placeholder="Paste YouTube URL..."
            className="flex-1 text-sm bg-transparent border-b border-muted-foreground/20 focus:border-primary outline-none py-1"
          />
        </div>
        {urlInput.trim() && (
          <Button variant="outline" size="sm" onClick={handlePasteUrl}>
            Set
          </Button>
        )}
      </div>
      {urlError && <p className="text-xs text-destructive">{urlError}</p>}

      {/* Search error */}
      {searchError && (
        <p className="text-xs text-destructive">{searchError}</p>
      )}

      {/* Search results */}
      {searchResults.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Select a video:</p>
          <div className="space-y-1">
            {searchResults.map((result) => (
              <button
                key={result.videoId}
                onClick={() => handleSelectResult(result)}
                className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors text-left"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={result.thumbnail}
                  alt={result.title}
                  className="w-20 h-14 object-cover rounded shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.channelTitle}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
