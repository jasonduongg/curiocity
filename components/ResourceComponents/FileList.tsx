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
        <Divider></Divider>
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
        <Divider></Divider>
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
        <Divider></Divider>
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
        <Divider></Divider>
        <div className=''>
          <button
            onClick={handleClearFilters}
            className='rounded-md bg-gray-700 px-2 py-1 text-sm text-white hover:bg-gray-400'
          >
            Reset Filters
          </button>
        </div>
        <Divider></Divider>
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
  const { currentDocument } = useCurrentDocument();

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
  const [filteredFolders, setFilteredFolders] = useState({});
  const [searchedFolders, setSearchedFolders] = useState({});

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

        if (matchingResources.length > 0) {
          acc[folderName] = {
            ...folderData,
            resources: matchingResources,
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
