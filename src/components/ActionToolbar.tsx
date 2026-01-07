import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { FolderPlus, FilePlus } from "lucide-react";

export const ActionToolbar: React.FC = () => {
  const { setCreationState, selectedDirectory } = useFileSystem();

  const handleCreate = (type: "file" | "directory") => {
    setCreationState({
      type,
      parent: selectedDirectory || null,
    });
  };

  return (
    <div className="relative flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
      <button
        onClick={() => handleCreate("file")}
        className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        title="New File"
      >
        <FilePlus size={16} />
      </button>
      <button
        onClick={() => handleCreate("directory")}
        className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
        title="New Folder"
      >
        <FolderPlus size={16} />
      </button>
    </div>
  );
};
