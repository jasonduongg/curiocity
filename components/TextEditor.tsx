"use client";

import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Button from "./Button";

type newDocument = {
  id?: string;
  name: string;
  files: Array<string>;
  text: string;
};

interface TextEditorProps {
  currentDocument?: newDocument;
  swapState: () => void;
}

const TextEditor = ({ currentDocument, swapState }: TextEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setID] = useState<string | undefined>("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.name);
      setContent(currentDocument.text);
      setID(currentDocument.id);
    }
  }, [currentDocument]);

  useEffect(() => {
    if (uploadComplete) {
      const timeout = setTimeout(() => setUploadComplete(false), 3000);
      return () => clearTimeout(timeout); // Clean up the timeout on component unmount
    }
  }, [uploadComplete]);

  const handleUpload = async () => {
    if (!content || !title) {
      alert("Please provide both a title and content for the document.");
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);

    try {
      const response = await fetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          name: title,
          text: content,
          files: [],
        } as newDocument),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Document uploaded", data);
      setUploadComplete(true);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!content || !title) {
      alert("Please provide both a title and content for the document.");
      return;
    }

    if (!id) {
      console.error("Document ID is missing.");
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);

    try {
      const response = await fetch("/api/db", {
        method: "PUT",
        body: JSON.stringify({
          id,
          name: title,
          text: content,
          files: [],
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      console.log("Document updated", data);
      setUploadComplete(true);
      swapState();
    } catch (error) {
      console.error("Error updating document:", error);
    } finally {
      setIsUploading(false);
    }
  };

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
    <div className="flex h-full max-w-full flex-col bg-black text-white">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter document title"
        className="h-[5vh] w-full rounded-t-xl border-x-[1px] border-t-[1px] border-white bg-bgSecondary px-2 font-bold"
      />

      <style>
        {`
          .ql-toolbar {
            position: sticky;
            top: 0;
            z-index: 10;
            background-color: #000;
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

      <div className="flex h-[10vh] items-center justify-end space-x-4 rounded-b-xl border-x-[1px] border-b-[1px] border-white bg-bgSecondary p-4">
        {isUploading ? (
          <div className="flex items-center">
            <div className="loader mr-2"></div>
            <span>Uploading...</span>
          </div>
        ) : uploadComplete ? (
          <span className="font-bold text-green-500">&#10003; Uploaded!</span>
        ) : (
          <Button
            label={id ? "Update Save" : "New Save"}
            onClick={id ? handleUpdate : handleUpload}
          />
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
  );
};

export default TextEditor;
