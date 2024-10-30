// components/FileList.tsx
import { useState } from "react";
import TableFolder from "@/components/TableFolder";
import ResourceViewer from "@/components/ResourceViewer";
import S3Button from "./S3Button";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

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

  return (
    <div className="flex h-full flex-row justify-center overflow-hidden">
      <div className="flex flex-grow flex-col overflow-hidden rounded-lg pl-4">
        <div className="flex h-full w-full flex-col overflow-hidden border-zinc-700">
          {!showUploadForm ? (
            <div className="flex h-full w-full flex-col">
              <div className="px-2 py-4">
                <button
                  onClick={openFileUploader}
                  className="w-full rounded-md border-2 border-zinc-700 py-1 text-sm text-white transition duration-300 hover:bg-gray-700"
                >
                  Upload New Files
                </button>
              </div>
              <div className="m-2 mt-0 flex-grow overflow-auto rounded-lg border-[1px] border-zinc-700">
                <ResourceViewer resource={currentResource} />
              </div>
            </div>
          ) : (
            currentDocument?.id && (
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
            )
          )}
        </div>
      </div>

      <div className="w-1/3 items-center p-3">
        <div className="mb-4 flex flex-col border-b-[1px] border-zinc-700 py-2">
          <div className="flex flex-row items-center rounded-lg">
            <MagnifyingGlassIcon className="h-5 w-5 text-textPrimary" />
            <input
              id="username"
              type="text"
              className="w-full bg-bgSecondary px-2 py-1 text-sm text-textPrimary outline-none focus:outline-none"
              placeholder="Search Resource"
            />
          </div>
        </div>

        <div>
          {currentDocument?.folders &&
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
    </div>
  );
}

export default FileList;
