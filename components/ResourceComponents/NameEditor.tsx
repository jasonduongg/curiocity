import { useState, useEffect } from 'react';
import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';

export default function NameEditor() {
  const { currentResourceMeta, setCurrentResourceMeta, fetchResourceMeta } =
    useCurrentResource();
  const { currentDocument, fetchDocument } = useCurrentDocument();

  const [isEditing, setIsEditing] = useState(false);
  const [resourceName, setResourceName] = useState('');

  useEffect(() => {
    if (currentResourceMeta?.name) {
      setResourceName(currentResourceMeta.name);
    }
  }, [currentResourceMeta]);

  const handleSave = async () => {
    if (!currentResourceMeta || !resourceName.trim()) {
      alert('Resource name cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`/api/db/resourcemeta/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentResourceMeta.id,
          name: resourceName,
          documentId: currentResourceMeta.documentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resource name.');
      }

      setIsEditing(false); // Exit editing mode

      // Update the resource meta in context
      const resourceMeta = await fetchResourceMeta(currentResourceMeta.id);
      setCurrentResourceMeta(resourceMeta);
      await fetchDocument(currentDocument.id);
    } catch (error) {
      console.error('Error updating resource name:', error);
      alert('Failed to update resource name.');
    }
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    if (isEditing) {
      handleSave();
    }
  };

  return isEditing ? (
    <input
      value={resourceName}
      onChange={(e) => setResourceName(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => e.key === 'Enter' && handleSave()}
      className='rounded-md border-[1px] border-zinc-700 bg-transparent p-1 text-white outline-none focus:ring-0'
    />
  ) : (
    <p
      onDoubleClick={handleDoubleClick}
      className='text-md cursor-pointer font-bold text-white'
    >
      {resourceName || 'Untitled Resource'}
    </p>
  );
}
