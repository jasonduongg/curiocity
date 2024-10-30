import { useState, useRef } from "react";
import { useS3Upload } from "next-s3-upload";
import { FaCheckCircle } from "react-icons/fa"; // For the green check icon

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
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>(
    {},
  );
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

        const formatDate = () => {
          const date = new Date();
          return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} at ${date.getHours()}:${date.getMinutes()}`;
        };
        const dateAdded = formatDate();

        await fetch("/api/db/resource", {
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
        });

        // Update uploadedFiles state to show checkmark for the uploaded file
        setUploadedFiles((prev) => ({ ...prev, [fileName]: true }));
      } catch (error) {
        console.error(`Error uploading ${fileName}:`, error);
      }
    }

    // Trigger callback and clear queue when all files are uploaded
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
    cancelCallBack();
  };

  return (
    <div className="mt-2">
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

      <div className="mt-2 h-[30vh] overflow-y-scroll rounded-xl border border-zinc-700 p-2">
        <p className="mb-2 text-sm font-semibold text-white">Selected Files:</p>
        <ul className="list-disc text-white">
          {fileQueue.map((file, index) => (
            <div
              key={index}
              className="mb-2 flex w-full items-center overflow-hidden rounded-lg border-[1px] border-zinc-700"
            >
              <p className="flex-1 whitespace-nowrap px-2 py-1 text-sm">
                {file.name}
              </p>
              {uploadedFiles[file.name] && (
                <FaCheckCircle className="ml-2 text-green-500" />
              )}
            </div>
          ))}
        </ul>
      </div>

      <div className="mt-2 flex space-x-2">
        <button
          onClick={handleUploadAll}
          className="w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-blue-500"
        >
          Upload All Files
        </button>
        <button
          onClick={handleCancelUpload}
          className="w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-red-500"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
