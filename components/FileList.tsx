// components/FileList.tsx
import { useState } from "react";
import TableFolder from "@/components/TableFolder";
import ResourceViewer from "@/components/ResourceViewer";
import S3Button from "./S3Button";
import TextInput from "./TextInput";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

type Resource = {
  id: string;
  documentId: string;
  name: string;
  text: string;
  url: string;
  dateAdded: string;
};

type FolderData = {
  name: string;
  resources: Resource[];
};

type DocumentProps = {
  currentDocument?: {
    id: string;
    folders?: Record<string, FolderData>;
  };
  onResourceUpload: () => void;
};

function FileList({ currentDocument, onResourceUpload }: DocumentProps) {
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const handleResourceAPI = (resource: Resource) => {
    setCurrentResource(resource);
  };

  const openFileUploader = () => {
    setCurrentResource(null);
    setShowUploadForm(true);
  };

  const cancelFileUploader = () => {
    setCurrentResource(null);
    setShowUploadForm(false);
  };

  // If no document is selected, render a message
  if (!currentDocument) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-500">
        <p>No document selected</p>
      </div>
    );
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={65}>
        <div className="flex h-full flex-col overflow-hidden rounded-lg px-4">
          <div className="flex h-full w-full flex-col overflow-hidden border-zinc-700">
            {/* Toggle Button to Show S3 Form */}
            {!showUploadForm && (
              <div className="px-2 py-4">
                <button
                  onClick={openFileUploader}
                  className="w-full rounded-md border-[1px] border-zinc-700 py-1 text-sm text-white transition duration-300 hover:bg-gray-700"
                >
                  Upload New Files
                </button>
              </div>
            )}

            {/* Display message or resource viewer */}
            {!showUploadForm && !currentResource ? (
              <div className="flex h-full w-full items-center justify-center text-gray-500">
                <p>No resources selected</p>
              </div>
            ) : !showUploadForm && currentResource ? (
              <div className="h-full w-full px-2 pb-4">
                <div className="h-full w-full flex-grow overflow-auto rounded-lg border-[1px] border-zinc-700">
                  <ResourceViewer resource={currentResource} />
                </div>
              </div>
            ) : (
              <S3Button
                documentId={currentDocument.id}
                folderName="General"
                possibleFolders={currentDocument.folders}
                onResourceUpload={() => {
                  onResourceUpload();
                  setShowUploadForm(false);
                }}
                cancelCallBack={cancelFileUploader}
              />
            )}
          </div>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={35}>
        <div className="flex h-full w-full flex-col items-center p-3">
          <TextInput placeholder="Search Resource" />
          <div className="h-full w-full">
            {currentDocument.folders &&
              Object.entries(currentDocument.folders).map(
                ([folderName, folderData]) => (
                  <TableFolder
                    key={folderName}
                    folderName={folderData.name}
                    folderData={folderData}
                    onResource={handleResourceAPI}
                  />
                ),
              )}
          </div>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

export default FileList;
