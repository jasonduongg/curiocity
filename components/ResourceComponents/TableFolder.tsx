import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { FolderData, ResourceMeta } from '@/types/types';
import TableRow from '@/components/ResourceComponents/TableRow';

interface TableFolderProps {
  folderData: FolderData;
  isExpanded: boolean; // Receive expanded state
  onToggle: () => void; // Handle folder toggle
  onResourceClickCallBack: (resourceId: string) => void;
  onResourceMoveCallBack: (
    resourceId: string,
    sourceFolder: string,
    targetFolder: string,
  ) => void;
  currentResourceMeta: ResourceMeta | null;
}

function TableFolder({
  folderData,
  isExpanded,
  onToggle,
  onResourceClickCallBack,
  currentResourceMeta,
}: TableFolderProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: folderData.name,
    data: { targetFolderName: folderData.name },
  });

  return (
    <div className='mb-2'>
      <div
        ref={setNodeRef}
        className={`flex cursor-pointer items-center rounded-lg border-[1px] border-zinc-700 px-2 py-1 transition duration-200 duration-300 hover:bg-gray-700 ${
          isOver ? 'bg-accentPrimary' : ''
        }`}
        onClick={onToggle} // Use onToggle for expanding/collapsing
      >
        <span
          className={`mr-2 transform text-white transition-transform ${
            isExpanded ? 'rotate-90' : 'rotate-0'
          }`}
        >
          ▶
        </span>
        <p className='text-sm font-semibold text-textPrimary'>
          {folderData.name}
        </p>
      </div>

      {isExpanded && (
        <div className='pl-4 pt-1'>
          {folderData.resources.map((resource) => (
            <TableRow
              key={resource.id}
              resource={resource}
              folderName={folderData.name} // Pass folder name to resource
              onResourceClickCallBack={onResourceClickCallBack}
              isSelected={currentResourceMeta?.id === resource.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TableFolder;
