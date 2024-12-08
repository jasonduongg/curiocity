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
  const [sortBy, setSortBy] = useState<"dateAdded" | "lastOpened">("dateAdded");
  const [fileListKey, setFileListKey] = useState(0); // Key to force re-render
  const [newFolderName, setNewFolderName] = useState<string>(""); // Folder name input
  const [isAddingFolder, setIsAddingFolder] = useState<boolean>(false); // Toggle input form

  const handleResourceClick = async (
    resourceId: string,
    folderName: string,
  ) => {
    try {
      await fetch("/api/db/resourcemeta/updateLastOpened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId,
          documentId: currentDocument.id,
          folderName,
        }),
      });

      setFileListKey((prevKey) => prevKey + 1); // Force re-render
      onResourceClickCallBack(resourceId);
    } catch (error) {
      console.error("Error updating lastOpened:", error);
    }
  };

  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      await fetch("/api/db/documents/addFolder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: currentDocument.id,
          folderName: newFolderName,
        }),
      });

      currentDocument.folders[newFolderName] = {
        name: newFolderName,
        resources: [],
      };

      setFileListKey((prevKey) => prevKey + 1); // Force re-render
      setNewFolderName("");
      setIsAddingFolder(false); // Close the input form
    } catch (error) {
      console.error("Error adding new folder:", error);
    }
  };

  const filteredAndSortedFolders = Object.entries(
    currentDocument.folders,
  ).reduce(
    (acc, [folderName, folderData]) => {
      let filteredResources = folderData.resources;

      // Apply search query filtering
      if (searchQuery) {
        filteredResources = filteredResources.filter((resource) =>
          resource.name.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      }

      // Include folders with no resources if no search query is provided
      if (filteredResources.length > 0 || !searchQuery) {
        const sortedResources = [...filteredResources];

        if (sortBy === "dateAdded") {
          sortedResources.sort(
            (a, b) =>
              new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime(),
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
              sortBy === "dateAdded" ? "bg-gray-700" : "bg-gray-200"
            }`}
            onClick={() => handleSortChange("dateAdded")}
          >
            Sort by Date Added
          </button>
          <button
            className={`rounded-sm px-1.5 py-0.5 text-xs font-medium ${
              sortBy === "lastOpened" ? "bg-gray-700" : "bg-gray-200"
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
                handleResourceClick(resourceId, key)
              }
              onResourceMoveCallBack={onResourceMoveCallBack}
              currentResourceMeta={currentResourceMeta}
              currentDocument={currentDocument}
            />
          ))}
        </div>

        {!isAddingFolder ? (
          <button
            onClick={() => setIsAddingFolder(true)}
            className="mt-4 rounded-md border-[1px] border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            Add New Folder
          </button>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-2">
            <input
              type="text"
              placeholder="Folder Name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-grow rounded-md border-[1px] border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white"
            />
            <button
              onClick={handleAddFolder}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-500"
            >
              Submit
            </button>
            <button
              onClick={() => setIsAddingFolder(false)}
              className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-500"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </DndContext>
  );
}
