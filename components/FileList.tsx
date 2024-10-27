// components/FileList.tsx
import { useState } from "react";
import TextInput from "@/components/TextInput";
import TableFolder from "@/components/TableFolder";

type FolderData = {
  name: string;
  resources: string[];
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

  return (
    <div className="flex h-full flex-row justify-center">
      <div className="flex flex-grow overflow-hidden rounded-lg pl-4">
        <div className="h-full w-full border-x-[1px] border-zinc-700">
          {/* Content goes here */}
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
                  folderName={folderName}
                  folderData={folderData}
                />
              ),
            )}
        </div>
      </div>
    </div>
  );
}

export default FileList;
