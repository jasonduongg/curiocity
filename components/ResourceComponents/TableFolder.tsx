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
  const [sortedResources, setSortedResources] = useState<
    [Resource, string, string][]
  >([]);
  const [sortBy, setSortBy] = useState<"none" | "dateAdded" | "lastOpened">(
    "none",
  );

  useEffect(() => {
    const fetchAndSortResources = async () => {
      try {
        const resourcesWithDates: [Resource, string, string][] =
          await Promise.all(
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
              console.log("data last opened", data.lastOpened);
              return [resource, data.dateAdded, data.lastOpened];
            }),
          );

        const sorted = [...resourcesWithDates];

        if (sortBy === "dateAdded") {
          sorted.sort(
            (a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime(),
          );
        } else if (sortBy === "lastOpened") {
          sorted.sort(
            (a, b) => new Date(b[2]).getTime() - new Date(a[2]).getTime(),
          );
        }

        console.log("sorted resources: ", sorted);
        setSortedResources(sorted);
      } catch (error) {
        console.log("Failed to fetch resource meta:", error);
      }
    };

    if (isExpanded) {
      fetchAndSortResources();
    }
  }, [isExpanded, folderData.resources, sortBy]);

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
        <div className="flex gap-2 pb-2 pt-2">
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === "none" ? "bg-gray-700" : "bg-gray-600"
            }`}
            onClick={() => setSortBy("none")}
          >
            No Sort Filter
          </button>
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === "dateAdded" ? "bg-gray-700" : "bg-gray-600"
            }`}
            onClick={() => setSortBy("dateAdded")}
          >
            Sort by Date Added
          </button>
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === "lastOpened" ? "bg-gray-700" : "bg-gray-600"
            }`}
            onClick={() => setSortBy("lastOpened")}
          >
            Sort by Last Opened
          </button>
        </div>
      )}

      {isExpanded && (
        <div className="pt-1">
          {sortedResources.map(([resource, dateAdded, lastOpened]) => (
            <TableRow
              key={resource.id}
              icon={FileIcon}
              iconColor="white"
              title={resource.name}
              dateAdded={dateAdded || "Unknown"}
              lastViewed={lastOpened || "Unknown"}
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
