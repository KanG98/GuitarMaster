"use client";

import { Music, Trash2, User, Timer, ArrowRightLeft, Pin, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SongRecord } from "@/lib/fileService";
import { formatPracticeTime } from "@/lib/utils";

interface SongCardProps {
  song: SongRecord;
  onClick: () => void;
  onTogglePractice?: () => void;
  onTogglePin?: () => void;
  deleteMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  highlighted?: boolean;
}

export function SongCard({
  song,
  onClick,
  onTogglePractice,
  onTogglePin,
  deleteMode,
  isSelected,
  onToggleSelect,
  highlighted,
}: SongCardProps) {
  const hasThumb = !!song.youtubeVideoId;

  const handleClick = () => {
    if (deleteMode && onToggleSelect) {
      onToggleSelect();
    } else {
      onClick();
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-shadow duration-200 hover:shadow-md group relative overflow-hidden ${
        deleteMode && isSelected ? "ring-2 ring-destructive" : ""
      } ${!deleteMode && highlighted ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""}`}
      onClick={handleClick}
    >
      {hasThumb && (
        <>
          <img
            src={`https://img.youtube.com/vi/${song.youtubeVideoId}/hqdefault.jpg`}
            alt={song.name}
            className="absolute left-8 top-[44px] w-16 h-16 rounded-lg object-cover
              group-hover:left-0 group-hover:top-0 group-hover:w-full group-hover:h-full group-hover:rounded-xl
              transition-all duration-[600ms] ease-out-expo
              will-change-[left,top,width,height,transform]"
          />
          <div className="absolute inset-0 rounded-xl bg-[linear-gradient(to_right,transparent,oklch(1_0_0/10%)_80%,oklch(1_0_0/60%)_92%,oklch(1_0_0/95%))]
            opacity-0 group-hover:opacity-100
            transition-opacity duration-[600ms] ease-out-expo pointer-events-none" />
        </>
      )}

      {deleteMode && (
        <div
          className={`absolute top-3 right-3 z-20 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-destructive border-destructive"
              : "border-foreground/30 bg-background/60"
          }`}
        >
          {isSelected && <Check className="h-3 w-3 text-destructive-foreground" />}
        </div>
      )}

      <CardContent className="p-5 pl-8 relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-5 min-w-0">
            {hasThumb ? (
              <div className="w-16 h-16 shrink-0" aria-hidden="true" />
            ) : (
              <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                <Music className="h-5 w-5 text-primary" />
              </div>
            )}
            <div className="min-w-0 group-hover:translate-x-4 group-hover:opacity-0 transition-all duration-[600ms] ease-out-expo">
              <p
                className="font-semibold truncate transition-colors duration-[600ms]"
                title={song.name}
              >
                {song.name}
              </p>
              {song.artist && (
                <p className="text-sm flex items-center gap-1 mt-0.5 text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate">{song.artist}</span>
                </p>
              )}
              {song.totalPracticeSeconds > 0 && (
                <p className="text-xs flex items-center gap-1 mt-0.5 text-muted-foreground">
                  <Timer className="h-3 w-3" />
                  {formatPracticeTime(song.totalPracticeSeconds)} practiced
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-0.5 shrink-0 group-hover:translate-x-4 transition-transform duration-[600ms] ease-out-expo">
            {onTogglePin && (
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity ${
                  song.pinned
                    ? "text-primary opacity-100"
                    : "text-muted-foreground hover:text-primary"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin();
                }}
                title={song.pinned ? "Unpin" : "Pin to top"}
              >
                <Pin className={`h-4 w-4 ${song.pinned ? "fill-primary" : ""}`} />
              </Button>
            )}
            {onTogglePractice && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePractice();
                }}
                title={song.practicing ? "Move to Songs" : "Move to Practices"}
              >
                <ArrowRightLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
