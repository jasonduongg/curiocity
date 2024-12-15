import React, { useState } from 'react';
import { ResourceCompressed } from '@/types/types';

interface TableRowProps {
  resourceCompressed: ResourceCompressed;
  folderName: string;
  availableFolders: string[]; // List of available folders for moving the resource
  onMoveTo: (resourceId: string, targetFolderName: string) => void;
  onDelete: (resourceId: string) => void;
}

const TableRow = ({
  resourceCompressed,
  folderName,
  availableFolders,
  onMoveTo,
  onDelete,
}: TableRowProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleMoveTo = (targetFolderName: string) => {
    onMoveTo(resourceCompressed.id, targetFolderName);
    setIsDropdownOpen(false); // Close dropdown after moving
  };

  const handleDelete = () => {
    const confirmation = confirm(
      `Are you sure you want to delete "${resourceCompressed.name}"?`,
    );
    if (confirmation) {
      onDelete(resourceCompressed.id);
      setIsDropdownOpen(false); // Close dropdown after deleting
    }
  };

  return (
    <div className='relative flex items-center justify-between rounded-md p-2 hover:bg-gray-100'>
      <p className='truncate text-sm'>{resourceCompressed.name}</p>
      <div className='relative'>
        {/* Dropdown Toggle Button */}
        <button
          onClick={toggleDropdown}
          className='px-2 py-1 text-sm text-gray-500 hover:text-gray-700'
        >
          ...
        </button>
        {isDropdownOpen && (
          <div className='absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg'>
            {/* Move To Option */}
            <div className='relative'>
              <button
                className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                onClick={toggleDropdown}
              >
                Move to...
              </button>
              <div className='absolute right-0 z-20 mt-2 w-full rounded-md bg-white shadow-md'>
                {availableFolders
                  .filter((folder) => folder !== folderName) // Exclude current folder
                  .map((folder) => (
                    <button
                      key={folder}
                      onClick={() => handleMoveTo(folder)}
                      className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                    >
                      {folder}
                    </button>
                  ))}
              </div>
            </div>
            {/* Delete Option */}
            <button
              onClick={handleDelete}
              className='block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100'
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableRow;
