import React, { useState } from 'react';
import TableRow from './TableRow';
import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';
import { FolderData, ResourceCompressed } from '@/types/types';

interface FolderProps {
  folderData: FolderData;
  isExpanded: boolean;
  onToggle: () => void;
}

const Folder = ({ folderData, isExpanded, onToggle }: FolderProps) => {
  const { currentDocument, setCurrentDocument, fetchDocument } =
    useCurrentDocument();

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

  return (
    <div className='mb-4 rounded-md border bg-gray-100'>
      <div
        className='flex cursor-pointer items-center justify-between bg-gray-200 px-4 py-2 hover:bg-gray-300'
        onClick={onToggle}
      >
        <h2 className='text-lg font-semibold'>{folder.name}</h2>
        <span className='text-sm'>{isExpanded ? '▼' : '►'}</span>
      </div>

      {isExpanded && (
        <div className='space-y-2 p-4'>
          {resources.map((resource) => (
            <TableRow
              key={resource.id}
              resourceCompressed={resource}
              folderName={folderData.name}
              availableFolders={Object.keys(folders)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Folder;
