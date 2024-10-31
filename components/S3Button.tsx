import { useState, useRef } from "react";
import { useS3Upload } from "next-s3-upload";
import { FaCheckCircle, FaTrash } from "react-icons/fa";
import ResourceViewerMini from "./ResourceViewerMini";
import FolderDropdown from "./FolderSelectionDropdown";

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
  const [isUploading, setIsUploading] = useState(false); // New state to track uploading status

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

    if (folderToSave.trim() === "") {
      // Throw here
      return;
    }

    setIsUploading(true); // Start upload process

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
    setIsUploading(false); // End upload process
    if (onResourceUpload) onResourceUpload();
    cancelCallBack();
    setFileQueue([]);
  };

  const handleFolderChange = (folderName: string) => {
    setSelectedFolder(folderName);
    setIsNewFolder(folderName === "Enter New Folder Name");
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
      {/* Folder Selection */}
      <div className="p-2">
        <p className="mb-1 text-sm text-white">Select Folder:</p>
        <div className="flex items-center space-x-2">
          <FolderDropdown
            possibleFolders={possibleFolders}
            selectedFolder={selectedFolder}
            onFolderChange={handleFolderChange}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700"
          >
            Select Files
          </button>
        </div>
      </div>

      {/* New Folder Input */}
      {isNewFolder && (
        <div className="px-2">
          <input
            type="text"
            placeholder="..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white outline-none focus:border-white"
          />
        </div>
      )}
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        ref={fileInputRef}
      />

      <div className="flex h-[80%] flex-col">
        {/* File Queue */}
        <div className="flex h-2/5 flex-col p-2">
          <p className="mb-1 text-sm font-bold text-white">Selected Files:</p>
          <div className="h-full overflow-y-scroll rounded-xl border border-zinc-700 p-2">
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
                  {isUploading ? (
                    // Show checkmark as placeholder during upload
                    uploadedFiles[file.name] ? (
                      <FaCheckCircle className="mx-2 text-green-500 opacity-100 transition-opacity duration-500" />
                    ) : (
                      <div className="ml-2 h-4 w-4" />
                    )
                  ) : (
                    <button
                      className="mx-2 text-red-500 hover:text-red-400"
                      onClick={() => handleDeleteFile(file.name)}
                      aria-label={`Delete ${file.name}`}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </ul>
          </div>
        </div>

        {/* Preview Section */}
        <div className="flex h-3/5 flex-col p-2">
          <p className="mb-1 text-sm font-bold text-white">
            Preview: {previewResource?.name}
          </p>
          <div className="h-full overflow-y-scroll rounded-xl border border-zinc-700 p-2">
            {previewResource && (
              <div>
                <ResourceViewerMini resource={previewResource} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload/Cancel Buttons */}
      <div className="p-2">
        <div className="flex space-x-2">
          <button
            onClick={handleUploadAll}
            disabled={!selectedFolder.trim() && !newFolderName.trim()}
            className={`w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white ${
              !selectedFolder.trim() && !newFolderName.trim()
                ? "cursor-not-allowed bg-gray-600"
                : "hover:bg-blue-900"
            }`}
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
    </div>
  );
}
