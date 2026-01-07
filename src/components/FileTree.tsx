import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { Folder, File, ChevronRight, ChevronDown } from "lucide-react";
import { FileSystemEntry } from "../types/file-system";
import clsx from "clsx";

const FileTreeItem: React.FC<{
  entry: FileSystemEntry;
  depth: number;
  parentEntry: FileSystemEntry | null;
}> = ({ entry, depth, parentEntry }) => {
  const {
    openFile,
    createEntry,
    selectedDirectory,
    setSelectedDirectory,
    creationState,
    setCreationState,
  } = useFileSystem();
  const [isOpen, setIsOpen] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // Check if we are the parent of the new item being created
  const isCreatingChild =
    creationState?.parent?.path.join("/") === entry.path.join("/");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entry.kind === "directory") {
      setIsOpen(!isOpen);
      setSelectedDirectory(entry);
    } else {
      openFile(entry);
      // When clicking a file, select its parent directory
      setSelectedDirectory(parentEntry);
    }
  };

  const handleCreateConfirm = async (name: string) => {
    if (!creationState) return;
    try {
      await createEntry(
        name,
        creationState.type,
        entry.handle as FileSystemDirectoryHandle,
      );
      setCreationState(null);
      setRefreshTrigger((prev) => prev + 1);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to create entry", error);
    }
  };

  const isDirectory = entry.kind === "directory";
  const isSelected = selectedDirectory?.path.join("/") === entry.path.join("/");

  // Auto-open if we are creating a child
  React.useEffect(() => {
    if (isCreatingChild && !isOpen) {
      setIsOpen(true);
    }
  }, [isCreatingChild, isOpen]);

  return (
    <div>
      <div
        className={clsx(
          "group flex cursor-pointer select-none items-center px-2 py-1 text-sm",
          isSelected
            ? "bg-neutral-800 text-neutral-200"
            : "text-neutral-400 hover:bg-neutral-800",
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="mr-1 opacity-70">
          {isDirectory &&
            (isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
          {!isDirectory && <div className="w-[14px]" />}
        </span>
        <span className="mr-2 text-blue-400">
          {isDirectory ? (
            <Folder size={16} />
          ) : (
            <File size={16} className="text-neutral-400" />
          )}
        </span>
        <span className="flex-1 truncate">{entry.name}</span>
      </div>

      {isOpen && isDirectory && (
        <>
          {/* If we are the targeted parent, show input here */}
          {isCreatingChild && (
            <React.Suspense fallback={null}>
              <FileCreationInput
                type={creationState!.type}
                depth={depth + 1}
                onConfirm={handleCreateConfirm}
                onCancel={() => setCreationState(null)}
              />
            </React.Suspense>
          )}
          <FileTreeLevel
            key={refreshTrigger} // Force re-render on refresh
            parentHandle={entry.handle as FileSystemDirectoryHandle}
            depth={depth + 1}
            path={entry.path}
            parentEntry={entry}
          />
        </>
      )}
    </div>
  );
};

// Lazy load creation input to avoid circular dependency issues if any
const FileCreationInput = React.lazy(() =>
  import("./FileCreationInput").then((m) => ({ default: m.FileCreationInput })),
);

// Recursive fetcher component
const FileTreeLevel: React.FC<{
  parentHandle: FileSystemDirectoryHandle;
  depth: number;
  path: string[];
  parentEntry: FileSystemEntry | null;
}> = ({ parentHandle, depth, path, parentEntry }) => {
  const [entries, setEntries] = React.useState<FileSystemEntry[]>([]);

  React.useEffect(() => {
    const fetchEntries = async () => {
      const { getDirectoryEntries } = await import("../utils/file-system");
      const items = await getDirectoryEntries(parentHandle, path);
      setEntries(items);
    };
    fetchEntries();
  }, [parentHandle]);

  return (
    <div>
      {entries.map((entry) => (
        <FileTreeItem
          key={entry.name}
          entry={entry}
          depth={depth}
          parentEntry={parentEntry}
        />
      ))}
    </div>
  );
};

export const FileTree: React.FC = () => {
  const {
    rootHandle,
    creationState,
    setCreationState,
    createEntry,
    setSelectedDirectory,
  } = useFileSystem();
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);

  // If creation state parent is null or undefined (falsy), and we have a creation state, it means root level
  const isCreatingAtRoot = creationState && !creationState.parent;

  const handleCreateConfirm = async (name: string) => {
    if (!creationState || !rootHandle) return;
    try {
      await createEntry(name, creationState.type, undefined); // undefined = root
      setCreationState(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to create entry at root", error);
    }
  };

  if (!rootHandle)
    return <div className="p-4 text-sm text-neutral-500">No folder opened</div>;

  return (
    <div
      className="flex h-full flex-col"
      onClick={() => setSelectedDirectory(null)} // Clicking empty space selects root
    >
      {isCreatingAtRoot && (
        <React.Suspense fallback={null}>
          <FileCreationInput
            type={creationState!.type}
            depth={0}
            onConfirm={handleCreateConfirm}
            onCancel={() => setCreationState(null)}
          />
        </React.Suspense>
      )}
      <FileTreeLevel
        key={refreshTrigger}
        parentHandle={rootHandle}
        depth={0}
        path={[]}
        parentEntry={null}
      />
    </div>
  );
};
