// components/TableFolder.tsx

import React, { useState } from "react";
import TableRow from "@/components/ResourceComponents/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import { Resource } from "@/types/types";
import { Reorder } from "motion/react";

interface FolderData {
  name: string;
  resources: Resource[];
}

interface TableFolderProps {
  folderName: string;
  folderData: FolderData;
  onResource: (resource: Resource) => void;
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
  const [resources, setResources] = useState(folderData.resources); // Use folderData to initialize state

  const handleFolderClick = () => {
    setIsExpanded(!isExpanded);
    console.log(folderData);
  };

  const handleReorder = (updatedResources: Resource[]) => {
    setResources(updatedResources); // Update the local state with reordered resources
    console.log("Reordered resources:", updatedResources);
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
          <Reorder.Group values={resources} onReorder={handleReorder}>
            {resources.map((resource) => (
              <Reorder.Item key={resource.id} value={resource}>
                <TableRow
                  icon={FileIcon}
                  iconColor="white"
                  title={resource.name}
                  dateAdded={resource.dateAdded || "Unknown"}
                  lastViewed={resource.lastViewed || "Unknown"}
                  id={resource.id}
                  isSelected={
                    currentResource?.id === resource.id && !showUploadForm
                  }
                  onResource={onResource}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      )}
    </div>
  );
}
