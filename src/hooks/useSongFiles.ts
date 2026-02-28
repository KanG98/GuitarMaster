"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FileRecord,
  uploadFile,
  getFiles,
  deleteFile,
  updateFileOrder,
} from "@/lib/fileService";

export function useSongFiles(songId: string) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getFiles(songId);
      setFiles(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load files");
    } finally {
      setIsLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

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
        const record = await uploadFile(songId, selectedFiles[i]);
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
    await deleteFile(songId, file.id);
    refresh();
  };

  const handleReorder = async (reordered: FileRecord[]) => {
    setFiles(reordered);
    await updateFileOrder(songId, reordered.map((f) => f.id));
  };

  return {
    files,
    isLoading,
    isUploading,
    uploadProgress,
    error,
    handleUpload,
    handleDeleteFile,
    handleReorder,
    refresh,
  };
}