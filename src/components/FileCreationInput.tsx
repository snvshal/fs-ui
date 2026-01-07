import React, { useState, useEffect, useRef } from "react";
import { Folder, File } from "lucide-react";

interface FileCreationInputProps {
  type: "file" | "directory";
  depth: number;
  onConfirm: (name: string) => void;
  onCancel: () => void;
}

export const FileCreationInput: React.FC<FileCreationInputProps> = ({
  type,
  depth,
  onConfirm,
  onCancel,
}) => {
  const [name, setName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onConfirm(name);
    } else {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onCancel();
      e.stopPropagation();
    }
    e.stopPropagation(); // Prevent global shortcuts like Ctrl+S/O
  };

  return (
    <div
      className="flex items-center gap-2 border-l border-neutral-700 bg-neutral-800/50 py-1 pr-2"
      style={{ paddingLeft: `${depth * 12 + 24}px`, marginLeft: "1px" }} // Align with tree
    >
      <span className="text-neutral-400">
        {type === "file" ? <File size={16} /> : <Folder size={16} />}
      </span>
      <form onSubmit={handleSubmit} className="flex-1">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={`Name...`}
          className="h-6 w-full rounded border border-blue-500 bg-neutral-900 px-2 text-sm text-neutral-200 outline-none placeholder:text-neutral-600"
          onKeyDown={handleKeyDown}
          onBlur={() => {
            // Delay cancel slightly to allow form submit if clicking 'enter' ?
            // Actually blurring often cancels in VS Code, but let's keep it safe.
            // If we tap out, we cancel.
            if (!name.trim()) onCancel();
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </form>
    </div>
  );
};
