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
import { useCurrentDocument } from '@/context/AppContext';

export default function FileList() {
  const sensors = useSensors(useSensor(PointerSensor));
  const { currentDocument, fetchDocument } = useCurrentDocument();

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
      setExpandedFolders((prev) => ({
        ...prev,
        ...Object.fromEntries(
          Object.keys(currentDocument.folders).map((folderName) => [
            folderName,
            prev[folderName] ?? false,
          ]),
        ),
      }));
    }
  }, [currentDocument]);

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

  const handleMoveResource = async () => {
    if (currentDocument) {
      try {
        // Preserve expanded folder states
        const preservedExpandedFolders = { ...expandedFolders };

        // Fetch the document and restore the folder states
        await fetchDocument(currentDocument.id);
        setExpandedFolders(preservedExpandedFolders);
      } catch (error) {
        console.error(
          'Error refreshing document after moving resource:',
          error,
        );
      }
    }
  };

  const applyFiltersAndSort = (folderData: FolderData) => {
    let resources = folderData.resources;

    // Apply search filter
    if (searchQuery) {
      resources = resources.filter((resource) =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply file type filter
    if (selectedFileTypes.length > 0) {
      resources = resources.filter((resource) =>
        selectedFileTypes.includes(resource.fileType),
      );
    }

    // Apply date range filter
    if (selectedDateRange.from || selectedDateRange.to) {
      const fromDate = selectedDateRange.from
        ? new Date(selectedDateRange.from + 'T00:00:00Z')
        : null;
      const toDate = selectedDateRange.to
        ? new Date(selectedDateRange.to + 'T23:59:59Z')
        : null;

      resources = resources.filter((resource) => {
        const resourceDate = new Date(resource.dateAdded);

        if (fromDate && resourceDate < fromDate) return false;
        if (toDate && resourceDate > toDate) return false;
        return true;
      });
    }

    // Apply sorting
    if (selectedSortOrder === 'a-z') {
      resources.sort((a, b) => a.name.localeCompare(b.name));
    } else if (selectedSortOrder === 'z-a') {
      resources.sort((a, b) => b.name.localeCompare(a.name));
    } else if (selectedSortOrder === 'dateAdded') {
      resources.sort(
        (a, b) =>
          new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
      );
    } else if (selectedSortOrder === 'lastOpened') {
      resources.sort(
        (a, b) =>
          new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime(),
      );
    }

    return { ...folderData, resources };
  };

  const filteredAndSortedFolders = Object.entries(
    currentDocument?.folders || {},
  )
    .sort(([folderNameA], [folderNameB]) =>
      folderNameA.localeCompare(folderNameB),
    )
    .reduce(
      (acc, [folderName, folderData]) => ({
        ...acc,
        [folderName]: applyFiltersAndSort(folderData),
      }),
      {},
    );

  return (
    <DndContext sensors={sensors}>
      <div className='flex h-full w-full flex-col overflow-auto'>
        <TextInput
          placeholder='Search Resources'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className='h-full overflow-scroll'>
          {Object.entries(filteredAndSortedFolders).map(([key, folder]) => (
            <TableFolder
              key={key}
              folderData={folder}
              isExpanded={!!expandedFolders[key]}
              onToggle={() =>
                setExpandedFolders((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
              onResourceMove={handleMoveResource} // Handle resource movement
            />
          ))}
        </div>

        {!isAddingFolder ? (
          <button
            onClick={() => setIsAddingFolder(true)}
            className='mt-4 rounded-md border-[1px] border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white transition duration-200 ease-in-out hover:bg-gray-700'
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
              className='w-full rounded-md bg-gray-800 px-2 py-1 text-sm text-white outline-none focus:outline-none focus:ring-0'
            />
            <div className='flex w-full gap-2'>
              <button
                onClick={handleAddFolder}
                className='flex-1 rounded-md bg-gray-800 px-2 py-1 text-sm text-white duration-200 hover:bg-gray-400'
              >
                Submit
              </button>
              <button
                onClick={() => setIsAddingFolder(false)}
                className='flex-1 rounded-md bg-gray-800 px-2 py-1 text-sm text-white duration-200 hover:bg-gray-400'
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DndContext>
  );
}
