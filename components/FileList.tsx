// components/FileList.tsx
import { useState } from "react";
import TextInput from "@/components/TextInput";
import TableFolder from "@/components/TableFolder";

interface Resource {
  name: string;
  id: string;
}

type FolderData = {
  name: string;
  resources: Resource[];
};

type DocumentProps = {
  currentDocument?: {
    folders?: Record<string, FolderData>;
  };
};

function FileList({ currentDocument }: DocumentProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const [resourceUrl, setResourceUrl] = useState<string | null>(null);

  // Callback to receive the URL from TableRow
  const handleResourceUrl = (url: string) => {
    console.log("Received URL from TableRow:", url);
    setResourceUrl(url);
  };

  return (
    <div className="flex h-full flex-row justify-center">
      <div className="flex flex-grow overflow-hidden rounded-lg pl-4">
        <div className="flex h-full w-full items-center justify-center border-x-[1px] border-zinc-700">
          {resourceUrl ? (
            <img
              src={resourceUrl}
              alt="Resource"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <p className="text-white">No resource selected</p>
          )}
        </div>
      </div>

      <div className="w-1/3 items-center p-3 pr-4">
        <div className="mb-4 flex flex-col border-b-[1px] border-zinc-700 py-2">
          <TextInput
            placeholder="Find Resource..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="">
          {currentDocument?.folders &&
            Object.entries(currentDocument.folders).map(
              ([folderName, folderData]) => (
                <TableFolder
                  key={folderName}
                  folderName={folderData.name}
                  folderData={folderData}
                  onResourceUrl={handleResourceUrl}
                />
              ),
            )}
        </div>
      </div>
    </div>
  );
}

export default FileList;
