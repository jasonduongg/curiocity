import React, { useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import TableFolder from '@/components/ResourceComponents/TableFolder';
import { Document, ResourceMeta, FolderData } from '@/types/types';
import TextInput from '../GeneralComponents/TextInput';
import Filter from '@/components/ResourceComponents/Filter';

interface FileListProps {
  currentDocument: Document;
  onResourceClickCallBack: (resourceId: string) => void;
  onResourceMoveCallBack: (documentId: string) => void;
  currentResourceMeta: ResourceMeta | null;
}

export default function FileList({
  currentDocument,
  onResourceClickCallBack,
  onResourceMoveCallBack,
  currentResourceMeta,
}: FileListProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>(
    Object.fromEntries(
      Object.keys(currentDocument.folders).map((folderName) => [
        folderName,
        false,
      ]),
    ),
  );

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'dateAdded' | 'lastOpened'>('dateAdded');
  const [fileListKey, setFileListKey] = useState(0);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);

  // Filter states
  const [selectedSortOrder, setSelectedSortOrder] = useState<string>('a-z');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });

  const handleResourceClick = async (
    resourceId: string,
    folderName: string,
  ) => {
    try {
      await fetch('/api/db/resourcemeta/updateLastOpened', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resourceId,
          documentId: currentDocument.id,
          folderName,
        }),
      });

      setFileListKey((prevKey) => prevKey + 1);
      onResourceClickCallBack(resourceId);
    } catch (error) {
      console.error('Error updating lastOpened:', error);
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await fetch('/api/db/documents/addFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDocument.id,
          folderName: newFolderName,
        }),
      });

      currentDocument.folders[newFolderName] = {
        name: newFolderName,
        resources: [],
      };

      setFileListKey((prevKey) => prevKey + 1);
      setNewFolderName('');
      setIsAddingFolder(false);
    } catch (error) {
      console.error('Error adding new folder:', error);
    }
  };

  const handleFilterApply = (filters: {
    sortOrder: string;
    fileTypes: string[];
    dateRange: { from: string; to: string };
  }) => {
    setSelectedSortOrder(filters.sortOrder);
    setSelectedFileTypes(filters.fileTypes);
    setSelectedDateRange(filters.dateRange);
  };

  const filteredAndSortedFolders = Object.entries(
    currentDocument.folders,
  ).reduce(
    (acc, [folderName, folderData]) => {
      let filteredResources = folderData.resources;

      // Apply search query filtering
      if (searchQuery) {
        filteredResources = filteredResources.filter((resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Filter by file type if any selected
      if (selectedFileTypes.length > 0) {
        filteredResources = filteredResources.filter((resource) =>
          selectedFileTypes.includes(resource.fileType),
        );
      }

      // Filter by date range if specified
      if (selectedDateRange.from || selectedDateRange.to) {
        const fromDate = selectedDateRange.from
          ? new Date(selectedDateRange.from + 'T00:00:00Z')
          : null;
        const toDate = selectedDateRange.to
          ? new Date(selectedDateRange.to + 'T23:59:59Z')
          : null;

        filteredResources = filteredResources.filter((resource) => {
          const resourceDate = new Date(resource.dateAdded);

          console.log(
            'Resource Name:',
            resource.name,
            '| FromDate:',
            fromDate,
            '| ToDate:',
            toDate,
            '| ResourceDate String:',
            resource.dateAdded,
            '| ResourceDate:',
            resourceDate,
          );

          if (isNaN(resourceDate.getTime())) {
            console.warn(
              'Invalid date for resource:',
              resource.name,
              resource.dateAdded,
            );
            return false;
          }

          if (isNaN(resourceDate.getTime())) {
            console.warn(
              'Invalid date for resource:',
              resource.name,
              resource.dateAdded,
            );
            return false;
          }

          if (fromDate && resourceDate < fromDate) return false;
          if (toDate && resourceDate > toDate) return false;
          return true;
        });
      }

      const noFiltersApplied =
        !searchQuery &&
        selectedFileTypes.length === 0 &&
        !selectedDateRange.from &&
        !selectedDateRange.to;

      if (filteredResources.length > 0 || noFiltersApplied) {
        const sortedResources = [...filteredResources];

        // Sort by date if required
        if (sortBy === 'dateAdded') {
          sortedResources.sort(
            (a, b) =>
              new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
          );
        } else if (sortBy === 'lastOpened') {
          sortedResources.sort(
            (a, b) =>
              new Date(b.lastOpened).getTime() -
              new Date(a.lastOpened).getTime(),
          );
        }

        // Apply alphabetical sorting from Filter modal
        if (selectedSortOrder === 'a-z') {
          sortedResources.sort((a, b) => a.name.localeCompare(b.name));
        } else if (selectedSortOrder === 'z-a') {
          sortedResources.sort((a, b) => b.name.localeCompare(a.name));
        }

        acc[folderName] = { ...folderData, resources: sortedResources };
      }
      return acc;
    },
    {} as Record<string, FolderData>,
  );

  return (
    <DndContext sensors={sensors}>
      <div className='flex h-full w-full flex-col overflow-auto'>
        <TextInput
          placeholder='Search Resources'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Filter onApplyFilters={handleFilterApply} />
        <div className='flex gap-2 pb-2 pt-2'>
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === 'dateAdded' ? 'bg-gray-700 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setSortBy('dateAdded')}
          >
            Sort by Date Added
          </button>
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === 'lastOpened' ? 'bg-gray-700 text-white' : 'bg-gray-200'
            }`}
            onClick={() => setSortBy('lastOpened')}
          >
            Sort by Last Opened
          </button>
        </div>
        <div key={fileListKey}>
          {Object.entries(filteredAndSortedFolders).map(([key, folder]) => (
            <TableFolder
              key={`${key}-${sortBy}`}
              folderData={folder}
              isExpanded={expandedFolders[key]}
              onToggle={() =>
                setExpandedFolders((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
              onResourceClickCallBack={(resourceId) =>
                handleResourceClick(resourceId, key)
              }
              onResourceMoveCallBack={onResourceMoveCallBack}
              currentResourceMeta={currentResourceMeta}
              currentDocument={currentDocument}
            />
          ))}
        </div>

        {!isAddingFolder ? (
          <button
            onClick={() => setIsAddingFolder(true)}
            className='mt-4 rounded-md border-[1px] border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white duration-200 hover:bg-gray-700'
          >
            Add New Folder
          </button>
        ) : (
          <div className='mt-4 flex flex-col items-center gap-2'>
            <input
              type='text'
              placeholder='Folder Name'
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className='flex-grow rounded-md border-[1px] border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white'
            />
            <button
              onClick={handleAddFolder}
              className='rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500'
            >
              Submit
            </button>
            <button
              onClick={() => setIsAddingFolder(false)}
              className='rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500'
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </DndContext>
  );
}
