import React, { useState, useEffect } from 'react';
import TagComponent from './TagComponent';
import ErrorModal from '@/components/ModalComponents/ErrorModal';

interface TagSectionProps {
  documentId: string;
  initialTags?: string[];
}

export default function TagSection({
  documentId,
  initialTags = [],
}: TagSectionProps) {
  const [tags, setTags] = useState<string[]>(initialTags);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Single error modal state

  useEffect(() => {
    setTags(initialTags); // Update when initialTags change
  }, [initialTags]);

  const handleDelete = async (tag: string) => {
    try {
      const res = await fetch(`/api/db/deleteTag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, tag }),
      });
      if (res.ok) {
        setTags((prevTags) => prevTags.filter((t) => t !== tag));
      } else {
        setErrorMessage('Failed to delete the tag.');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
      setErrorMessage('An error occurred while deleting the tag.');
    }
  };

  const handleAddTag = async (newTag: string): Promise<boolean> => {
    if (tags.includes(newTag)) {
      setErrorMessage('Duplicate tag not allowed.');
      return false;
    }

    try {
      const res = await fetch(`/api/db/newTag`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, tag: newTag }),
      });
      if (res.ok) {
        setTags((prevTags) => [...prevTags, newTag]);
        return true;
      } else {
        setErrorMessage('Failed to add new tag.');
        return false;
      }
    } catch (error) {
      console.error('Error adding new tag:', error);
      setErrorMessage('An error occurred while adding the tag.');
      return false;
    }
  };

  return (
    <div className='h-[5vh] w-full px-2'>
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setErrorMessage(null)}
        />
      )}
      <div className='flex h-full w-full flex-row items-center'>
        <span className='mr-2 text-white'>Tags:</span>
        <div className='flex h-full w-full flex-row items-center space-x-2 overflow-x-scroll'>
          <TagComponent newTag onAdd={handleAddTag} />
          {tags.map((tag, index) => (
            <TagComponent
              key={index}
              label={tag}
              onDelete={() => handleDelete(tag)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
