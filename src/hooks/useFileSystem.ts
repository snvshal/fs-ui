import { createContext, useContext } from "react";
import { FileSystemContextType } from "../types/file-system";

export const FileSystemContext = createContext<
  FileSystemContextType | undefined
>(undefined);

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (context === undefined) {
    throw new Error("useFileSystem must be used within a FileSystemProvider");
  }
  return context;
};
