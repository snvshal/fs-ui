export interface FileSystemEntry {
  handle: FileSystemHandle;
  name: string;
  kind: "file" | "directory";
  path: string[]; // Path segments from root
  children?: FileSystemEntry[]; // Only for directories
}

export interface FileSystemState {
  rootHandle: FileSystemDirectoryHandle | null;
  currentPath: string[];
  entries: FileSystemEntry[]; // Entries in current view
  selectedFile: FileSystemEntry | null;
  isLoading: boolean;
  error: string | null;
}

export interface FileSystemContextType extends FileSystemState {
  openDirectory: () => Promise<void>;
  changeDirectory: (path: string[]) => void;
  navigateUp: () => void;
  openFile: (entry: FileSystemEntry) => void;
  closeFile: () => void;
  readFile: (handle: FileSystemFileHandle) => Promise<string | File>;
  saveFile: (handle: FileSystemFileHandle, content: string) => Promise<void>;
  createEntry: (name: string, kind: "file" | "directory") => Promise<void>;
  deleteEntry: (handle: FileSystemHandle) => Promise<void>;
}
