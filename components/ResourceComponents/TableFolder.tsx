<<<<<<< HEAD
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FolderData, ResourceMeta } from '@/types/types';
import TableRow from '@/components/ResourceComponents/TableRow';
=======
import React, { useState } from 'react';
import TableRow from './TableRow';
import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';
import { FolderData, ResourceCompressed } from '@/types/types';
>>>>>>> 3c333ed (Fix linting errors and proceed with force push)

interface FolderProps {
  folderData: FolderData;
  isExpanded: boolean;
  onToggle: () => void; // Callback to handle expand/collapse
}

const Folder = ({ folderData, isExpanded, onToggle }: FolderProps) => {
  const { currentDocument, setCurrentDocument, fetchDocument } =
    useCurrentDocument();
  const { moveResource } = useCurrentResource();

  if (!currentDocument) {
    console.error('No current document found.');
    return null;
  }

  const { folders } = currentDocument;
  const folder = folders[folderData.name];

  if (!folder) {
    console.error(`Folder "${folderData.name}" not found.`);
    return null;
  }

  const resources: ResourceCompressed[] = folder.resources || [];

  const handleMoveResource = async (
    resourceId: string,
    sourceFolderName: string,
    targetFolderName: string,
  ) => {
    try {
      console.log('Resource ID:', resourceId);
      console.log('Source Folder Name:', sourceFolderName);
      console.log('Target Folder Name:', targetFolderName);
      console.log('Current Document Folders:', currentDocument.id);

      await moveResource(
        resourceId,
        sourceFolderName,
        targetFolderName,
        currentDocument.id,
      );

      // Reset the current document state to refresh the UI
      await fetchDocument(currentDocument.id);
    } catch (error) {
      console.error('Error in moving resource:', error);
    }
  };

  const handleDelete = (resourceId: string) => {
    const resourceIndex = folder.resources.findIndex(
      (resource) => resource.id === resourceId,
    );

    if (resourceIndex === -1) {
      console.error('Resource not found in the current folder.');
      return;
    }

    folder.resources.splice(resourceIndex, 1);

    setCurrentDocument({
      ...currentDocument,
      folders: {
        ...folders,
        [folderData.name]: { ...folder },
      },
    });
  };

  return (
    <div className='mb-4 rounded-md border bg-gray-100'>
      {/* Folder Header */}
      <div
        className='flex cursor-pointer items-center justify-between bg-gray-200 px-4 py-2 hover:bg-gray-300'
        onClick={onToggle}
      >
        <h2 className='text-lg font-semibold'>{folder.name}</h2>
        <span className='text-sm'>{isExpanded ? '▼' : '►'}</span>
      </div>

      {/* Folder Resources */}
      {isExpanded && (
        <div className='space-y-2 p-4'>
          {resources.map((resource) => (
            <TableRow
              key={resource.id} // Ensure unique key for each resource
              resourceCompressed={resource} // Pass the resource data
              folderName={folderData.name} // Specify the folder name containing the resource
              availableFolders={Object.keys(folders)} // Pass a list of available folders for moving
              onMoveTo={(targetFolderName) =>
                handleMoveResource(
                  resource.id,
                  folderData.name,
                  targetFolderName,
                )
              }
              onDelete={() => handleDelete(resource.id)} // Callback for deleting resource
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
