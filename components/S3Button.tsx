"use client";

import { useState } from "react";
import { useS3Upload } from "next-s3-upload";

export default function S3Button() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const handleFileChange = async (file: any) => {
    const { url } = await uploadToS3(file);
    setImageUrl(url);

    // call db api to create new docum,ent
    // fetch("/api/db", {
    //   method: "POST",
    //   body: JSON.stringify({
    //     name: "test doc",
    //     text: "test"
    //   }),
    // }).then(r => r.json()).then(res => console.log(res));

    // call to add new resource to 'General'
    fetch("/api/db/resource", {
      method: "POST",
      body: JSON.stringify({
        name: "test resource",
        documentId: "7e4676b7-a610-419c-9755-728b4b75acb9",
        text: "test",
        url: url,
        folderName: "Not The Main Folder",
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
