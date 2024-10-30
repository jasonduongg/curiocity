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
  currentDocument?: newDocument; // Accept currentDocument as a prop
  swapState: () => void;
}

const TextEditor = ({ currentDocument, swapState }: TextEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setID] = useState<string | undefined>("");

  useEffect(() => {
    if (currentDocument) {
      setTitle(currentDocument.name);
      setContent(currentDocument.text);
      setID(currentDocument.id); // Set the ID for the document
    }
  }, [currentDocument]);

  const handleUpload = async () => {
    if (!content || !title) {
      alert("Please provide both a title and content for the document.");
      return;
    }

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
      alert("Document uploaded successfully!");
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Failed to upload document.");
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

    try {
      const response = await fetch("/api/db", {
        method: "PUT",
        body: JSON.stringify({
          id: id,
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
      alert("Document updated successfully!");
      swapState();
    } catch (error) {
      console.error("Error updating document:", error);
      alert("Failed to update document.");
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
      {/* Input field for the document title */}
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
            stroke: #fff; /* Icon stroke color */
          }
          .ql-toolbar .ql-fill {
            fill: #fff; /* Icon fill color */
          }
          .ql-toolbar .ql-picker,
          .ql-toolbar .ql-picker-label,
          .ql-toolbar .ql-picker-options {
            color: #fff; /* Picker text color */
          }
        `}
      </style>

      {/* Text editor for the document content */}
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
      {/* Save button */}
      <div className="flex h-[10vh] items-center justify-end space-x-4 rounded-b-xl border-x-[1px] border-b-[1px] border-white bg-bgSecondary p-4">
        {id ? (
          <Button label="Update Save" onClick={handleUpdate} />
        ) : (
          <Button label="New Save" onClick={handleUpload} />
        )}
      </div>
    </div>
  );
};

export default TextEditor;
