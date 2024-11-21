import React, { useState } from "react";
import TableRow from "@/components/ResourceComponents/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import { Resource, ResourceMeta } from "@/types/types";

interface FolderData {
  name: string;
  resources: Resource[];
}

interface TableFolderProps {
  folderName: string;
  folderData: FolderData;
  onResource: (resource: Resource, meta: ResourceMeta) => void;
  onNameUpdate: (resourceId: string, newName: string) => void;
  currentResource: Resource | null;
  showUploadForm: boolean;
  currentResourceMeta: ResourceMeta | null;
}

export default function TableFolder({
  folderName,
  folderData,
  onResource,
  onNameUpdate,
  currentResourceMeta,
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
              dateAdded={resource.dateAdded || "Unknown"}
              lastViewed={resource.lastViewed || "Unknown"}
              id={resource.id}
              isSelected={
                currentResourceMeta?.id === resource.id && !showUploadForm
              }
              onResource={onResource}
              onNameUpdate={onNameUpdate} // Pass the function here
            />
          ))}
        </div>
      )}
    </div>
  );
}
