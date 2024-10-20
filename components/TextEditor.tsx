"use client";

import React, { useState } from "react";
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
      // toggle to add extra line breaks when pasting HTML:
      matchVisual: false,
    },
  };

  return (
    <div>
      <ReactQuill
        className="h-[10rem]"
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

      <Button label="save" onClick={handleUpload} />
      <Button label="delete" onClick={handleUpload} />
    </div>
  );
};

export default TextEditor;
