import React from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { ChevronRight, Home } from "lucide-react";
import clsx from "clsx";

export const Breadcrumbs: React.FC = () => {
  const { currentPath, changeDirectory, rootHandle } = useFileSystem();

  const handleNavigate = (index: number) => {
    // Navigate to path up to index
    const newPath = currentPath.slice(0, index + 1);
    changeDirectory(newPath);
  };

  const handleHome = () => {
    changeDirectory([]);
  };

  if (!rootHandle) return null;

  return (
    <div className="flex h-10 items-center border-b border-neutral-800 bg-neutral-900 p-3 text-sm text-neutral-400">
      <button
        onClick={handleHome}
        className="flex items-center transition-colors hover:text-neutral-200"
        title={rootHandle.name}
      >
        <Home size={16} className="mr-1" />
        <span className="font-semibold">{rootHandle.name}</span>
      </button>

      {currentPath.map((part, index) => (
        <React.Fragment key={index + part}>
          <ChevronRight size={14} className="mx-1 text-neutral-600" />
          <button
            onClick={() => handleNavigate(index)}
            className={clsx(
              "max-w-[150px] truncate transition-colors hover:text-neutral-200",
              index === currentPath.length - 1 &&
                "cursor-default font-medium text-neutral-200",
            )}
            disabled={index === currentPath.length - 1}
          >
            {part}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};
