'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import { useCurrentDocument, useCurrentResource } from '@/context/AppContext';

import NameYourReport from '@/components/DocumentComponents/newPrompt';
import FileViewer from '@/components/ResourceComponents/FilesViewer';
import NavBar from '@/components/GeneralComponents/NavBar';
import DocumentEditor from '@/components/DocumentComponents/DocumentEditor';
import AllDocumentsGrid from '@/components/DocumentComponents/AllDocumentsGrid';

import { FaSpinner } from 'react-icons/fa';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

export default function ReportHome() {
  const { data: session } = useSession();

  const {
    currentDocument,
    setCurrentDocument,
    allDocuments,
    fetchDocuments,
    isSortedByLastOpened,
    createDocument,
    viewingDocument,
    setViewingDocument,
  } = useCurrentDocument();

  const { setCurrentResource, setCurrentResourceMeta } = useCurrentResource();

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (session?.user?.id) fetchDocuments();
  }, [session, isSortedByLastOpened]);

  const handleSaveNewReport = async (name: string) => {
    if (!session?.user?.id) {
      console.error('User ID not found. Please log in.');
      return;
    }
    await createDocument(name, session.user.id);
    setIsModalOpen(false);
  };

  const handleBack = () => {
    fetchDocuments();
    setViewingDocument(false);
    setCurrentDocument(null);
    setCurrentResourceMeta(null);
    setCurrentResource(null);
  };

  if (!session?.user) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-black'>
        <div className='text-center text-white'>
          <FaSpinner className='mx-auto mb-4 animate-spin text-6xl' />
        </div>
      </div>
    );
  }

  return (
    <section className='h-screen overscroll-contain bg-bgPrimary'>
      <div className='flex h-full w-full flex-col items-start justify-start overflow-hidden'>
        {!currentDocument && <NavBar onLogoClick={handleBack} />}
        <ResizablePanelGroup
          direction='horizontal'
          className='flex-grow px-8 py-4'
        >
          <ResizablePanel>
            <div className='h-full w-full max-w-full gap-4 overflow-hidden bg-bgPrimary p-4'>
              <div className='max-w-1/2 h-full shrink grow basis-1/2 flex-col gap-4 overflow-hidden rounded-xl border-[1px] border-zinc-700'>
                <div className='h-full max-w-full grow flex-col overflow-hidden rounded-lg bg-bgSecondary'>
                  {viewingDocument ? (
                    <DocumentEditor
                      document={currentDocument}
                      handleBack={handleBack}
                    />
                  ) : (
                    <AllDocumentsGrid />
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle={true} className='my-4' />
          <ResizablePanel>
            <div className='h-full w-full p-4'>
              <div className='flex h-full flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary'>
                <FileViewer />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {isModalOpen && (
        <NameYourReport
          onSave={handleSaveNewReport}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
