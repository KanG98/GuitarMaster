"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, Plus, FileImage, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  error: string | null;
  compact?: boolean;
}

const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "application/pdf",
];

export function UploadZone({
  onFileSelected,
  isUploading,
  error,
  compact = false,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        return;
      }
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [handleFile]
  );

  if (compact) {
    return (
      <div className="w-full">
        <div
          className={cn(
            "border border-dashed rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer transition-all",
            isDragging && "border-primary bg-primary/5",
            isUploading && "pointer-events-none opacity-60"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? (
            <>
              <div className="h-4 w-4 rounded-full border-2 border-muted border-t-primary animate-spin" />
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </>
          ) : (
            <Button variant="ghost" size="sm" className="gap-1" type="button">
              <Plus className="h-4 w-4" />
              Add File
            </Button>
          )}
        </div>

        {error && (
          <div className="mt-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
          className="hidden"
          onChange={handleInputChange}
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <Card
        className={cn(
          "w-full cursor-pointer transition-all duration-200",
          isDragging && "border-primary bg-primary/5 scale-[1.02]",
          isUploading && "pointer-events-none opacity-60"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
          {isUploading ? (
            <>
              <div className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
              <div className="text-center space-y-1">
                <p className="font-medium">Uploading...</p>
                <p className="text-sm text-muted-foreground">
                  Saving your file
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-3">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-medium">
                  Drag & drop your guitar tab here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileImage className="h-3.5 w-3.5" />
                  PNG, JPG, WebP
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  PDF
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.gif,.pdf"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
