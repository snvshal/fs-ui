import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { Folder, File, ChevronRight, ChevronDown } from "lucide-react";
import { FileSystemEntry } from "../types/file-system";
import clsx from "clsx";

// interface FileTreeProps {
//     entries?: FileSystemEntry[];
//     depth?: number;
// }

const FileTreeItem: React.FC<{ entry: FileSystemEntry; depth: number }> = ({
  entry,
  depth,
}) => {
  const { openFile } = useFileSystem(); // Restored
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (entry.kind === "directory") {
      setIsOpen(!isOpen);
    } else {
      openFile(entry); // Call openFile
    }
  };

  const isDirectory = entry.kind === "directory";

  return (
    <div>
      <div
        className={clsx(
          "flex cursor-pointer select-none items-center px-2 py-1 text-sm hover:bg-neutral-800",
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
        <span className="truncate">{entry.name}</span>
      </div>
      {isOpen && isDirectory && (
        <FileTreeLevel
          parentHandle={entry.handle as FileSystemDirectoryHandle}
          depth={depth + 1}
          path={entry.path}
        />
      )}
    </div>
  );
};

// Recursive fetcher component
const FileTreeLevel: React.FC<{
  parentHandle: FileSystemDirectoryHandle;
  depth: number;
  path: string[];
}> = ({ parentHandle, depth, path }) => {
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
        <FileTreeItem key={entry.name} entry={entry} depth={depth} />
      ))}
    </div>
  );
};

export const FileTree: React.FC = () => {
  const { rootHandle } = useFileSystem();

  if (!rootHandle)
    return <div className="p-4 text-sm text-neutral-500">No folder opened</div>;

  // Use a top level recursive start
  return (
    <div className="flex flex-col">
      <FileTreeLevel parentHandle={rootHandle} depth={0} path={[]} />
    </div>
  );
};
