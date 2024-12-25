import React, { useState } from 'react';
import { ResourceCompressed } from '@/types/types';
import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';
import { FaSpinner } from 'react-icons/fa';

interface TableRowProps {
  resourceCompressed: ResourceCompressed;
  folderName: string;
  availableFolders: string[];
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
    setCurrentResource,
    setCurrentResourceMeta,
  } = useCurrentResource();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isMoveListOpen, setIsMoveListOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false); // Specific loading state for renaming
  const [isMoving, setIsMoving] = useState(false); // Specific loading state for moving
  const [newResourceName, setNewResourceName] = useState(
    resourceCompressed.name,
  );

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  const handleRename = async () => {
    setIsRenaming(true); // Start renaming loading state
    try {
      const response = await fetch(`/api/db/resourcemeta/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resourceCompressed.id, // Using resourceCompressed.id
          name: newResourceName, // New resource name from input
          documentId: currentDocument.id, // Document ID
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resource name.');
      }

      await fetchDocument(currentDocument.id); // Refresh document after renaming
      setIsRenameModalOpen(false); // Close the rename modal
    } catch (error) {
      console.error('Error renaming resource:', error);
    } finally {
      setIsRenaming(false); // End renaming loading state
    }
  };

  const handleMoveTo = async (targetFolderName: string) => {
    setIsMoving(true); // Start moving loading state
    try {
      setIsDropdownOpen(false); // Close dropdown
      await moveResource(
        resourceCompressed.id,
        folderName,
        targetFolderName,
        currentDocument.id,
      );
      await fetchDocument(currentDocument.id);
    } catch (error) {
      console.error('Error in moving resource:', error);
    } finally {
      setIsMoving(false); // End moving loading state
      setIsMoveListOpen(false);
    }
  };

  const handleResourceClick = async () => {
    if (resourceCompressed.id === currentResourceMeta?.id) {
      setCurrentResource(null);
      setCurrentResourceMeta(null);
    } else {
      await fetchResourceAndMeta(resourceCompressed.id, folderName);
    }
    setIsDropdownOpen(false); // Close dropdown
  };

  // Determine row background color
  const rowClass =
    resourceCompressed.id === currentResourceMeta?.id
      ? 'bg-gray-500'
      : 'bg-gray-800 hover:bg-gray-400';

  return (
    <div
      className={`relative flex items-center justify-between rounded-md ${rowClass}`}
    >
      <div className='h-full w-full px-2'>
        <p
          className='cursor-pointer truncate text-sm text-white'
          onClick={handleResourceClick}
        >
          {resourceCompressed.name.length > 15
            ? `${resourceCompressed.name.slice(0, 15)}...`
            : resourceCompressed.name}
        </p>
      </div>

      <div className='relative'>
        <button
          onClick={toggleDropdown}
          className='text-md px-2 py-1 text-gray-400 hover:text-white'
        >
          ...
        </button>
        {isDropdownOpen && (
          <>
            <div
              className='fixed inset-0 z-10 bg-black opacity-70'
              onClick={() => {
                setIsDropdownOpen(false);
                setIsRenameModalOpen(false);
                setIsMoveListOpen(false);
              }}
            ></div>

            <div className='absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-md bg-gray-600 shadow-lg'>
              <button
                onClick={() => {
                  setIsRenameModalOpen(true);
                  setIsDropdownOpen(false);
                }}
                className='block w-full px-2 py-2 text-left text-sm text-white hover:bg-gray-400'
              >
                Rename Resource
              </button>
              <button
                onClick={() => {
                  setIsMoveListOpen(true);
                }}
                className='block w-full px-2 py-2 text-left text-sm text-white hover:bg-gray-400'
              >
                Move Resource
              </button>
              <button
                onClick={() => setIsDropdownOpen(false)}
                className='block w-full px-2 py-2 text-left text-sm text-red-400 hover:bg-gray-400'
              >
                Cancel
              </button>
            </div>
          </>
        )}

        {(isRenaming || isMoving) && (
          <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'>
            <div className='flex flex-col items-center justify-center p-6 text-white shadow-lg'>
              <FaSpinner className='animate-spin text-4xl' />
              <p className='mt-4'>
                {isRenaming ? 'Renaming Resource...' : 'Moving Resource...'}
              </p>
            </div>
          </div>
        )}

        {isRenameModalOpen && (
          <div className='fixed inset-0 z-30 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='w-1/3 rounded-lg bg-gray-700 p-6 text-white shadow-lg'>
              <h3 className='mb-4 text-lg font-semibold'>Rename Resource</h3>
              <input
                type='text'
                value={newResourceName}
                onChange={(e) => setNewResourceName(e.target.value)}
                className='mb-4 w-full rounded-md bg-gray-800 px-2 py-1 text-white'
              />
              <div className='flex justify-end gap-2'>
                <button
                  onClick={handleRename}
                  className='rounded-md bg-gray-800 px-2 py-2 text-sm hover:bg-gray-400'
                >
                  Save
                </button>
                <button
                  onClick={() => setIsRenameModalOpen(false)}
                  className='rounded-md bg-gray-800 px-2 py-2 text-sm hover:bg-gray-400'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {isMoveListOpen && (
          <div className='absolute right-0 z-30 mt-2 w-40 overflow-hidden rounded-md bg-gray-600 shadow-lg'>
            {availableFolders
              .filter((folder) => folder !== folderName)
              .map((folder, index) => (
                <button
                  key={index}
                  onClick={() => handleMoveTo(folder)}
                  className='block w-full px-2 py-2 text-left text-sm text-white hover:bg-gray-400'
                >
                  {folder}
                </button>
              ))}
            <button
              onClick={() => setIsMoveListOpen(false)}
              className='block w-full px-2 py-2 text-left text-sm text-red-400 hover:bg-gray-400'
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableRow;
