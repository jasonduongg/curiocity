// components/TableFolder.tsx

import React, { useState } from "react";
import TableRow from "@/components/TableRow";
import { FileIcon } from "@radix-ui/react-icons";

type Resource = {
  id: string;
  documentId: string;
  name: string;
  text: string;
  url: string;
  dateAdded: string;
};

interface FolderData {
  name: string;
  resources: Resource[];
}

interface TableFolderProps {
  folderName: string;
  folderData: FolderData;
  onResource: (url: Resource) => void;
  currentResource: Resource | null;
  showUploadForm: boolean; // Add showUploadForm prop
}

export default function TableFolder({
  folderName,
  folderData,
  onResource,
  currentResource,
  showUploadForm,
}: TableFolderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFolderClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-2">
      <div
        className="cursor-pointer rounded-lg border-[1px] border-zinc-700 px-2 py-1 transition duration-300 hover:bg-gray-700"
        onClick={handleFolderClick}
      >
        <p className="text-sm font-semibold text-textPrimary">{folderName}</p>
      </div>
      {isExpanded && (
        <div className="pt-1">
          {folderData.resources.map((resource) => (
            <TableRow
              key={resource.id}
              icon={FileIcon}
              iconColor="white"
              title={resource.name}
              dateAdded="Unknown"
              lastViewed="Unknown"
              id={resource.id}
              isSelected={
                currentResource?.id === resource.id && !showUploadForm
              }
              onResource={onResource}
            />
          ))}
        </div>
      )}
    </div>
  );
}
