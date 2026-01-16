import React, { useEffect, useState } from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { FileIcon } from "./FileGrid";
import { X } from "lucide-react";

export const Preview: React.FC = () => {
  const { selectedFile, readFile, closeFile } = useFileSystem();
  const [contentUrl, setContentUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedFile || selectedFile.kind !== "file") return;

      try {
        const file = await readFile(
          selectedFile.handle as FileSystemFileHandle,
        );
        if (
          file &&
          typeof file === "object" &&
          "size" in file &&
          "type" in file
        ) {
          // Create object URL
          const url = URL.createObjectURL(file);
          setContentUrl(url);
          setFileType(file.type);

          // Cleanup function to revoke URL when component unmounts or file changes
          return () => URL.revokeObjectURL(url);
        }
      } catch (err: any) {
        console.error("Failed to read file", err);
        setError(err.message);
      }
    };
    const cleanup = loadContent();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
  }, [selectedFile, readFile]);

  const isImage = (type: string | null, name: string) => {
    return (
      type?.startsWith("image/") ||
      /\.(png|jpg|jpeg|gif|svg|webp|bmp|ico)$/i.test(name)
    );
  };

  const isVideo = (type: string | null, name: string) => {
    return type?.startsWith("video/") || /\.(mp4|webm|ogg|mov)$/i.test(name);
  };

  const isAudio = (type: string | null, name: string) => {
    return (
      type?.startsWith("audio/") || /\.(mp3|wav|flac|aac|ogg|m4a)$/i.test(name)
    );
  };

  if (!selectedFile) return null;

  return (
    <div className="relative flex h-full flex-col bg-neutral-900">
      <div className="flex h-10 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-2">
        <div className="flex items-center gap-2">
          {<FileIcon name={selectedFile.name} kind="file" size={16} />}
          <span className="text-sm font-medium text-neutral-200">
            {selectedFile.name}
          </span>
        </div>
        <button
          onClick={closeFile}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          title="Close"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex h-[calc(100%-80px)] w-full items-center justify-center overflow-hidden p-4">
        {error ? (
          <div className="text-red-400">Error loading file: {error}</div>
        ) : contentUrl ? (
          isImage(fileType, selectedFile.name) ? (
            <img
              src={contentUrl}
              alt={selectedFile.name}
              className="max-h-full max-w-full object-contain shadow-lg"
            />
          ) : isVideo(fileType, selectedFile.name) ? (
            <video
              src={contentUrl}
              controls
              className="max-h-full max-w-full object-contain shadow-lg"
            />
          ) : isAudio(fileType, selectedFile.name) ? (
            <div className="w-full max-w-xl rounded-2xl p-6">
              <audio
                src={contentUrl}
                controls
                className="w-full"
                preload="metadata"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center text-neutral-500">
              <span className="mb-2 text-lg">
                Preview not available for this file type
              </span>
              <span className="font-mono text-xs">
                {fileType || "Unknown type"}
              </span>
            </div>
          )
        ) : (
          <div className="text-neutral-500">Loading...</div>
        )}
      </div>
    </div>
  );
};
