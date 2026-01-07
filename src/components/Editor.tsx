import React, { useEffect, useState, useRef } from "react";
import { useFileSystem } from "../hooks/useFileSystem";
import { Save, X, FileCode, Eye, Code as CodeIcon } from "lucide-react";
import Editor, { OnMount } from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";
// @ts-ignore
import * as monaco from "monaco-editor";

export const FileEditor: React.FC = () => {
  const { selectedFile, readFile, saveFile, closeFile } = useFileSystem();
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      if (!selectedFile || selectedFile.kind !== "file") return;

      try {
        setIsLoading(true);
        const file = await readFile(
          selectedFile.handle as FileSystemFileHandle,
        );
        if (file instanceof File) {
          const text = await file.text();
          setContent(text);
          setOriginalContent(text);
        }
      } catch (err) {
        console.error("Failed to read file", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadContent();
    setPreviewMode(false); // Reset preview mode on file change
  }, [selectedFile, readFile]);



  // Ref for content to access latest value in event listener without re-binding
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  // Ref for selectedFile
  const selectedFileRef = useRef(selectedFile);
  useEffect(() => {
    selectedFileRef.current = selectedFile;
  }, [selectedFile]);

  useEffect(() => {
    const handleGlobalSave = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleGlobalSave);
    return () => window.removeEventListener('keydown', handleGlobalSave);
  }, [saveFile]);

  const handleSave = async () => {
    // Use refs to ensure we always have the latest state, 
    // even if called from a stale closure (like Monaco command)
    const currentFile = selectedFileRef.current;
    const currentContent = contentRef.current;

    if (!currentFile) return;
    try {
      setIsSaving(true);
      await saveFile(currentFile.handle as FileSystemFileHandle, currentContent);
      setOriginalContent(currentContent);
    } catch (err) {
      console.error("Failed to save", err);
      alert("Failed to save file. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = content !== originalContent;

  // Language detection
  const getLanguage = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "ts":
      case "tsx":
        return "typescript";
      case "js":
      case "mjs":
      case "cjs":
      case "jsx":
        return "javascript";
      case "html":
        return "html";
      case "css":
        return "css";
      case "json":
        return "json";
      case "md":
        return "markdown";
      case "yml":
      case "yaml":
        return "yaml";
      case "py":
        return "python";
      case "rs":
        return "rust";
      case "dockerfile":
        return "dockerfile";
      case "xml":
        return "xml";
      case "sql":
        return "sql";
      default:
        return "plaintext";
    }
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Disable validation (red squiggles)
    monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: true,
      noSyntaxValidation: true,
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      handleSave();
    });
  };

  const isMarkdown = selectedFile?.name.endsWith(".md");

  if (!selectedFile) return null;

  return (
    <div className="flex h-full flex-col bg-neutral-900">
      <div className="flex h-10 items-center justify-between border-b border-neutral-800 bg-neutral-900 px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileCode size={16} className="text-blue-400" />
            <span className="text-sm font-medium text-neutral-200">
              {selectedFile.name}
            </span>
          </div>
          {hasChanges && (
            <span
              className="h-2 w-2 rounded-full bg-blue-500"
              title="Unsaved changes"
            ></span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isMarkdown && (
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={clsx(
                "mr-2 flex items-center gap-1 rounded px-3 py-1 text-xs font-medium transition-colors",
                previewMode
                  ? "bg-purple-600 text-white"
                  : "bg-neutral-700 text-neutral-300 hover:text-white",
              )}
              title={previewMode ? "Show Source" : "Show Preview"}
            >
              {previewMode ? <CodeIcon size={14} /> : <Eye size={14} />}
              {previewMode ? "Source" : "Preview"}
            </button>
          )}
          {hasChanges && (
            <button
              onClick={handleSave}
              className={clsx(
                "mr-2 flex items-center gap-1 rounded px-3 py-1 text-xs font-medium transition-colors",
                hasChanges
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-neutral-400 hover:text-neutral-200",
              )}
              disabled={isSaving || !hasChanges}
            >
              <Save size={14} />
              Save
            </button>
          )}
          <button
            onClick={closeFile}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-1 items-center justify-center text-neutral-500">
          Loading...
        </div>
      ) : (
        <div className="relative flex-1 overflow-hidden">
          {previewMode && isMarkdown ? (
            <div className="prose prose-blue prose-invert h-[calc(100%-40px)] w-full max-w-none overflow-auto p-8 text-neutral-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <Editor
              height="100%"
              defaultLanguage={getLanguage(selectedFile.name)}
              value={content}
              onChange={(value) => setContent(value || "")}
              theme="vs-dark"
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                // wordWrap: "on",
                automaticLayout: true,
                renderValidationDecorations: "off", // Hide red squiggles

                // Disable all IntelliSense/suggestions
                quickSuggestions: false,
                parameterHints: { enabled: false },
                suggestOnTriggerCharacters: false,
                acceptSuggestionOnEnter: "off",
                // suggest: { neverAcceptOnCommitChar: true },

                // Disable hover tooltips completely
                hover: { enabled: false },

                // Disable other intrusive features
                showUnused: false,
                codeLens: false,
                // lightbulb: { enabled: false }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
