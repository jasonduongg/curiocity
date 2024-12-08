import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";

interface FolderDropdownProps {
  possibleFolders: Array<string>;
  selectedFolder: string;
  onFolderChange: (folderName: string) => void;
}

const FolderDropdown: React.FC<FolderDropdownProps> = ({
  possibleFolders,
  selectedFolder,
  onFolderChange,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleFolderSelection = (folderName: string) => {
    onFolderChange(folderName);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative w-full">
      <button
        onClick={toggleDropdown}
        className="flex w-full items-center justify-between whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-zinc-600 focus:outline-none"
      >
        {selectedFolder || "Select Folder"}
        <FaChevronDown className="ml-2 text-white" />
      </button>
      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full rounded-md bg-zinc-800 shadow-lg">
          {possibleFolders.map((folder) => (
            <div
              key={folder}
              className="cursor-pointer px-4 py-2 text-white hover:bg-purple-500"
              onClick={() => handleFolderSelection(folder)}
            >
              {folder}
            </div>
          ))}
          <div
            className="cursor-pointer px-4 py-2 text-white hover:bg-purple-500"
            onClick={() => handleFolderSelection("Enter New Folder Name")}
          >
            + New Folder
          </div>
        </div>
      )}
    </div>
  );
};

export default FolderDropdown;
