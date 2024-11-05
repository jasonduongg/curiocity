import { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface FolderDropdownProps {
  possibleFolders?: Record<string, { name: string }>;
  selectedFolder: string;
  onFolderChange: (folderName: string) => void;
}

export default function FolderDropdown({
  possibleFolders,
  selectedFolder,
  onFolderChange,
}: FolderDropdownProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => setDropdownOpen((prev) => !prev);

  const handleSelectFolder = (folderName: string) => {
    onFolderChange(folderName);
    setDropdownOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={toggleDropdown}
        className="flex w-full items-center justify-between whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white outline-none"
      >
        {selectedFolder || "Select Folder"}
        <FaChevronDown className="ml-2 text-white" />
      </button>
      {dropdownOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-zinc-800 shadow-lg">
          {possibleFolders &&
            Object.entries(possibleFolders).map(([key, folder]) => (
              <div
                key={key}
                className="cursor-pointer px-4 py-2 text-white hover:bg-purple-500"
                onClick={() => handleSelectFolder(folder.name)}
              >
                {folder.name}
              </div>
            ))}
          <div
            className="cursor-pointer px-4 py-2 text-white hover:bg-purple-500"
            onClick={() => handleSelectFolder("Enter New Folder Name")}
          >
            + New Folder
          </div>
        </div>
      )}
    </div>
  );
}
