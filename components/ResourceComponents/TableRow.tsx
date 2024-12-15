import React, { useState } from 'react';
import { ResourceCompressed } from '@/types/types';
import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';

interface TableRowProps {
  resourceCompressed: ResourceCompressed;
  folderName: string;
  availableFolders: string[]; // List of available folders for moving the resource
}

const TableRow = ({
  resourceCompressed,
  folderName,
  availableFolders,
}: TableRowProps) => {
  const { currentDocument, fetchDocument } = useCurrentDocument();
  const {
    moveResource,
    fetchResourceAndMeta,
    currentResource,
    currentResourceMeta,
  } = useCurrentResource();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleMoveTo = async (targetFolderName: string) => {
    try {
      await moveResource(
        resourceCompressed.id,
        folderName,
        targetFolderName,
        currentDocument.id,
      );
      await fetchDocument(currentDocument.id);
    } catch (error) {
      console.error('Error in moving resource:', error);
    }

    setIsDropdownOpen(false);
  };
  const handleResourceClick = async () => {
    try {
      await fetchResourceAndMeta(resourceCompressed.id, folderName);
    } catch (error) {
      console.error('Error fetching resource and metadata:', error);
    }
  };

  return (
    <div className='relative flex items-center justify-between rounded-md p-2 hover:bg-gray-100'>
      <p
        className='cursor-pointer truncate bg-red-500 text-sm'
        onClick={handleResourceClick} // Handle resource click
      >
        {resourceCompressed.name}
      </p>
      <div className='relative'>
        <button
          onClick={toggleDropdown}
          className='px-2 py-1 text-sm text-gray-500 hover:text-gray-700'
        >
          ...
        </button>
        {isDropdownOpen && (
          <div className='absolute right-0 z-10 mt-2 w-40 rounded-md bg-white shadow-lg'>
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
                  .map((folder, index) => (
                    <button
                      key={index}
                      onClick={() => handleMoveTo(folder)}
                      className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                    >
                      {folder}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableRow;
