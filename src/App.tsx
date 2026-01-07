import { useEffect } from "react";
import { FileSystemProvider } from "./context/FileSystemContext";
import { Layout } from "./components/Layout";
import { Breadcrumbs } from "./components/Breadcrumbs";
import { FileGrid } from "./components/FileGrid";
import { FileEditor as Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { useFileSystem } from "./hooks/useFileSystem";

const MainView = () => {
  const { selectedFile, error, openDirectory } = useFileSystem();

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        openDirectory();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [openDirectory]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 text-red-400">
        <h2 className="mb-2 text-xl font-bold">Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-neutral-800 px-4 py-2 text-neutral-200 hover:bg-neutral-700"
        >
          Reload
        </button>
      </div>
    );
  }

  if (selectedFile) {
    if (selectedFile.kind === "file") {
      // Simple extension check to decide Preview vs Editor
      // For now, assume everything is text unless image
      const ext = selectedFile.name.split(".").pop()?.toLowerCase();
      const previewExts = [
        "png",
        "jpg",
        "jpeg",
        "gif",
        "svg",
        "webp",
        "mp4",
        "webm",
        "ogg",
        "mov",
      ];

      if (ext && previewExts.includes(ext)) {
        return <Preview />;
      }
      return <Editor />;
    }
    return <Preview />;
  }

  return <FileGrid />;
};

function App() {
  return (
    <>
      <div className="md:hidden fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-900 p-6 text-center text-neutral-400">
        <h2 className="text-xl font-bold text-white mb-2">Desktop Only</h2>
        <p>This application mimics a desktop environment and is not available on mobile devices and small screens.</p>
      </div>
      <div className="hidden md:block h-full">
        <FileSystemProvider>
          <Layout>
            <Breadcrumbs />
            <MainView />
          </Layout>
        </FileSystemProvider>
      </div>
    </>
  );
}

export default App;
