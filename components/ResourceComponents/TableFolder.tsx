// components/TableFolder.tsx

import React, { useState, useEffect } from "react";
import TableRow from "@/components/ResourceComponents/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import { Resource } from "@/types/types";

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
  const [sortedResources, setSortedResources] = useState<[Resource, string][]>(
    [],
  );

  useEffect(() => {
    if (isExpanded) {
      const fetchAndSortResources = async () => {
        try {
          const resourcesWithDates: [Resource, string][] = await Promise.all(
            folderData.resources.map(async (resource) => {
              const response = await fetch(
                `/api/db/resourcemeta?resourceId=${resource.id}`,
                {
                  method: "GET",
                },
              );

              const data = await response.json();
              console.log("testing data object", data);
              console.log("data date added", data.dateAdded);
              return [resource, data.dateAdded];
            }),
          );

          const sorted = resourcesWithDates.sort((a, b) => {
            return new Date(b[1]).getTime() - new Date(a[1]).getTime();
          });

          console.log("sorted resources: ", sorted);
          setSortedResources(sorted);
        } catch (error) {
          console.log("Failed to fetch resource meta:", error);
        }
      };

      if (isExpanded) {
        fetchAndSortResources();
      }
    }
  }, [isExpanded, folderData.resources]);

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
          {sortedResources.map(([resource, dateAdded]) => (
            <TableRow
              key={resource.id}
              icon={FileIcon}
              iconColor="white"
              title={resource.name}
              dateAdded={dateAdded || "Unknown"}
              lastViewed={resource.lastViewed || "Unknown"}
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
