import React from 'react';
import TableRow from './TableRow';
import { useCurrentDocument } from '@/context/AppContext';
import { FolderData, ResourceCompressed } from '@/types/types';

interface FolderProps {
  folderData: FolderData;
  isExpanded: boolean;
  onToggle: () => void;
}

const Folder = ({ folderData, isExpanded, onToggle }: FolderProps) => {
  const { currentDocument } = useCurrentDocument();
  console.log(folderData);
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

  const resources: ResourceCompressed[] = folderData.resources || [];

  return (
    <div className='rounded-md px-2'>
      <div
        className='mb-2 flex cursor-pointer items-center justify-between border-b-[1px] border-white py-1 text-white hover:border-gray-400 hover:text-gray-400'
        onClick={onToggle}
      >
        <h2 className='text-md font-semibold'>{folderData.name}</h2>
        <span className='pr-1 text-xs'>{isExpanded ? '▼' : '►'}</span>
      </div>

      {isExpanded && (
        <div className='mb-2 space-y-2'>
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
