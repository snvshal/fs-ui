import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { get, set } from "idb-keyval";
import {
  FileSystemContextType,
  FileSystemEntry,
  FileSystemState,
} from "../types/file-system";
import { getDirectoryEntries, verifyPermission } from "../utils/file-system";

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined,
);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<FileSystemState>({
    rootHandle: null,
    currentPath: [],
    entries: [],
    selectedFile: null,
    selectedDirectory: null, // Initial state
    creationState: null, // Initial state
    isLoading: false,
    error: null,
  });

  // Load persisted handle on mount
  useEffect(() => {
    const loadPersistedHandle = async () => {
      try {
        const rootHandle = await get<FileSystemDirectoryHandle>("rootHandle");
        if (rootHandle) {
          setState((prev) => ({ ...prev, rootHandle }));
        }
      } catch (err) {
        console.error("Failed to load persistence handle", err);
      }
    };
    loadPersistedHandle();
  }, []);

  const openDirectory = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const handle = await window.showDirectoryPicker();

      await set("rootHandle", handle);

      const entries = await getDirectoryEntries(handle, []);
      setState({
        rootHandle: handle,
        currentPath: [],
        entries,
        selectedFile: null,
        selectedDirectory: null,
        creationState: null,
        isLoading: false,
        error: null,
      });
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
      } else {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    }
  }, []);

  const changeDirectory = useCallback(
    async (path: string[]) => {
      if (!state.rootHandle) return;

      try {
        setState((prev) => ({ ...prev, isLoading: true }));

        let currentDir = state.rootHandle;
        for (const part of path) {
          currentDir = await currentDir.getDirectoryHandle(part);
        }

        const entries = await getDirectoryEntries(currentDir, path);
        setState((prev) => ({
          ...prev,
          currentPath: path,
          entries,
          selectedFile: null,
          selectedDirectory: null, // Should we reset this? Probably yes, or keep it if it's within the path? Let's reset for simplicity.
          creationState: null,
          isLoading: false,
        }));
      } catch (err: any) {
        setState((prev) => ({ ...prev, error: err.message, isLoading: false }));
      }
    },
    [state.rootHandle],
  );

  const navigateUp = useCallback(() => {
    if (state.currentPath.length === 0) return;
    const newPath = state.currentPath.slice(0, -1);
    changeDirectory(newPath);
  }, [state.currentPath, changeDirectory]);

  const openFile = useCallback(
    async (entry: FileSystemEntry) => {
      // Update path to the file's PARENT path to avoid treating file as directory in breadcrumbs
      const parentPath = entry.path.slice(0, -1);

      setState((prev) => ({
        ...prev,
        selectedFile: entry,
        isLoading: true, // Show loading while we sync grid
        currentPath: parentPath,
      }));

      // Ensure the grid reflects the file's folder, even if we clicked from Sidebar
      try {
        let currentDir = state.rootHandle!;
        for (const part of parentPath) {
          currentDir = await currentDir.getDirectoryHandle(part);
        }
        const entries = await getDirectoryEntries(currentDir, parentPath);
        setState((prev) => ({ ...prev, entries, isLoading: false }));
      } catch (error) {
        console.error("Failed to sync grid with file location", error);
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [state.rootHandle],
  );

  const closeFile = useCallback(() => {
    setState((prev) => ({ ...prev, selectedFile: null }));
  }, []);

  const readFile = async (handle: FileSystemFileHandle) => {
    if (await verifyPermission(handle)) {
      const file = await handle.getFile();
      // RETURN FILE OBJECT NOW
      return file;
    }
    throw new Error("Permission denied");
  };

  const saveFile = async (handle: FileSystemFileHandle, content: string) => {
    if (await verifyPermission(handle, true)) {
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
    } else {
      throw new Error("Permission denied");
    }
  };

  const createEntry = async (
    name: string,
    kind: "file" | "directory",
    parentHandle?: FileSystemDirectoryHandle,
  ) => {
    if (!state.rootHandle) return;

    try {
      let targetDir = parentHandle;

      if (!targetDir) {
        // Fallback to current path if no handle provided
        targetDir = state.rootHandle;
        for (const part of state.currentPath) {
          targetDir = await targetDir.getDirectoryHandle(part);
        }
      }

      if (await verifyPermission(targetDir, true)) {
        if (kind === "file") {
          await targetDir.getFileHandle(name, { create: true });
        } else {
          await targetDir.getDirectoryHandle(name, { create: true });
        }

        // Refresh grid ONLY if we modified the current directory
        // We can't easily check identity of handles, but if no parentHandle was passed, we definitely used current path.
        if (!parentHandle) {
          const entries = await getDirectoryEntries(
            targetDir,
            state.currentPath,
          );
          setState((prev) => ({ ...prev, entries }));
        }
      }
    } catch (err: any) {
      console.error("Create failed", err);
      setState((prev) => ({ ...prev, error: `Create failed: ${err.message}` }));
      throw err; // Re-throw so UI knows it failed/succeeded
    }
  };

  const deleteEntry = async (handle: FileSystemHandle) => {
    if (!state.rootHandle) return;

    try {
      let currentDir = state.rootHandle;
      for (const part of state.currentPath) {
        currentDir = await currentDir.getDirectoryHandle(part);
      }

      if (await verifyPermission(currentDir, true)) {
        await currentDir.removeEntry(handle.name, { recursive: true });

        const entries = await getDirectoryEntries(
          currentDir,
          state.currentPath,
        );
        setState((prev) => ({ ...prev, entries }));

        if (state.selectedFile?.name === handle.name) {
          closeFile();
        }
      }
    } catch (err: any) {
      console.error("Delete failed", err);
      setState((prev) => ({ ...prev, error: `Delete failed: ${err.message}` }));
    }
  };

  const renameEntry = async (handle: FileSystemHandle, newName: string) => {
    // @ts-ignore
    if (handle.move) {
      try {
        await (handle as any).move(newName);
        let currentDir = state.rootHandle!;
        for (const part of state.currentPath) {
          currentDir = await currentDir.getDirectoryHandle(part);
        }
        const entries = await getDirectoryEntries(
          currentDir,
          state.currentPath,
        );
        setState((prev) => ({ ...prev, entries }));
        return;
      } catch (e) {
        console.warn("Native move failed/not supported", e);
      }
    }
    if (handle.kind === "file") {
      try {
        const oldFile = await (handle as FileSystemFileHandle).getFile();
        const content = await oldFile.text();
        let currentDir = state.rootHandle!;
        for (const part of state.currentPath) {
          currentDir = await currentDir.getDirectoryHandle(part);
        }
        const newHandle = await currentDir.getFileHandle(newName, {
          create: true,
        });
        const writable = await newHandle.createWritable();
        await writable.write(content);
        await writable.close();
        await currentDir.removeEntry(handle.name);
        const entries = await getDirectoryEntries(
          currentDir,
          state.currentPath,
        );
        setState((prev) => ({ ...prev, entries }));
      } catch (err: any) {
        console.error("Rename fallback failed", err);
        setState((prev) => ({
          ...prev,
          error: `Rename failed: ${err.message}`,
        }));
      }
    } else {
      setState((prev) => ({
        ...prev,
        error: "Renaming directories not supported in this browser version",
      }));
    }
  };

  // Track last clicked folder
  // Note: We use the full entry object to track selection. Comparison should be done by path string.
  const setSelectedDirectory = useCallback((entry: FileSystemEntry | null) => {
    setState((prev) => ({ ...prev, selectedDirectory: entry }));
  }, []);

  const setCreationState = useCallback(
    (
      state: {
        type: "file" | "directory";
        parent: FileSystemEntry | null;
      } | null,
    ) => {
      setState((prev) => ({ ...prev, creationState: state }));
    },
    [],
  );

  return (
    <FileSystemContext.Provider
      value={{
        ...state,
        openDirectory,
        changeDirectory,
        navigateUp,
        openFile,
        closeFile,
        readFile,
        saveFile,
        createEntry,
        deleteEntry,
        // @ts-ignore
        renameEntry,
        setSelectedDirectory,
        setCreationState,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};
