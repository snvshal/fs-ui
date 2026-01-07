import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import {
  File,
  Folder,
  FileText,
  Image as ImageIcon,
  Code,
  Play,
} from "lucide-react";
import { FileSystemEntry } from "../types/file-system";

const FileIcon: React.FC<{ name: string; kind: "file" | "directory" }> = ({
  name,
  kind,
}) => {
  if (kind === "directory")
    return <Folder size={48} className="mb-2 text-blue-500" />;

  // Simple extension check
  const ext = name.split(".").pop()?.toLowerCase();

  switch (ext) {
    case "png":
    case "jpg":
    case "jpeg":
    case "svg":
    case "webp":
      return <ImageIcon size={48} className="mb-2 text-purple-400" />;
    case "mp4":
    case "mov":
    case "avi":
    case "mkv":
    case "webm":
      return <Play size={48} className="mb-2 text-green-400" />;
    case "json":
    case "ts":
    case "tsx":
    case "js":
    case "jsx":
    case "css":
    case "html":
      return <Code size={48} className="mb-2 text-yellow-400" />;
    case "md":
    case "txt":
      return <FileText size={48} className="mb-2 text-neutral-400" />;
    default:
      return <File size={48} className="mb-2 text-neutral-500" />;
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
            <FileIcon name={entry.name} kind={entry.kind} />
          </div>
          <span className="w-full truncate text-sm text-neutral-300 group-hover:text-white">
            {entry.name}
          </span>
        </div>
      ))}
    </div>
  );
};
