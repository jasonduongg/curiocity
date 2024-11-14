"use client";

import { useState, useRef } from "react";
import { useS3Upload } from "next-s3-upload";
import { FaCheckCircle, FaTrash, FaArrowLeft } from "react-icons/fa";
import ResourceViewerMini from "./ResourceViewerMini";
import FolderDropdown from "./FolderSelectionDropdown";
import FileUploadComponent from "./FileUploadComponent";
import { Resource } from "@/types/types";

interface S3ButtonProps {
  documentId: string;
  folderName: string;
  possibleFolders?: Record<string, { name: string }>;
  onResourceUpload?: () => void;
  cancelCallBack: () => void;
}

export default function S3Button({
  documentId,
  folderName,
  possibleFolders,
  onResourceUpload,
  cancelCallBack,
}: S3ButtonProps) {
  const [selectedFolder, setSelectedFolder] = useState(folderName);
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [uploadedFiles] = useState<Record<string, boolean>>({});
  const [fileMarkdowns, setFileMarkdowns] = useState<Record<string, string>>(
    {},
  );
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentFileIndex, setCurrentFileIndex] = useState<number | null>(null);
  const { uploadToS3 } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileQueue((prevQueue) => [
        ...prevQueue,
        ...Array.from(e.target.files),
      ]);
      setCurrentFileIndex(0); // Start processing the first file
    }
  };

  const handleMarkdownExtraction = (file: File, markdown: string) => {
    console.log("ehre2");
    console.log(markdown);
    setFileMarkdowns((prevMarkdowns) => ({
      ...prevMarkdowns,
      [file.name]: markdown,
    }));

    // Move to the next file in the queue
    setCurrentFileIndex((prevIndex) =>
      prevIndex !== null && prevIndex + 1 < fileQueue.length
        ? prevIndex + 1
        : null,
    );
  };

  const handleUploadAll = async () => {
    if (fileQueue.length === 0) {
      alert("No files selected for upload.");
      return;
    }

    setIsUploading(true);
    const folderToSave = isNewFolder ? newFolderName : selectedFolder;

    for (const file of fileQueue) {
      try {
        console.log(fileMarkdowns);
        // Upload to S3 and get the file URL
        const { url } = await uploadToS3(file);
        const markdown = fileMarkdowns[file.name] || "";
        console.log("here");
        console.log(markdown);
        // Convert the file to Base64
        const fileBase64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result?.split(",")[1]); // Extract only Base64 part
          reader.onerror = (error) => reject(error);
        });

        // Send the POST request with the Base64 file
        await fetch("/api/db/resourcemeta", {
          method: "POST",
          body: JSON.stringify({
            documentId,
            name: file.name,
            folderName: folderToSave,
            url,
            dateAdded: new Date().toISOString(),
            lastOpened: new Date().toISOString(),
            file: fileBase64, // Pass the Base64 file
            markdown: markdown, // Include extracted markdown
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log(`File ${file.name} uploaded successfully`);
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    if (onResourceUpload) onResourceUpload();
    cancelCallBack();
    setFileQueue([]);
    setFileMarkdowns({});
  };

  const handleCancelUpload = () => {
    setFileQueue([]);
    setIsNewFolder(false);
    setNewFolderName("");
    setPreviewResource(null);
    setFileMarkdowns({});
    cancelCallBack();
  };

  const handleFolderChange = (folderName: string) => {
    setSelectedFolder(folderName);
    setIsNewFolder(folderName === "Enter New Folder Name");
  };

  return (
    <div className="mt-2 flex h-full flex-col">
      <div className="flex items-center space-x-2 p-2">
        <p className="text-sm text-white">Select Folder:</p>
        {!isNewFolder ? (
          <FolderDropdown
            possibleFolders={possibleFolders}
            selectedFolder={selectedFolder}
            onFolderChange={handleFolderChange}
          />
        ) : (
          <>
            <button
              onClick={() => setIsNewFolder(false)}
              className="rounded-md p-1 text-white hover:bg-gray-700"
            >
              <FaArrowLeft />
            </button>
            <input
              type="text"
              placeholder="Enter new folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white outline-none focus:border-white"
            />
          </>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700"
        >
          Select Files
        </button>
      </div>

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      {currentFileIndex !== null && (
        <FileUploadComponent
          file={fileQueue[currentFileIndex]} // Pass the current file from the queue
          onTextExtracted={(text: string) => {
            handleMarkdownExtraction(fileQueue[currentFileIndex!], text);
          }}
        />
      )}

      <div className="h-[30%] flex-grow overflow-y-auto">
        <div className="flex h-full items-center justify-center overflow-y-auto rounded-xl border border-zinc-700 p-2">
          {fileQueue.length === 0 ? (
            <p className="text-gray-400">No files selected</p>
          ) : (
            <ul className="list-disc text-white">
              {fileQueue.map((file, index) => (
                <div
                  key={index}
                  className="mb-2 flex items-center rounded-lg border-[1px] border-zinc-700"
                >
                  <p
                    className="flex-1 cursor-pointer whitespace-nowrap px-2 py-1 text-sm"
                    onClick={() =>
                      setPreviewResource({
                        name: file.name,
                        url: URL.createObjectURL(file),
                      })
                    }
                  >
                    {file.name}
                  </p>
                  {isUploading ? (
                    uploadedFiles[file.name] ? (
                      <FaCheckCircle className="mx-2 text-green-500" />
                    ) : (
                      <div className="ml-2 h-4 w-4" />
                    )
                  ) : (
                    <button
                      className="mx-2 text-red-500 hover:text-red-400"
                      onClick={() =>
                        setFileQueue((prevQueue) =>
                          prevQueue.filter((f) => f.name !== file.name),
                        )
                      }
                      aria-label={`Delete ${file.name}`}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-2 h-[30%] flex-grow overflow-y-auto">
        <div className="flex h-full items-center justify-center overflow-y-auto rounded-xl border border-zinc-700 p-2">
          {previewResource ? (
            <ResourceViewerMini resource={previewResource} className="w-full" />
          ) : (
            <p className="text-gray-400">No preview available</p>
          )}
        </div>
      </div>

      <div className="flex space-x-2 py-2">
        <button
          onClick={handleUploadAll}
          className="w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-blue-900"
        >
          Upload All Files
        </button>
        <button
          onClick={handleCancelUpload}
          className="w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-red-900"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
