import React, { useState } from 'react';
import ResourceViewer from '@/components/ResourceComponents/ResourceViewer';
import S3Button from '@/components/ResourceComponents/S3Button';
import FileList from '@/components/ResourceComponents/FileList';
import { ResourceMeta, Document } from '@/types/types';

interface FileViewerProps {
  currentDocument?: Document;
  onNameChangeCallBack: (documentId: string) => void;
  onResourceMoveCallBack: (documentId: string) => void;
  onResourceUploadCallBack: (documentId: string) => void;
  onResourceClickForward: (documentId: string) => void;
}

const FileViewer: React.FC<FileViewerProps> = ({
  currentDocument,
  onNameChangeCallBack,
  onResourceMoveCallBack,
  onResourceUploadCallBack,
  onResourceClickForward,
}) => {
  const [currentResourceMeta, setCurrentResourceMeta] =
    useState<ResourceMeta | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [resourceViewerKey, setResourceViewerKey] = useState(0);

  const fetchResourceMeta = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/db/resourcemeta?resourceId=${resourceId}`,
      );
      if (!response.ok) throw new Error('Failed to fetch resource metadata');

      const resourceMetaData: ResourceMeta = await response.json();
      setCurrentResourceMeta(resourceMetaData);
      setResourceViewerKey((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching resource metadata:', error);
    }
  };

  const handleResourceClick = async (resourceId: string) => {
    fetchResourceMeta(resourceId);
    onResourceClickForward(currentDocument?.id);
  };

  const handleNameChange = () => {
    if (currentDocument?.id) {
      onNameChangeCallBack(currentDocument.id);
    }
  };

  const handleUploadCancel = () => {
    setShowUploadForm(false);
  };

  const handleResourceUpload = () => {
    if (currentDocument?.id) {
      onResourceUploadCallBack(currentDocument.id);
      setShowUploadForm(false);
    }
  };

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
            className='mb-4 w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white duration-200 hover:bg-gray-700'
          >
            Open Upload Form
          </button>
        )}

        {!showUploadForm && !currentResourceMeta ? (
          <div className='flex h-full w-full items-center justify-center text-gray-500'>
            <p>No resources selected</p>
          </div>
        ) : !showUploadForm && currentResourceMeta ? (
          <ResourceViewer
            key={resourceViewerKey}
            resourceMeta={currentResourceMeta}
            onNameChangeCallBack={handleNameChange}
          />
        ) : (
          <S3Button
            currentDocument={currentDocument}
            onCancel={handleUploadCancel}
            onResourceUploadCallBack={handleResourceUpload}
          />
        )}
      </div>

      <div className='w-1/3 border-l border-gray-700 p-4'>
        <FileList
          currentResourceMeta={currentResourceMeta}
          currentDocument={currentDocument}
          onResourceClickCallBack={handleResourceClick}
          onResourceMoveCallBack={onResourceMoveCallBack}
        />
      </div>
    </div>
  );
};

export default FileViewer;
