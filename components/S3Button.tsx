"use client";

import { useState } from "react";
import { useS3Upload } from "next-s3-upload";

export default function S3Button() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const handleFileChange = async (file: File) => {
    try {
      const { url } = await uploadToS3(file);
      setImageUrl(url);

      // Call your API to store the file path in the database
      const response = await fetch("/api/s3-upload", {
        method: "P",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        console.error("Failed to update the database with the file URL.");
      }
    } catch (error) {
      console.error("Error uploading to S3:", error);
    }
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
        aria-label="Upload file"
      >
        Upload file
      </button>

      {imageUrl && <img src={imageUrl} alt="Uploaded file" />}
    </div>
  );
}
