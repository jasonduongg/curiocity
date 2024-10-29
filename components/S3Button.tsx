"use client";

import { useState } from "react";
import { useS3Upload } from "next-s3-upload";

export default function S3Button() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const handleFileChange = async (file: File) => {
    // Extract the file name
    const fileName = file.name;

    // Upload file to S3
    const { url } = await uploadToS3(file);
    setImageUrl(url);

    // Call to add a new resource to 'General' with the file name included
    fetch("/api/db/resource", {
      method: "POST",
      body: JSON.stringify({
        name: fileName, // Use the file name here
        documentId: "487bc3a8-a253-4e8f-a75a-5241d944be5b",
        text: "test",
        url: url,
        folderName: "3rd Test",
      }),
    })
      .then((r) => r.json())
      .then((res) => console.log(res));
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
