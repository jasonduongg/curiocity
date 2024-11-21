import React, { useState } from "react";
import TableRow from "@/components/ResourceComponents/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import { Resource, ResourceMeta } from "@/types/types";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface FolderData {
  name: string;
  resources: Resource[];
}

interface TableFolderProps {
  folderKey: string;
  folderName: string;
  folderData: FolderData;
  onResource: (resource: Resource, resourceMeta: ResourceMeta) => void;
  onNameUpdate: (resourceId: string, newName: string) => void;
  currentResource: Resource | null;
  showUploadForm: boolean;
  currentResourceMeta: ResourceMeta | null;
}

function DraggableItem({
  resource,
  onResource,
  currentResource,
  showUploadForm,
  sourceFolderKey,
  onNameUpdate,
}: {
  resource: Resource;
  onResource: (resource: Resource, meta: any) => void;
  currentResource: Resource | null;
  showUploadForm: boolean;
  sourceFolderKey: string;
  onNameUpdate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({
      id: resource.id,
      data: { sourceFolderKey },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TableRow
        icon={FileIcon}
        iconColor="white"
        title={resource.name}
        dateAdded={resource.dateAdded || "Unknown"}
        lastViewed={resource.lastViewed || "Unknown"}
        id={resource.id}
        isSelected={currentResource?.id === resource.id && !showUploadForm}
        onResource={onResource}
        onNameUpdate={onNameUpdate}
      />
    </div>
  );
}

function TableFolder({
  folderKey,
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

  const { setNodeRef, isOver } = useDroppable({ id: folderKey });

  return (
    <div className="mb-2">
      <div
        ref={setNodeRef}
        className={`cursor-pointer rounded-lg border-[1px] border-zinc-700 px-2 py-1 transition duration-300 hover:bg-gray-700 ${
          isOver ? "bg-accentPrimary" : ""
        }`}
        onClick={handleFolderClick}
      >
        <p className="text-sm font-semibold text-textPrimary">{folderName}</p>
      </div>
      {isExpanded && (
        <div className="pt-1">
          {folderData.resources.map((resource) => (
            <DraggableItem
              key={resource.id}
              resource={resource}
              onResource={onResource}
              currentResource={resource}
              showUploadForm={showUploadForm}
              sourceFolderKey={folderKey} // Pass the folder key to DraggableItem
              isSelected={
                currentResourceMeta?.id === resource.id && !showUploadForm
              }
              onNameUpdate={onNameUpdate} // Pass the function here
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TableFolder;
