import { useState } from "react";
import { useS3Upload } from "next-s3-upload";

interface S3ButtonProps {
  documentId: string;
  folderName: string;
  possibleFolders?: Record<string, { name: string }>;
  onResourceUpload?: () => void;
}

export default function S3Button({
  documentId,
  folderName,
  possibleFolders,
  onResourceUpload,
}: S3ButtonProps) {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(folderName);
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const { FileInput, openFileDialog, uploadToS3 } = useS3Upload();

  const handleFileChange = async (file: File) => {
    const fileName = file.name;
    const { url } = await uploadToS3(file);

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

    const folderToSave = isNewFolder ? newFolderName : selectedFolder;

    // API request to save resource
    fetch("/api/db/resource", {
      method: "POST",
      body: JSON.stringify({
        name: fileName,
        documentId,
        url,
        folderName: folderToSave,
        dateAdded,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((r) => r.json())
      .then((res) => {
        console.log("Resource uploaded:", res);
        if (onResourceUpload) {
          onResourceUpload();
        }
      });
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

  return (
    <div>
      {!showUploadForm ? (
        <button
          onClick={() => setShowUploadForm(true)}
          className="w-full rounded-md border-2 border-zinc-700 px-2 py-1 text-sm text-white transition duration-300 hover:bg-gray-700"
        >
          Upload New File
        </button>
      ) : (
        <div>
          <div className="flex flex-row space-x-1">
            <select
              value={isNewFolder ? "newFolder" : selectedFolder}
              onChange={handleFolderChange}
              className="w-full rounded-md border-2 border-zinc-700 bg-black px-2 py-1 text-sm text-white"
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
              onClick={openFileDialog}
              className="whitespace-nowrap rounded-md border-2 border-zinc-700 bg-black px-2 py-1 text-sm text-white hover:bg-gray-200"
              aria-label="Upload file"
            >
              Upload!
            </button>
          </div>

          {isNewFolder && (
            <input
              type="text"
              placeholder="Enter new folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="mb-2 w-full rounded border border-gray-300 p-2"
            />
          )}

          <FileInput onChange={handleFileChange} />
        </div>
      )}
    </div>
  );
}
