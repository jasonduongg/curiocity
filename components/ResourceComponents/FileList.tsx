import React, { useState } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  DragEndEvent,
  PointerSensor,
} from "@dnd-kit/core";
import TableFolder from "@/components/ResourceComponents/TableFolder";
import { Document, ResourceMeta } from "@/types/types";

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
        false, // Default to expanded
      ]),
    ),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      console.log("Dropped outside of any folder");
      return;
    }

    const resourceId = String(active.id);
    const sourceFolder = active.data.current?.folderName;
    const targetFolder = over.data.current?.targetFolderName;

    if (sourceFolder && targetFolder && sourceFolder !== targetFolder) {
      try {
        const response = await fetch(`/api/db/resourcemeta/folders`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: currentDocument?.id,
            resourceId,
            sourceFolderName: sourceFolder,
            targetFolderName: targetFolder,
          }),
        });

        if (!response.ok) throw new Error("Failed to move resource");
        console.log("Resource moved successfully");
        onResourceMoveCallBack(currentDocument?.id); // Update the front end
      } catch (error) {
        console.error("Error moving resource:", error);
      }
    }
  };

  const toggleFolder = (folderName: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderName]: !prev[folderName],
    }));
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex h-full w-full flex-col overflow-auto">
        {Object.entries(currentDocument.folders).map(([key, folder]) => (
          <TableFolder
            key={key}
            folderData={folder}
            isExpanded={expandedFolders[key]} // Pass expanded state
            onToggle={() => toggleFolder(key)} // Toggle folder state
            onResourceClickCallBack={onResourceClickCallBack}
            onResourceMoveCallBack={onResourceMoveCallBack}
            currentResourceMeta={currentResourceMeta}
          />
        ))}
      </div>
    </DndContext>
  );
}
