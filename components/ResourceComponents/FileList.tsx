'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core';
import TableFolder from '@/components/ResourceComponents/TableFolder';
import TextInput from '../GeneralComponents/TextInput';
import { useCurrentDocument } from '@/context/AppContext';
import Divider from '../GeneralComponents/Divider';
import { FaCheck } from 'react-icons/fa';

const AddFileModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (fileName: string) => void;
}) => {
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (fileName.trim()) {
      onSubmit(fileName);
      setFileName('');
      onClose();
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-1/3 rounded-lg bg-gray-700 p-6 text-white'>
        <h3 className='mb-4 text-lg font-semibold'>Add New File</h3>
        <input
          type='text'
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          placeholder='Enter file name'
          className='mb-4 w-full rounded-md bg-gray-800 px-2 py-1 text-white outline-none'
        />
        <div className='flex justify-end gap-2'>
          <button
            onClick={handleSubmit}
            className='rounded-md bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-500'
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className='rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-600'
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const FilterModal = ({
  isOpen,
  onClose,
  selectedSortOrder,
  setSelectedSortOrder,
  selectedFileTypes,
  setSelectedFileTypes,
  selectedDateRange,
  setSelectedDateRange,
  availableFileTypes,
  handleApplyFilters,
}) => {
  if (!isOpen) return null;

  const handleClearFilters = () => {
    setSelectedSortOrder('a-z'); // Reset to default sort order
    setSelectedFileTypes([]); // Clear file types
    setSelectedDateRange({ from: '', to: '' }); // Reset date range
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-1/3 rounded-lg bg-gray-800 p-6 text-white'>
        <h3 className='mb-4 text-lg font-semibold'>Filter Options</h3>
        <Divider />
        <div className='mb-4'>
          <label className='mb-2 block text-sm'>Sort Order</label>
          <select
            className='w-full rounded-md bg-gray-700 px-2 py-1'
            value={selectedSortOrder}
            onChange={(e) => setSelectedSortOrder(e.target.value)}
          >
            <option value='a-z'>A to Z</option>
            <option value='z-a'>Z to A</option>
            <option value='dateAdded'>Date Added</option>
            <option value='lastOpened'>Last Opened</option>
          </select>
        </div>
        <Divider />
        <div className='mb-4'>
          <label className='mb-2 block text-sm'>File Types</label>
          <div className='flex flex-wrap gap-2'>
            {availableFileTypes.map((fileType) => (
              <label
                key={fileType}
                className='flex cursor-pointer items-center gap-2'
              >
                <div className='relative'>
                  <input
                    type='checkbox'
                    value={fileType}
                    checked={selectedFileTypes.includes(fileType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedFileTypes([...selectedFileTypes, fileType]);
                      } else {
                        setSelectedFileTypes(
                          selectedFileTypes.filter((type) => type !== fileType),
                        );
                      }
                    }}
                    className='absolute h-0 w-0 opacity-0' // Hide default checkbox
                  />
                  <div
                    className={`h-5 w-5 rounded-md border-2 ${
                      selectedFileTypes.includes(fileType)
                        ? 'border-gray-500 bg-gray-500'
                        : 'border-[1px] border-gray-500 bg-gray-700'
                    } flex items-center justify-center`}
                  >
                    {selectedFileTypes.includes(fileType) && (
                      <FaCheck className='text-sm text-white' />
                    )}
                  </div>
                </div>
                <span className='text-sm text-white'>{fileType}</span>
              </label>
            ))}
          </div>
        </div>
        <Divider />
        <div className='mb-4'>
          <label className='mb-2 block text-sm'>Date Range</label>
          <div className='flex gap-2'>
            <input
              type='date'
              className='w-full rounded-md bg-gray-700 px-2 py-1'
              onChange={(e) =>
                setSelectedDateRange((prev) => ({
                  ...prev,
                  from: e.target.value,
                }))
              }
            />
            <input
              type='date'
              className='w-full rounded-md bg-gray-700 px-2 py-1'
              onChange={(e) =>
                setSelectedDateRange((prev) => ({
                  ...prev,
                  to: e.target.value,
                }))
              }
            />
          </div>
        </div>
        <Divider />
        <div className=''>
          <button
            onClick={handleClearFilters}
            className='rounded-md bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-400'
          >
            Reset Filters
          </button>
        </div>
        <Divider />
        <div className='flex w-full justify-end'>
          <button
            onClick={() => {
              handleApplyFilters();
              onClose();
            }}
            className='rounded-md bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-400'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default function FileList() {
  const sensors = useSensors(useSensor(PointerSensor));
  const { currentDocument, fetchDocument } = useCurrentDocument();

  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSortOrder, setSelectedSortOrder] = useState<string>('a-z');
  const [selectedFileTypes, setSelectedFileTypes] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: string;
    to: string;
  }>({ from: '', to: '' });
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAddFileModalOpen, setIsAddFileModalOpen] = useState(false);

  const [filteredFolders, setFilteredFolders] = useState({});
  const [searchedFolders, setSearchedFolders] = useState({});

  const [loading, setLoading] = useState(true); // Add a loading state

  const availableFileTypes = [
    'PDF',
    'Word',
    'Excel',
    'PowerPoint',
    'CSV',
    'HTML',
    'PNG',
    'JPG',
    'GIF',
    'Link',
    'Other',
  ]; // Comprehensive list of file types

  useEffect(() => {
    const fetchData = async () => {
      if (!currentDocument) {
        setLoading(true);
        await fetchDocument(currentDocument?.id); // Ensure this is awaited
        setLoading(false);
      } else {
        setLoading(false); // Already loaded
      }
    };

    fetchData();
  }, [fetchDocument, currentDocument]);

  const applyFilters = () => {
    const result = Object.entries(currentDocument?.folders || {})
      .sort(([folderNameA], [folderNameB]) =>
        folderNameA.localeCompare(folderNameB),
      )
      .reduce((acc, [folderName, folderData]) => {
        let resources = folderData.resources;

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
              new Date(b.lastOpened).getTime() -
              new Date(a.lastOpened).getTime(),
          );
        }

        acc[folderName] = { ...folderData, resources };
        return acc;
      }, {});

    setFilteredFolders(result);
  };

  const applySearch = () => {
    const result = Object.entries(filteredFolders).reduce(
      (acc, [folderName, folderData]) => {
        const matchingResources = folderData.resources.filter((resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );

        // If there's a search query, include only folders with matching resources
        // Otherwise, include all folders
        if (searchQuery.trim()) {
          if (matchingResources.length > 0) {
            acc[folderName] = {
              ...folderData,
              resources: matchingResources,
            };
          }
        } else {
          acc[folderName] = {
            ...folderData,
            resources: folderData.resources,
          };
        }

        return acc;
      },
      {},
    );

    setSearchedFolders(result);
  };

  useEffect(() => {
    applyFilters();
  }, [
    currentDocument,
    selectedSortOrder,
    selectedFileTypes,
    selectedDateRange,
  ]);

  useEffect(() => {
    applySearch();
  }, [filteredFolders, searchQuery]);

  const handleAddFolder = async (folderName: string) => {
    if (!folderName.trim() || !currentDocument?.id) {
      console.error('Folder name and document ID are required.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`api/db/documents/addFolder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: currentDocument.id,
          folderName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Error adding folder:', result.error);
        alert(result.error || 'Failed to add folder.');
        return;
      }

      console.log('Folder added successfully:', result.updatedFolders);

      // Optionally, refresh the document to reflect changes
      await fetchDocument(currentDocument.id);
      setIsAddFileModalOpen(false);
      setLoading(false);
    } catch (error) {
      console.error('Error adding folder:', error);
      alert('An error occurred while adding the folder.');
    }
  };

  if (loading) {
    return (
      <div className='flex h-full items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-400'>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors}>
      <div className='flex h-full w-full flex-col overflow-auto'>
        <TextInput
          placeholder='Search Resources'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button
          className='my-2 rounded-md bg-gray-800 px-2 py-1 text-sm text-white hover:bg-gray-700'
          onClick={() => setIsFilterModalOpen(true)}
        >
          Open Filters
        </button>

        <Divider />

        <div className='h-full overflow-scroll'>
          {Object.entries(searchedFolders).map(([key, folder]) => (
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
            />
          ))}
        </div>

        <Divider />

        <div className='flex justify-center'>
          <button
            onClick={() => setIsAddFileModalOpen(true)}
            className='w-full rounded-md bg-gray-800 px-2 py-1 text-sm text-white hover:bg-gray-700'
          >
            Add File
          </button>
        </div>

        <AddFileModal
          isOpen={isAddFileModalOpen}
          onClose={() => setIsAddFileModalOpen(false)}
          onSubmit={handleAddFolder}
        />

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={() => setIsFilterModalOpen(false)}
          selectedSortOrder={selectedSortOrder}
          setSelectedSortOrder={setSelectedSortOrder}
          selectedFileTypes={selectedFileTypes}
          setSelectedFileTypes={setSelectedFileTypes}
          selectedDateRange={selectedDateRange}
          setSelectedDateRange={setSelectedDateRange}
          availableFileTypes={availableFileTypes}
          handleApplyFilters={applyFilters}
        />
      </div>
    </DndContext>
  );
}
