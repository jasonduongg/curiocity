'use client';

import GridItem from '@/components/DocumentComponents/GridItem';
import TextInput from '@/components/GeneralComponents/TextInput';
import { useState } from 'react';
import { useCurrentDocument } from '@/context/AppContext';
import { useSession } from 'next-auth/react';

export default function AllDocumentGrid({ onDocumentClick }) {
  const { data: session } = useSession();

  const { allDocuments, createDocument } = useCurrentDocument();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSortedByLastOpened, setIsSortedByLastOpened] = useState(false);

  const sortedDocuments = [...allDocuments].sort((a, b) => {
    const dateA = new Date(isSortedByLastOpened ? b.lastOpened : b.dateAdded);
    const dateB = new Date(isSortedByLastOpened ? a.lastOpened : a.dateAdded);

    if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) {
      return 0; // Fallback sorting if dates are invalid
    }

    return dateA.getTime() - dateB.getTime();
  });

  const filteredDocuments = sortedDocuments.filter((doc) => {
    if (!searchQuery.trim()) return true; // Show all if no query
    return (
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleCreateNewReport = () => {
    if (session?.user?.id) {
      createDocument('New Report', session.user.id);
    } else {
      console.error('User ID not found. Please log in.');
    }
  };

  const toggleSortOrder = () => {
    setIsSortedByLastOpened((prev) => !prev);
  };

  return (
    <div className='relative flex h-full w-full flex-col'>
      <div className='w-full flex-shrink-0 px-4 py-2'>
        <div className='flex w-full items-center justify-between'>
          <div className='w-full px-4'>
            <TextInput
              placeholder='Search for documents...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className='flex flex-row space-x-2'>
            <div className='flex items-center px-2 py-4'>
              <div
                className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-[1px] border-textSecondary duration-300 ease-in-out hover:bg-bgPrimary'
                onClick={handleCreateNewReport}
              >
                <p className='text-lg text-textPrimary'>+</p>
              </div>
            </div>
            <div className='flex items-center px-2 py-4'>
              <div
                className='flex h-10 w-auto cursor-pointer items-center justify-center rounded-xl border-[1px] border-textSecondary px-4 duration-300 ease-in-out hover:bg-bgPrimary'
                onClick={toggleSortOrder}
              >
                <p className='whitespace-nowrap text-sm text-textPrimary'>
                  {isSortedByLastOpened ? 'Last Opened' : 'Last Added'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='h-full flex-grow overflow-hidden px-8 py-4'>
        <div className='h-full overflow-y-auto'>
          <div className='grid grid-cols-[repeat(auto-fill,minmax(200px,235px))] gap-x-6 gap-y-6'>
            {filteredDocuments.map((doc) => (
              <GridItem
                key={doc.id}
                document={doc}
                onClick={() => onDocumentClick(doc.id)} // Pass down onDocumentClick
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
