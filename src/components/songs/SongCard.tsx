"use client";

import { Music, Trash2, User, Timer } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SongRecord } from "@/lib/fileService";

interface SongCardProps {
  song: SongRecord;
  onClick: () => void;
  onDelete: () => void;
}

function formatPracticeTime(totalSeconds: number): string {
  if (totalSeconds < 60) return `${totalSeconds}s`;
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function SongCard({ song, onClick, onDelete }: SongCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] group"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 min-w-0">
            {song.youtubeVideoId ? (
              <img
                src={`https://img.youtube.com/vi/${song.youtubeVideoId}/mqdefault.jpg`}
                alt={song.name}
                className="h-16 w-16 rounded-lg object-cover shrink-0"
              />
            ) : (
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <Music className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold truncate" title={song.name}>
                {song.name}
              </p>
              {song.artist && (
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <User className="h-3 w-3" />
                  <span className="truncate">{song.artist}</span>
                </p>
              )}
              {song.totalPracticeSeconds > 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Timer className="h-3 w-3" />
                  {formatPracticeTime(song.totalPracticeSeconds)} practiced
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
