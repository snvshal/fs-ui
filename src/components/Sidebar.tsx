import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { FolderOpen, FolderCog } from "lucide-react";
import { FileTree } from "./FileTree";
import { ActionToolbar } from "./ActionToolbar";

export const Sidebar: React.FC = () => {
  const { openDirectory, rootHandle } = useFileSystem();

  return (
    <aside className="group flex h-full w-64 flex-col border-r border-neutral-800 bg-neutral-900">
      <div className="z-10 flex h-10 items-center justify-between border-b border-neutral-800 bg-neutral-900 p-2 text-xs font-bold tracking-wider text-neutral-500">
        <button
          onClick={openDirectory}
          className="flex items-center gap-2 text-neutral-500 transition-opacity hover:text-neutral-300 uppercase"
          title="Switch Folder"
        >
          <span>File Explorer</span>
          <FolderCog size={16} className="opacity-0 hover:text-neutral-300 group-hover:opacity-100" />
        </button>
      </div>

      {!rootHandle && (
        <div className="flex flex-1 flex-col items-center justify-center p-4 text-center">
          <p className="mb-4 text-sm text-neutral-400">
            You have not opened a folder yet.
          </p>
          <button
            onClick={openDirectory}
            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700"
          >
            <FolderOpen size={16} />
            Open Folder
          </button>
        </div>
      )}

      {rootHandle && (
        <>
          <div className="flex h-10 items-center justify-between truncate border-b border-neutral-800 p-2 text-xs font-bold uppercase text-neutral-300">
            <span title={rootHandle.name}>{rootHandle.name}</span>
            <ActionToolbar />
          </div>
          <div className="flex-1 overflow-y-auto pb-10">
            <FileTree />
          </div>
        </>
      )}
    </aside>
  );
};
