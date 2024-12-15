'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useS3Upload } from 'next-s3-upload';
import { FaCheckCircle, FaTrash, FaArrowLeft } from 'react-icons/fa';
import FolderDropdown from '@/components/ResourceComponents/FolderSelectionDropdown';
import { Document } from '@/types/types';

interface S3ButtonProps {
  currentDocument: Document;
  onCancel: () => void;
  onResourceUploadCallBack: () => void;
}

const S3Button: React.FC<S3ButtonProps> = ({
  currentDocument,
  onCancel,
  onResourceUploadCallBack,
}) => {
  const [selectedFolder, setSelectedFolder] = useState<string>('General');
  const [isNewFolder, setIsNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [fileQueue, setFileQueue] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, boolean>>(
    {},
  );
  const [isUploading, setIsUploading] = useState(false);
  const { uploadToS3 } = useS3Upload();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Ensure "General" folder exists
    if (!currentDocument.folders['General']) {
      currentDocument.folders['General'] = {
        name: 'General',
        resources: [],
      };
    }
  }, [currentDocument]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileQueue((prevQueue) => [
        ...prevQueue,
        ...Array.from(e.target.files),
      ]);
    }
  };

  const extractText = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('myFile', file);

    try {
      const response = await fetch('/api/resource_parsing', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${response.statusText} - ${JSON.stringify(errorData)}`,
        );
      }

      const { markdown } = await response.json();
      console.log(`Extracted Markdown for ${file.name}:`, markdown);
      return markdown;
    } catch (error) {
      console.error(`Error extracting text from ${file.name}:`, error.message);
      return null;
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
        const fileReader = new FileReader();
        fileReader.readAsDataURL(file);
        const fileDataUrl = await new Promise<string>((resolve, reject) => {
          fileReader.onload = () => resolve(fileReader.result as string);
          fileReader.onerror = (error) => reject(error);
        });

        const fileBase64 = fileDataUrl.split(',')[1]; // Extract Base64 portion of the data URL

        const parsedText = await extractText(file);
        if (!parsedText) {
          console.error(`Failed to parse text for file ${file.name}`);
          continue;
        }

        const { url } = await uploadToS3(file);
        await fetch('/api/db/resourcemeta', {
          method: 'POST',
          body: JSON.stringify({
            documentId: currentDocument.id,
            name: file.name,
            folderName: folderToSave,
            url,
            file: fileBase64, // Include file content
            markdown: parsedText, // Save the parsed text
            dateAdded: new Date().toISOString(),
            lastOpened: new Date().toISOString(),
          }),
          headers: { 'Content-Type': 'application/json' },
        });

        setUploadedFiles((prev) => ({ ...prev, [file.name]: true }));
      } catch (error) {
        console.error(`Error uploading file ${file.name}:`, error);
      }
    }

    setIsUploading(false);
    onResourceUploadCallBack();
    setFileQueue([]);
    onCancel();
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
          className='whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700'
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
          className='w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-blue-900'
        >
          Upload All Files
        </button>
        <button
          onClick={onCancel}
          disabled={isUploading}
          className={`w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white ${
            isUploading ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-900'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default S3Button;
