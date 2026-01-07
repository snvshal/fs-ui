import { FileSystemEntry } from "../types/file-system";

export async function verifyPermission(
  fileHandle: FileSystemHandle,
  readWrite: boolean = false,
) {
  const options: FileSystemHandlePermissionDescriptor = {
    mode: readWrite ? "readwrite" : "read",
  };

  if ((await fileHandle.queryPermission(options)) === "granted") {
    return true;
  }

  if ((await fileHandle.requestPermission(options)) === "granted") {
    return true;
  }

  return false;
}

export async function getDirectoryEntries(
  dirHandle: FileSystemDirectoryHandle,
  path: string[] = [],
): Promise<FileSystemEntry[]> {
  const entries: FileSystemEntry[] = [];

  for await (const [name, handle] of dirHandle.entries()) {
    entries.push({
      handle,
      name,
      kind: handle.kind,
      path: [...path, name],
    });
  }

  return entries.sort((a, b) => {
    // Folders first, then files
    if (a.kind === b.kind) {
      return a.name.localeCompare(b.name);
    }
    return a.kind === "directory" ? -1 : 1;
  });
}
