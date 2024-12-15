'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import TableFolder from '@/components/ResourceComponents/TableFolder';
import { FolderData } from '@/types/types';
import TextInput from '../GeneralComponents/TextInput';
import Filter from '@/components/ResourceComponents/Filter';
import { useCurrentDocument } from '@/context/AppContext';

export default function FileList() {
  const sensors = useSensors(useSensor(PointerSensor));
  const { currentDocument } = useCurrentDocument();

  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false);
  const [selectedSortOrder, setSelectedSortOrder] = useState<string>('a-z');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });

  useEffect(() => {
    if (currentDocument?.folders) {
      setExpandedFolders((prev) =>
        Object.fromEntries(
          Object.keys(currentDocument.folders).map((folderName) => [
            folderName,
            prev[folderName] || false,
          ]),
        ),
      );
    }
  }, [currentDocument]);

  const handleToggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim() || !currentDocument) return;

    try {
      const response = await fetch('/api/db/documents/addFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDocument.id,
          folderName: newFolderName,
        }),
      });

      if (!response.ok) throw new Error('Failed to add new folder');

      currentDocument.folders[newFolderName] = {
        name: newFolderName,
        resources: [],
      };
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
    currentDocument?.folders || {},
  ).reduce(
    (acc, [folderName, folderData]) => {
      let filteredResources = folderData.resources;

      console.log(filteredResources);

      if (searchQuery) {
        filteredResources = filteredResources.filter((resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      if (selectedFileTypes.length > 0) {
        filteredResources = filteredResources.filter((resource) =>
          selectedFileTypes.includes(resource.fileType),
        );
      }

      if (selectedDateRange.from || selectedDateRange.to) {
        const fromDate = selectedDateRange.from
          ? new Date(selectedDateRange.from + 'T00:00:00Z')
          : null;
        const toDate = selectedDateRange.to
          ? new Date(selectedDateRange.to + 'T23:59:59Z')
          : null;

        filteredResources = filteredResources.filter((resource) => {
          const resourceDate = new Date(resource.dateAdded);

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

        if (selectedSortOrder === 'a-z') {
          sortedResources.sort((a, b) => a.name.localeCompare(b.name));
        } else if (selectedSortOrder === 'z-a') {
          sortedResources.sort((a, b) => b.name.localeCompare(a.name));
        } else if (selectedSortOrder === 'dateAdded') {
          sortedResources.sort(
            (a, b) =>
              new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
          );
        } else if (selectedSortOrder === 'lastOpened') {
          sortedResources.sort(
            (a, b) =>
              new Date(b.lastOpened).getTime() -
              new Date(a.lastOpened).getTime(),
          );
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
        <div className='flex w-full justify-center px-4'>
          <TextInput
            placeholder='Search Resources'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Filter onApplyFilters={handleFilterApply} />
        </div>

        <div>
          <div>
            {Object.entries(filteredAndSortedFolders).map(([key, folder]) => (
              <TableFolder
                key={key}
                folderData={folder}
                isExpanded={!!expandedFolders[key]}
                onToggle={() => handleToggleFolder(folder.name)}
              />
            ))}
          </div>
        </div>

        {!isAddingFolder ? (
          <button
            onClick={() => setIsAddingFolder(true)}
            className='mt-4 rounded-md border-[1px] border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700'
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
