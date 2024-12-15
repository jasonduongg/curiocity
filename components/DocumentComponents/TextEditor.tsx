'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import { Document, ResourceMeta } from '@/types/types';
import TagSection from '@/components/DocumentComponents/TagSection';

// Dynamically import ReactQuill with SSR disabled
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface TextEditorProps {
  mode: 'mini' | 'full';
  source: Document | ResourceMeta | undefined;
  generalCallback: () => void;
}

const TextEditor: React.FC<TextEditorProps> = ({
  mode,
  source,
  generalCallback,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [id, setID] = useState<string | undefined>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  useEffect(() => {
    if (!source) return;

    if (mode === 'full') {
      const document = source as Document;
      setTitle(document.name || '');
      setContent(document.text || '');
      setID(document.id || '');
    } else if (mode === 'mini') {
      const resourceMeta = source as ResourceMeta;
      setContent(resourceMeta.notes || '');
      setID(resourceMeta.id || '');
    }
  }, [mode, source]);

  const handleSave = async () => {
    if (!source) {
      console.error('No source provided for saving.');
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);

    try {
      if (mode === 'mini') {
        const resourceMeta = source as ResourceMeta;
        await fetch(`/api/db/ResourceMetaNotes`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: resourceMeta.id, notes: content }),
        });
      } else if (mode === 'full') {
        const document = source as Document;
        const updatedDocument: Document = {
          ...document,
          name: title,
          text: content,
        };
        await fetch('/api/db', {
          method: document.id ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDocument),
        });
      }

      setUploadComplete(true);
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Failed to save content.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (uploadComplete) {
      const timeout = setTimeout(() => setUploadComplete(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [uploadComplete]);

  const modules = {
    toolbar: [
      [{ header: '1' }, { header: '2' }, { font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [
        { list: 'ordered' },
        { list: 'bullet' },
        { indent: '-1' },
        { indent: '+1' },
      ],
      ['link', 'image', 'video'],
      ['clean'],
    ],
    clipboard: { matchVisual: false },
  };

  return (
    <div
      className={`flex h-full max-w-full flex-col rounded-xl text-white ${mode === 'full' ? 'p-4' : 'px-1'}`}
    >
      {mode === 'full' && id && <TagSection />}
      <div className='flex flex-grow flex-col'>
        {mode === 'full' && (
          <input
            type='text'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='Enter document title'
            className='text-md h-[5vh] w-full rounded-t-xl bg-bgSecondary px-2 font-bold outline-none'
          />
        )}
        <ReactQuill
          className='scrollbar-hide h-full max-w-full overflow-y-auto bg-bgSecondary text-white'
          modules={modules}
          value={content}
          onChange={setContent}
          placeholder='Write something amazing...'
        />
        <div className='flex h-[10vh] items-center justify-end space-x-4 rounded-b-xl bg-bgSecondary p-4'>
          {isUploading ? (
            <div className='flex items-center'>
              <div className='loader mr-2 h-5 w-5 animate-spin rounded-full border-2 border-gray-400 border-t-transparent'></div>
              <span className='text-gray-400'>Uploading...</span>
            </div>
          ) : (
            <>
              <button
                onClick={generalCallback}
                className='w-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700'
              >
                Back
              </button>
              <button
                onClick={handleSave}
                className='w-1/2 whitespace-nowrap rounded-md border border-zinc-700 bg-transparent px-2 py-1 text-sm text-white hover:bg-gray-700'
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
