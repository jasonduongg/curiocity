'use client';

import React, { useState } from 'react';
import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';

import ResourceViewer from '@/components/ResourceComponents/ResourceViewer';
import S3Button from '@/components/ResourceComponents/S3Button';
import FileList from '@/components/ResourceComponents/FileList';

const FileViewer: React.FC = () => {
  const { currentDocument } = useCurrentDocument();
  const { currentResourceMeta } = useCurrentResource();

  const [showUploadForm, setShowUploadForm] = useState(false);

  if (!currentDocument) {
    return (
      <div className='flex h-full w-full items-center justify-center text-gray-500'>
        <p>No document selected</p>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full'>
      <div className='w-2/3 p-4'>
        {!showUploadForm && (
          <button
            onClick={() => setShowUploadForm(true)}
            className='mb-4 w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-blue-600'
          >
            Open Upload Form
          </button>
        )}

        {!showUploadForm && !currentResourceMeta ? (
          <div className='flex h-full w-full items-center justify-center text-gray-500'>
            <p>No resources selected</p>
          </div>
        ) : !showUploadForm && currentResourceMeta ? (
          <ResourceViewer />
        ) : (
          <S3Button
            onBack={() => {
              setShowUploadForm(false);
            }}
          />
        )}
      </div>

      {/* Right Panel */}
      <div className='w-1/3 border-l border-gray-700 p-4'>
        <FileList />
      </div>
    </div>
  );
};

export default FileViewer;
