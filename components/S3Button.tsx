"use client";

import { useState } from "react";
import { useS3Upload } from "next-s3-upload";

export default function S3Button() {
  const [imageUrl, setImageUrl] = useState("");
  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const handleFileChange = async (file: any) => {
    const { url } = await uploadToS3(file);
    setImageUrl(url);

    // call db api to add file path to document
    fetch("/api/db", {
      method: "PUT",
      body: JSON.stringify({
        url: url,
      }),
    });
  };

  return (
    <div>
      <FileInput onChange={handleFileChange} />

      <button
        onClick={openFileDialog}
        style={{
          backgroundColor: "transparent",
          color: "black",
          border: "2px solid black",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "4px",
          transition: "background-color 0.3s ease",
        }}
      >
        Upload file
      </button>

      {imageUrl && <img src={imageUrl} />}
    </div>
  );
}
