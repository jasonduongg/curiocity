'use client';

import React from 'react';

type DeleteProps = {
  documentId: string;
  refreshState: () => void;
  isOpen: boolean;
  onClose: () => void;
};

const DeleteConfirmationModal: React.FC<DeleteProps> = ({
  documentId,
  refreshState,
  isOpen,
  onClose,
}) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents event propagation to parent
    console.log('File deleted: ', documentId);
    // API call for deletion
    fetch('/api/db', {
      method: 'DELETE',
      body: JSON.stringify({
        id: documentId,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        console.log(res, documentId);
        refreshState(); // Refresh state after deletion
        onClose(); // Close modal
      })
      .catch((error) => console.error('Error deleting file:', error));
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevents event propagation to parent
    onClose(); // Close modal
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='w-full max-w-lg rounded-lg bg-gray-800 p-6 text-white shadow-lg'>
        <h1 className='mb-4 text-xl font-bold'>Are you sure?</h1>
        <p className='mb-6 text-sm text-gray-400'>
          Are you sure you want to delete this file? This action cannot be
          undone.
        </p>
        <div className='flex justify-end gap-4'>
          <button
            onClick={handleCancel}
            className='rounded-md border border-gray-500 px-4 py-2 text-sm text-gray-300 duration-200 hover:bg-gray-700'
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className='rounded-md bg-red-600 px-4 py-2 text-sm text-white duration-200 hover:bg-red-700'
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
