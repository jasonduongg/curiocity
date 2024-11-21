"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Document, ResourceMeta } from "@/types/types";
import TagSection from "@/components/DocumentComponents/TagSection";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TextEditorProps {
  mode: "mini" | "full";
  currentDocument?: Document;
  resourceMeta?: ResourceMeta;
  handleBack: () => void;
  onNotesUpdate?: (resourceId: string, newNotes: string) => void; // Add callback prop
}

const TextEditor = ({
  mode,
  currentDocument,
  resourceMeta,
  handleBack,
  onNotesUpdate,
}: TextEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setID] = useState<string | undefined>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    if (mode === "full" && currentDocument) {
      setTitle(currentDocument.name);
      setContent(currentDocument.text);
      setID(currentDocument.id);
    } else if (mode === "mini" && resourceMeta) {
      setContent(resourceMeta.notes || "");
    }
  }, [mode, currentDocument, resourceMeta]);

  const handleSave = async () => {
    if (mode === "full" && (!title || !content)) {
      alert("Please provide both a title and content for the document.");
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);

    try {
      if (mode === "mini" && resourceMeta) {
        await fetch(`/api/db/ResourceMetaNotes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: resourceMeta.id, notes: content }),
        });
      } else if (mode === "full") {
        await fetch("/api/db", {
          method: id ? "PUT" : "POST",
          body: JSON.stringify({
            id: id || undefined,
            name: title,
            text: content,
            files: [],
            dateAdded: new Date().toISOString(),
            lastOpened: new Date().toISOString(),
          } as Document),
          headers: { "Content-Type": "application/json" },
        });
      }
      if (onNotesUpdate) {
        onNotesUpdate(resourceMeta.id, content);
      }
      setUploadComplete(true);
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save content.");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (uploadComplete) {
      const timeout = setTimeout(() => setUploadComplete(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [uploadComplete]);

  const modules = {
    toolbar: [
      [{ header: "1" }, { header: "2" }, { font: [] }],
      [{ size: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
      ],
      ["link", "image", "video"],
      ["clean"],
    ],
    clipboard: { matchVisual: false },
  };

  if (mode === "full") {
    return (
      <div className="flex h-full max-w-full flex-col rounded-xl border-[1px] border-zinc-700 text-white">
        {id && (
          <TagSection documentId={id} initialTags={currentDocument?.tags} />
        )}
        <div className="flex flex-grow flex-col">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="text-md h-[5vh] w-full rounded-t-xl bg-bgSecondary px-2 font-bold outline-none"
          />
          <style>{`
            .ql-toolbar {
              position: sticky;
              top: 0;
              z-index: 10;
              background-color: #130E16;
              border: none !important;
              border-top: 1px solid #333333 !important;
              border-bottom: 1px solid #333333 !important; 
            }
            .ql-toolbar .ql-stroke {
              stroke: #fff;
            }
            .ql-toolbar .ql-fill {
              fill: #fff;
            }
            .ql-toolbar .ql-picker,
            .ql-toolbar .ql-picker-label,
            .ql-toolbar .ql-picker-options {
              color: #fff;
            }
            .ql-container {
              border: none !important;
            }
            .ql-editor {
              border: none !important;
            }
          `}</style>
          <ReactQuill
            className="scrollbar-hide h-full max-w-full overflow-y-auto bg-bgSecondary text-white"
            formats={[
              "header",
              "font",
              "size",
              "bold",
              "italic",
              "underline",
              "strike",
              "blockquote",
              "list",
              "bullet",
              "indent",
              "link",
              "image",
              "video",
            ]}
            placeholder="Write something amazing..."
            modules={modules}
            onChange={setContent}
            value={content}
          />
          <div className="flex h-[10vh] items-center justify-end space-x-4 rounded-b-xl bg-bgSecondary p-4">
            {isUploading ? (
              <div className="flex items-center">
                <div className="loader mr-2"></div>
                <span>Uploading...</span>
              </div>
            ) : uploadComplete ? (
              <span className="font-bold text-green-500">
                &#10003; Uploaded!
              </span>
            ) : (
              <div className="flex w-full flex-grow space-x-2 p-2">
                <button
                  onClick={() => {
                    handleBack();
                  }}
                  className="w-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Back
                </button>
                <button
                  onClick={handleSave}
                  className="w-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (mode === "mini") {
    return (
      <div className="flex flex-col px-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full rounded-md border-[1px] border-zinc-700 bg-transparent px-2 py-2 text-xs text-white"
        />
        <div className="mt-2 flex w-full justify-end">
          <button
            onClick={handleSave}
            className="rounded-md border-[1px] border-zinc-700 px-2 py-1 text-xs text-white"
          >
            Save Notes
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TextEditor;
