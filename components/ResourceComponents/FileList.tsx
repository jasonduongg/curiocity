import React, { useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import TableFolder from "@/components/ResourceComponents/TableFolder";
import { Document, ResourceMeta, FolderData } from "@/types/types";
import TextInput from "../GeneralComponents/TextInput";

interface FileListProps {
  currentDocument: Document;
  onResourceClickCallBack: (resourceId: string) => void;
  onResourceMoveCallBack: (documentId: string) => void;
  currentResourceMeta: ResourceMeta | null;
}

export default function FileList({
  currentDocument,
  onResourceClickCallBack,
  onResourceMoveCallBack,
  currentResourceMeta,
}: FileListProps) {
  const sensors = useSensors(useSensor(PointerSensor));
  const [expandedFolders, setExpandedFolders] = useState<{
    [key: string]: boolean;
  }>(
    Object.fromEntries(
      Object.keys(currentDocument.folders).map((folderName) => [
        folderName,
        false,
      ]),
    ),
  );

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"dateAdded" | "lastOpened">(
    "lastOpened",
  );
  const [fileListKey, setFileListKey] = useState(0); // Key to force re-render

  const handleResourceClick = async (resourceId: string) => {
    setFileListKey((prevKey) => prevKey + 1);
    onResourceClickCallBack(resourceId);
  };

  const filteredAndSortedFolders = Object.entries(
    currentDocument.folders,
  ).reduce(
    (acc, [folderName, folderData]) => {
      const filteredResources = folderData.resources.filter((resource) =>
        resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );

      if (filteredResources.length > 0) {
        const sortedResources = [...filteredResources];

        if (sortBy === "dateAdded") {
          sortedResources.sort(
            (a, b) =>
              new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime(),
          );
        } else if (sortBy === "lastOpened") {
          sortedResources.sort(
            (a, b) =>
              new Date(b.lastOpened).getTime() -
              new Date(a.lastOpened).getTime(),
          );
        }

        acc[folderName] = { ...folderData, resources: sortedResources };
      }
      return acc;
    },
    {} as Record<string, FolderData>,
  );

  const handleSortChange = (newSortBy: "dateAdded" | "lastOpened") => {
    setSortBy(newSortBy);
  };

  return (
    <DndContext sensors={sensors}>
      <div className="flex h-full w-full flex-col overflow-auto">
        <TextInput
          placeholder="Search Resources"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2 pb-2 pt-2">
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === "dateAdded" ? "bg-gray-700" : "bg-gray-600"
            }`}
            onClick={() => handleSortChange("dateAdded")}
          >
            Sort by Date Added
          </button>
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === "lastOpened" ? "bg-gray-700" : "bg-gray-600"
            }`}
            onClick={() => handleSortChange("lastOpened")}
          >
            Sort by Last Opened
          </button>
        </div>
        <div key={fileListKey}>
          {Object.entries(filteredAndSortedFolders).map(([key, folder]) => (
            <TableFolder
              key={`${key}-${sortBy}`}
              folderData={folder}
              isExpanded={expandedFolders[key]}
              onToggle={() =>
                setExpandedFolders((prev) => ({
                  ...prev,
                  [key]: !prev[key],
                }))
              }
              onResourceClickCallBack={(resourceId) =>
                handleResourceClick(resourceId)
              }
              onResourceMoveCallBack={onResourceMoveCallBack}
              currentResourceMeta={currentResourceMeta}
              currentDocument={currentDocument}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
}
