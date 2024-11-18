"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import { Document } from "@/types/types";
import { Pencil1Icon } from "@radix-ui/react-icons";

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

interface TextEditorProps {
  mode: "mini" | "full";
  currentDocument?: Document;
  swapState: () => void;
  //mini
  resourceId?: string;
  fetchNotes?: (resourceId: string) => Promise<string>;
  saveNotes?: (resourceId: string, notes: string) => Promise<void>;
}

const TextEditor = ({
  mode,
  currentDocument,
  resourceId,
  fetchNotes,
  saveNotes,
  swapState,
}: TextEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setID] = useState<string | undefined>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  //mini
  const [showEditor, setShowEditor] = useState(false);
  const [isEditable, setIsEditable] = useState(false);
  const [hasLoadedNotes, setHasLoadedNotes] = useState(false);

  // load document or notes based on mode
  useEffect(() => {
    if (mode === "full" && currentDocument) {
      setTitle(currentDocument.name);
      setContent(currentDocument.text);
      setID(currentDocument.id);
    } else if (mode === "mini" && resourceId && fetchNotes) {
      fetchNotes(resourceId)
        .then((fetchedNotes) => {
          setContent(fetchedNotes || "");
          setShowEditor(!!fetchedNotes); // ?? is this even needed here?
          setHasLoadedNotes(true); // ?? do I add it here?
        })
        .catch((error) => console.error("Error fetching notes:", error));
    }
  }, [mode, currentDocument, resourceId, fetchNotes]);

  // save handler for content
  const handleSave = async () => {
    if (mode === "full" && (!title || !content)) {
      alert("Please provide both a title and content for the document.");
      return;
    }
    setIsUploading(true);
    setUploadComplete(false);

    try {
      if (mode === "mini" && resourceId && saveNotes) {
        await saveNotes(resourceId, content || "");
        setIsEditable(false);
        setShowEditor(false); //show editor if notes exist
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
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      setUploadComplete(true);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  // automatically reset uploade complete state after 3 seconds
  useEffect(() => {
    if (uploadComplete) {
      const timeout = setTimeout(() => setUploadComplete(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [uploadComplete]);

  // const handleUpload = async () => {
  //   if (!content || !title) {
  //     alert("Please provide both a title and content for the document.");
  //     return;
  //   }

  //   setIsUploading(true);
  //   setUploadComplete(false);

  //   try {
  //     const response = await fetch("/api/db", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         name: title,
  //         text: content,
  //         files: [],
  //         dateAdded: new Date().toISOString(),
  //       } as Document),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     console.log("Document uploaded", data);
  //     setUploadComplete(true);
  //   } catch (error) {
  //     console.error("Error uploading document:", error);
  //     alert("Failed to upload document.");
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  //for full only but idk if it should be here, i just kept it ??
  // const handleUpdate = async () => {
  //   if (mode === "full" && (!content || !title)) {
  //     alert("Please provide both a title and content for the document.");
  //     return;
  //   }

  //   if (!id) {
  //     console.error("Document ID is missing.");
  //     return;
  //   }

  //   setIsUploading(true);
  //   setUploadComplete(false);

  //   try {
  //     const response = await fetch("/api/db", {
  //       method: "PUT",
  //       body: JSON.stringify({
  //         id,
  //         name: title,
  //         text: content,
  //         files: [],
  //       }),
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //     });
  //     const data = await response.json();
  //     console.log("Document updated", data);
  //     setUploadComplete(true);
  //   } catch (error) {
  //     console.error("Error updating document:", error);
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  // for full
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
    clipboard: {
      matchVisual: false,
    },
  };

  return (
    <>
      {/* Full Mode Section */}
      {mode === "full" && (
        <div className="flex h-full max-w-full flex-col rounded-xl border-[1px] border-zinc-700 text-white">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
            className="text-md h-[5vh] w-full rounded-t-xl bg-bgSecondary px-2 font-bold outline-none"
          />

          <style>
            {`
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
        `}
          </style>

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
                  onClick={() => swapState()}
                  className="w-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Back
                </button>

                <button
                  onClick={handleSave} // Pass true if id exists (update), false otherwise (upload)
                  className="w-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          <style jsx>{`
            .loader {
              border: 4px solid #f3f3f3;
              border-top: 4px solid #3498db;
              border-radius: 50%;
              width: 24px;
              height: 24px;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
      {/* Mini Mode Section */}
      {mode === "mini" && (
        <div className="flex flex-col">
          {/* pencil icon */}
          <Pencil1Icon
            onClick={() => {
              setShowEditor((prev) => !prev); // Toggle editor visibility
              if (!showEditor) {
                setIsEditable(true); // Enable editing when the editor is shown
              } else {
                setIsEditable(false); // Disable editing when the editor is hidden
              }
            }}
            className="h-6 w-6 cursor-pointer text-blue-500 hover:text-blue-600"
            // title="Edit Notes"
          />

          {hasLoadedNotes && !showEditor && (
            <div className="existing-notes">
              <p>{content}</p>
            </div>
          )}

          {showEditor && (
            <div className="mt-4 flex flex-col">
              <textarea
                value={content}
                onChange={(e) => isEditable && setContent(e.target.value)}
                placeholder="Write your notes here..."
                readOnly={!isEditable}
                className={`h-32 w-full resize-none rounded-md bg-bgSecondary p-2 text-white ${
                  isEditable ? "cursor-text" : "cursor-not-allowed"
                }`}
              />
              {isEditable && (
                <button
                  onClick={handleSave} // Explicitly pass `false` for mini mode
                  className="mt-2 self-start rounded-full bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600"
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : "Save"}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default TextEditor;
