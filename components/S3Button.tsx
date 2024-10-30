import { useState, useRef } from "react";
import { useS3Upload } from "next-s3-upload";
import { FaCheckCircle, FaTrash } from "react-icons/fa";
import ResourceViewerMini from "./ResourceViewerMini";

interface S3ButtonProps {
  documentId: string;
  folderName: string;
  possibleFolders?: Record<string, { name: string }>;
  onResourceUpload?: () => void;
  cancelCallBack: () => void;
}

type Resource = {
  name: string;
  url: string;
  dateAdded?: string;
};

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
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>(
    {},
  );
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  const { uploadToS3 } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileQueue((prevQueue) => [
        ...prevQueue,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const handleFileClick = (file: File) => {
    const fileURL = URL.createObjectURL(file);
    setPreviewResource({ name: file.name, url: fileURL });
  };

  const handleDeleteFile = (fileName: string) => {
    setFileQueue((prevQueue) =>
      prevQueue.filter((file) => file.name !== fileName),
    );
    setUploadedFiles((prev) => {
      const updated = { ...prev };
      delete updated[fileName];
      return updated;
    });
    if (previewResource?.name === fileName) {
      setPreviewResource(null); // Reset the preview if the deleted file was being previewed
    }
  };

  const handleUploadAll = async () => {
    if (fileQueue.length === 0) {
      alert("No files selected for upload.");
      return;
    }

    const folderToSave = isNewFolder ? newFolderName : selectedFolder;

    for (const file of fileQueue) {
      const { name: fileName } = file;

      try {
        const { url } = await uploadToS3(file);

        await fetch("/api/db/resource", {
          method: "POST",
          body: JSON.stringify({
            name: fileName,
            documentId,
            url,
            folderName: folderToSave,
            dateAdded: new Date().toISOString(),
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        setUploadedFiles((prev) => ({ ...prev, [fileName]: true }));
      } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
      }
    }

    if (onResourceUpload) onResourceUpload();
    cancelCallBack();
    setFileQueue([]);
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    if (selectedValue === "newFolder") {
      setIsNewFolder(true);
      setSelectedFolder("");
    } else {
      setIsNewFolder(false);
      setSelectedFolder(selectedValue);
    }
  };

  const handleCancelUpload = () => {
    setFileQueue([]);
    setIsNewFolder(false);
    setNewFolderName("");
    setPreviewResource(null);
    cancelCallBack();
  };

  return (
    <div className="mt-2 h-full">
      {/* Folder Selection and File Input */}
      <div className="flex flex-row space-x-2">
        <select
          value={isNewFolder ? "newFolder" : selectedFolder}
          onChange={handleFolderChange}
          className="w-full whitespace-nowrap rounded-md border-[1px] border-zinc-700 bg-black px-2 py-1 text-sm text-white"
        >
          {possibleFolders &&
            Object.entries(possibleFolders).map(([key, folder]) => (
              <option key={key} value={folder.name}>
                {folder.name}
              </option>
            ))}
          <option value="newFolder">+ New Folder</option>
        </select>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="whitespace-nowrap rounded-md border-[1px] border-zinc-700 bg-black px-2 py-1 text-sm text-white hover:bg-gray-700"
        >
          Select Files
        </button>
      </div>

      {/* New Folder Input */}
      {isNewFolder && (
        <input
          type="text"
          placeholder="Enter new folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          className="mt-2 w-full rounded-lg border border-zinc-700 bg-transparent px-2 py-2 text-sm text-white outline-none focus:border-white"
        />
      )}

      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      <div className="h-[80%] bg-red-500">
        {/* File Queue and Upload Controls */}
        <div className="mt-2 h-1/2 overflow-y-scroll rounded-xl border border-zinc-700 p-2">
          <p className="mb-2 text-sm font-semibold text-white">
            Selected Files:
          </p>
          <ul className="list-disc text-white">
            {fileQueue.map((file, index) => (
              <div
                key={index}
                className="mb-2 flex w-full items-center overflow-hidden rounded-lg border-[1px] border-zinc-700"
              >
                <p
                  className="flex-1 cursor-pointer whitespace-nowrap px-2 py-1 text-sm"
                  onClick={() => handleFileClick(file)}
                >
                  {file.name}
                </p>
                {uploadedFiles[file.name] && (
                  <FaCheckCircle className="ml-2 text-green-500" />
                )}
                <button
                  className="ml-2 text-red-500 hover:text-red-400"
                  onClick={() => handleDeleteFile(file.name)}
                  aria-label={`Delete ${file.name}`}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </ul>
        </div>

        {/* Preview Section using ResourceViewer */}
        <div className="mt-2 h-1/2 overflow-y-scroll rounded-xl border border-zinc-700 p-2">
          {previewResource && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-white">
                Preview: {previewResource.name}
              </h3>
              <ResourceViewerMini resource={previewResource} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-2 flex space-x-2">
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
