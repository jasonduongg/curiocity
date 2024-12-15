import { useState, useEffect } from 'react';
import { ResourceMeta } from '@/types/types';

interface NameEditorProps {
  initialName: string;
  resourceMeta: ResourceMeta;
  onNameChangeCallBack: (documentId: string) => void;
}

export default function NameEditor({
  initialName,
  resourceMeta,
  onNameChangeCallBack,
}: NameEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [resourceName, setResourceName] = useState(initialName);

  useEffect(() => {
    setResourceName(initialName);
  }, [initialName]);

  const handleSave = async () => {
    if (!resourceMeta || !resourceName.trim()) {
      alert('Resource name cannot be empty.');
      return;
    }

    try {
      const response = await fetch(`/api/db/resourcemeta/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: resourceMeta.id,
          name: resourceName,
          documentId: resourceMeta.documentId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update resource name.');
      }

      setIsEditing(false); // Exit editing mode
      onNameChangeCallBack(resourceMeta.documentId);
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
