// components/FileList.tsx
import { useState } from "react";
import TextInput from "@/components/TextInput";
import TableFolder from "@/components/TableFolder";
import ResourceViewer from "@/components/ResourceViewer";
import S3Button from "./S3Button";

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
  onResourceUpload: () => void; // New prop to notify of resource uploads
};

function FileList({ currentDocument, onResourceUpload }: DocumentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Callback to receive the resource from TableRow
  const handleResourceAPI = (resource: Resource) => {
    setCurrentResource(resource);
  };

  return (
    <div className="flex h-full flex-row justify-center">
      <div className="flex flex-grow overflow-hidden rounded-lg pl-4">
        <div className="flex h-full w-full flex-col items-center justify-center border-x-[1px] border-zinc-700">
          <ResourceViewer resource={currentResource} />
        </div>
      </div>

      <div className="w-1/3 items-center p-3 pr-4">
        {/* Conditionally render S3Button only if currentDocument and currentDocument.id exist */}
        {currentDocument?.id && (
          <div>
            <S3Button
              documentId={currentDocument.id}
              folderName="General"
              onResourceUpload={() => {
                onResourceUpload();
              }}
            />
          </div>
        )}
        <div className="mb-4 flex flex-col border-b-[1px] border-zinc-700 py-2">
          <TextInput
            placeholder="Find Resource..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
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
