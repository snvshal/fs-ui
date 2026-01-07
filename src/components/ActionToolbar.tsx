import React, { useState } from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { FolderPlus, FilePlus } from "lucide-react";

export const ActionToolbar: React.FC = () => {
  const { createEntry } = useFileSystem();
  const [isCreating, setIsCreating] = useState<"file" | "folder" | null>(null);
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !isCreating) return;

    await createEntry(name, isCreating === "file" ? "file" : "directory");
    setIsCreating(null);
    setName("");
  };

  return (
    <div className="relative flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
      {!isCreating ? (
        <>
          <button
            onClick={() => setIsCreating("file")}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            title="New File"
          >
            <FilePlus size={16} />
          </button>
          <button
            onClick={() => setIsCreating("folder")}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            title="New Folder"
          >
            <FolderPlus size={16} />
          </button>
        </>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="animate-in fade-in slide-in-from-left-2 flex items-center gap-2 duration-200"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              isCreating === "file" ? "File name..." : "Folder name..."
            }
            className="w-32 rounded border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 focus:border-blue-500 focus:outline-none"
            autoFocus
            onBlur={() => !name && setIsCreating(null)}
            onKeyDown={(e) => e.key === "Escape" && setIsCreating(null)}
          />
        </form>
      )}
    </div>
  );
};
