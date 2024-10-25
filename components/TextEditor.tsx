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
  document?: newDocument; // Accept document as a prop
  swapState: () => void;
}

const TextEditor = ({ document, swapState }: TextEditorProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [id, setID] = useState<string | undefined>("");

  useEffect(() => {
    if (document) {
      setTitle(document.name);
      setContent(document.text);
      setID(document.id); // Set the ID for the document
      console.log(document);
    }
  }, [document]);

  const handleUpload = async () => {
    if (!content || !title) return; // Ensure title and content are provided

    // API call to upload the content with title
    fetch("/api/db", {
      method: "POST",
      body: JSON.stringify({
        name: title, // Use title as the document name
        text: content,
        files: [],
      } as newDocument),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Document uploaded", data);
      })
      .catch((error) => console.error("Error uploading document:", error));
  };

  const handleUpdate = async () => {
    if (!content || !title) return; // Ensure title and content are provided

    // Ensure the document has an id for updating
    if (!id) {
      console.error("Document ID is missing.");
      return;
    }

    // API call to upload the content with title
    fetch("/api/db", {
      method: "PUT",
      body: JSON.stringify({
        id: id, // Include the id of the document being updated
        name: title, // Use title as the document name
        text: content,
        files: [], // Retain existing files if not updating
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Document updated", data);
      })
      .catch((error) => console.error("Error updating document:", error));

    swapState();
  };

  // Quill modules configuration
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

  // Add sticky toolbar styling only on the client side
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const toolbar = document.querySelector(".ql-toolbar");
  //     if (toolbar) {
  //       toolbar.style.position = "-webkit-sticky";
  //       toolbar.style.position = "sticky";
  //       toolbar.style.top = "0";
  //       toolbar.style.zIndex = "10";
  //       toolbar.style.backgroundColor = "rgb(255, 255, 255, 0.95)";
  //       toolbar.style.borderBottom = "1px solid #ccc";
  //     }
  //   }
  // }, []);

  return (
    <div className="flex h-full max-w-full flex-col bg-white">
      {/* Input field for the document title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)} // Update title state on input change
        placeholder="Enter document title"
        className="h-[5vh] w-1/3 bg-gray-200 px-2"
      />
      {/* Text editor for the document content */}
      <ReactQuill
        className="h-full max-w-full overflow-y-auto bg-white"
        theme="snow"
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
      <div className="flex h-[10vh] items-center justify-end space-x-4 bg-gray-100 p-4">
        <Button label="New Save" onClick={handleUpload} />
        <Button label="Update Save" onClick={handleUpdate} />
      </div>
    </div>
  );
};

export default TextEditor;
