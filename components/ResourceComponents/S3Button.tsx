'use client';

import React, { useState, useRef } from 'react';
import { FaCheckCircle, FaTrash, FaArrowLeft } from 'react-icons/fa';
import FolderDropdown from '@/components/ResourceComponents/FolderSelectionDropdown';
import { useCurrentResource } from '@/context/AppContext';
import { useCurrentDocument } from '@/context/AppContext';

interface S3ButtonProps {
  onBack: () => void; // Callback function for "Cancel" button
}

const S3Button = ({ onBack }: S3ButtonProps) => {
  // need to create new use Context called for global states such as loading, showS3,etc
  const { uploadResource } = useCurrentResource();
  const { currentDocument, fetchDocument } = useCurrentDocument();

  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>(
    {},
  );
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileQueue((prevQueue) => [
        ...prevQueue,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const handleUploadAll = async () => {
    if (fileQueue.length === 0) {
      alert('No files selected for upload.');
      return;
    }

    setIsUploading(true);
    const folderToSave = isNewFolder ? newFolderName : selectedFolder;

    for (const file of fileQueue) {
      try {
        await uploadResource(file, folderToSave, currentDocument.id);
        setUploadedFiles((prev) => ({ ...prev, [file.name]: true }));
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    setFileQueue([]);
    fetchDocument(currentDocument.id);
  };

  return (
    <div className='flex h-full flex-col'>
      <div className='flex items-center space-x-2 p-2'>
        <p className='text-sm text-white'>Select Folder:</p>
        {!isNewFolder ? (
          <FolderDropdown
            possibleFolders={Object.keys(currentDocument.folders)}
            selectedFolder={selectedFolder}
            onFolderChange={(folderName) => {
              setSelectedFolder(folderName);
              setIsNewFolder(folderName === 'Enter New Folder Name');
            }}
          />
        ) : (
          <>
            <button
              onClick={() => setIsNewFolder(false)}
              className='rounded-md p-1 text-white hover:bg-gray-700'
            >
              <FaArrowLeft />
            </button>
            <input
              type='text'
              placeholder='Enter new folder name'
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className='w-full rounded-lg border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white outline-none focus:border-white'
            />
          </>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className='whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white duration-200 hover:bg-gray-700'
        >
          Select Files
        </button>
      </div>

      <input
        type='file'
        multiple
        onChange={handleFileChange}
        className='hidden'
        ref={fileInputRef}
      />

      <div className='h-[30%] flex-grow overflow-y-auto'>
        <div className='flex h-full items-center justify-center overflow-y-auto rounded-xl border border-zinc-700 p-2'>
          {fileQueue.length === 0 ? (
            <p className='text-gray-400'>No files selected</p>
          ) : (
            <ul className='list-disc text-white'>
              {fileQueue.map((file, index) => (
                <div
                  key={index}
                  className='mb-2 flex items-center rounded-lg border-[1px] border-zinc-700'
                >
                  <p className='flex-1 whitespace-nowrap px-2 py-1 text-sm'>
                    {file.name}
                  </p>
                  {isUploading ? (
                    uploadedFiles[file.name] ? (
                      <FaCheckCircle className='mx-2 text-green-500' />
                    ) : (
                      <div className='ml-2 h-4 w-4' />
                    )
                  ) : (
                    <button
                      className='mx-2 text-red-500 hover:text-red-400'
                      onClick={() =>
                        setFileQueue((prevQueue) =>
                          prevQueue.filter((f) => f.name !== file.name),
                        )
                      }
                      aria-label={`Delete ${file.name}`}
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className='flex space-x-2 py-2'>
        <button
          onClick={handleUploadAll}
          className='w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white duration-200 hover:bg-blue-500'
        >
          Upload All Files
        </button>
        <button
          onClick={onBack}
          className='w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-red-900'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default S3Button;
