import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import {
  File,
  Folder,
  FileText,
  Image as ImageIcon,
  Video,
  FileAudio,
  Terminal,
  FileCode,
} from "lucide-react";
import { FileSystemEntry } from "../types/file-system";
import { tc } from "../utils/tc";

export const FileIcon: React.FC<{
  name: string;
  kind: "file" | "directory";
  size?: number;
  className?: string;
}> = ({ name, kind, size = 16, className }) => {
  if (kind === "directory")
    return <Folder size={size} className={tc("text-blue-500", className)} />;

  // Simple extension check
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "webp":
      return (
        <ImageIcon size={size} className={tc("text-purple-400", className)} />
      );
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
      return <Video size={size} className={tc("text-red-400", className)} />;
    case "mp3":
    case "wav":
    case "flac":
    case "aac":
    case "ogg":
    case "m4a":
      return (
        <FileAudio size={size} className={tc("text-blue-400", className)} />
      );
    case "json":
    case "ts":
    case "tsx":
    case "js":
    case "mjs":
    case "cjs":
    case "jsx":
    case "css":
    case "html":
    case "py":
    case "java":
    case "cpp":
    case "c":
    case "go":
    case "rs":
    case "rb":
    case "php":
    case "swift":
    case "kt":
      return (
        <FileCode size={size} className={tc("text-amber-400", className)} />
      );
    case "md":
    case "txt":
      return (
        <FileText size={size} className={tc("text-neutral-400", className)} />
      );
    case "env":
    case "sh":
    case "ps1":
    case "csh":
    case "fish":
      return (
        <Terminal size={size} className={tc("text-indigo-400", className)} />
      );
    default:
      return <File size={size} className={tc("text-neutral-500", className)} />;
  }
};

export const FileGrid: React.FC = () => {
  const { entries, changeDirectory, openFile, currentPath } = useFileSystem();

  const handleEntryClick = async (entry: FileSystemEntry) => {
    if (entry.kind === "directory") {
      changeDirectory([...currentPath, entry.name]);
    } else {
      openFile(entry);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-neutral-500">
        <p>This folder is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid flex-1 grid-cols-2 content-start gap-4 overflow-y-auto p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {entries.map((entry) => (
        <div
          key={entry.name}
          onClick={() => handleEntryClick(entry)}
          className="group flex cursor-pointer flex-col items-center rounded-lg p-4 text-center transition-colors hover:bg-neutral-800"
        >
          <div className="transform transition-transform duration-200 group-hover:scale-110">
            <FileIcon
              name={entry.name}
              kind={entry.kind}
              size={48}
              className="mb-2"
            />
          </div>
          <span className="w-full truncate text-sm text-neutral-300 group-hover:text-white">
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  );
};
