'use client';

import React, { useState, useEffect } from 'react';
import TextEditor from '@/components/DocumentComponents/TextEditor';
import { useCurrentResource } from '@/context/AppContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import NotesEditor from '@/components/ResourceComponents/NotesEditor';
import Image from 'next/image';
import NameEditor from './NameEditor';

const ResourceViewer: React.FC = () => {
  const { currentResourceMeta, setCurrentResourceMeta } = useCurrentResource();
  const [viewMode, setViewMode] = useState<'URL' | 'Text'>('URL');
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [showEditor, setShowEditor] = useState(false); // Initialize as false
  const [resource, setResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the resource data
  const fetchResource = async () => {
    if (!currentResourceMeta?.hash) {
      console.error('Resource hash is missing. Cannot fetch resource.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/db/resource?hash=${currentResourceMeta.hash}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${response.statusText}`);
      }

      const resourceData = await response.json();
      setResource(resourceData);
    } catch (error) {
      console.error('Could not fetch resource', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [currentResourceMeta]);

  // Handle CSV loading
  useEffect(() => {
    if (resource && resource.url.toLowerCase().endsWith('.csv')) {
      fetch(resource.url)
        .then((response) => response.text())
        .then((text) => {
          const rows = text.trim().split('\n');
          setCsvData(rows.map((row) => row.split(',')));
        })
        .catch((error) => console.error('Error loading CSV file:', error));
    } else {
      setCsvData(null);
    }
  }, [resource]);

  if (isLoading) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <p className='text-white'>Loading...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className='flex h-full w-full items-center justify-center'>
        <p className='text-white'>Resource not found.</p>
      </div>
    );
  }

  return (
    <div className='flex h-full w-full flex-col overflow-hidden p-2'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='mb-2 flex h-12 items-center justify-between'>
          <div className='flex flex-col'>
            <NameEditor />
            {/* {!showEditor && (
              <div className='flex flex-row'>
                <p className='whitespace-nowrap pr-1 text-xs font-semibold text-white'>
                  Document Notes
                </p>
                <EditButton
                  onClick={() => setShowEditor(!showEditor)}
                  tooltip='Edit Resource Notes'
                />
              </div>
            )}
          </div>
          <div className='flex items-center space-x-2'>
            <label className='text-sm text-white'>View as {viewMode}</label>
            <Switch
              checked={viewMode === 'Text'}
              onCheckedChange={(checked) =>
                setViewMode(checked ? 'Text' : 'URL')
              }
            /> */}
          </div>
        </div>
        <button
          onClick={() => setShowEditor((prev) => !prev)}
          className='rounded-md border-[1px] border-zinc-700 px-4 py-2 text-sm text-white hover:bg-blue-700'
        >
          {showEditor ? 'Close Notes Editor' : 'Open Notes Editor'}
        </button>
      </div>

      {showEditor && <NotesEditor handleBack={() => setShowEditor(false)} />}

      <div className='flex-grow overflow-hidden'>
        {viewMode === 'Text' ? (
          <ReactMarkdown
            className='prose text-white'
            remarkPlugins={[remarkGfm]}
          >
            {resource?.markdown || ''}
          </ReactMarkdown>
        ) : resource.url.toLowerCase().endsWith('.pdf') ? (
          <iframe src={resource.url} className='h-full w-full border-none' />
        ) : /\.(jpeg|jpg|png|gif)$/i.test(resource.url) ? (
          <div className='relative h-full w-full overflow-hidden'>
            <Image
              src={resource.url}
              alt='Resource image'
              fill
              className='object-contain'
            />
          </div>
        ) : resource.url.toLowerCase().endsWith('.html') ? (
          <iframe
            src={resource.url}
            className='h-full w-full border-none bg-white'
            sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
          />
        ) : csvData ? (
          <table className='w-full text-white'>
            <thead>
              <tr>
                {csvData[0].map((header, index) => (
                  <th key={index} className='border p-2'>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className='border p-2'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className='text-white'>Unsupported file type</p>
        )}
      </div>
    </div>
  );
};

export default ResourceViewer;
