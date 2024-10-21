"use client";

import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Button from "./Button";
import AWS from "aws-sdk";

const TextEditor = () => {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_UPLOAD_REGION,
  });

  const handleUpload = async () => {
    if (!content) return;

    const params = {
      Bucket: process.env.S3_UPLOAD_BUCKET || "",
      Key: "test",
      Body: content,
    };

    try {
      const response = await s3.upload(params).promise();
      console.log("File uploaded successfully:", response);
      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(`Error uploading file: ${error.message}`);
    }
  };

  const [content, setContent] = useState("");

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

  // Convert this to css file
  useEffect(() => {
    const toolbar = document.querySelector(".ql-toolbar");
    if (toolbar) {
      toolbar.style.position = "-webkit-sticky";
      toolbar.style.position = "sticky";
      toolbar.style.top = "0";
      toolbar.style.zIndex = "10";
      toolbar.style.backgroundColor = "rgb(255 255 255 / var(--tw-bg-opacity))";
      toolbar.style.borderBottom = "1px solid #ccc";
    }
  }, []);

  return (
    <div className="flex h-full max-w-full flex-col bg-white">
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
      <div className="flex h-[10vh] items-center justify-end space-x-4 bg-gray-100 p-4">
        <Button label="Save" onClick={handleUpload} />
        <Button label="Delete" onClick={handleUpload} />
      </div>
    </div>
  );
};

export default TextEditor;
