"use client";

import { useS3Upload } from "next-s3-upload";

interface S3ButtonProps {
  documentId: string;
  folderName: string;
  onResourceUpload?: () => void; // Optional callback prop for upload completion
}

export default function S3Button({
  documentId,
  folderName,
  onResourceUpload,
}: S3ButtonProps) {
  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const handleFileChange = async (file: File) => {
    try {
      const fileName = file.name;

      // Upload file to S3
      const { url } = await uploadToS3(file);

      // Format the date as needed
      const formatDate = () => {
        const date = new Date();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${month}/${day}/${year} at ${hours}:${minutes}`;
      };

      const dateAdded = formatDate();

      // Send resource data to the backend
      const response = await fetch("/api/db/resource", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: fileName,
          documentId: documentId,
          text: "",
          url: url,
          folderName: folderName,
          dateAdded: dateAdded,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save resource data");
      }

      const result = await response.json();
      console.log("Resource uploaded:", result);

      // Trigger onUpload callback if provided
      if (onResourceUpload) {
        onResourceUpload();
      }
    } catch (error) {
      console.error("Error during file upload:", error);
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
    </div>
  );
}
