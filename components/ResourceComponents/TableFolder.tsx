import React, { useState } from "react";
import TableRow from "@/components/ResourceComponents/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import { Resource } from "@/types/types";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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

function DraggableItem({
  resource,
  onResource,
  currentResource,
  showUploadForm,
}: {
  resource: Resource;
  onResource: (resource: Resource) => void;
  currentResource: Resource | null;
  showUploadForm: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({ id: resource.id });

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
      />
    </div>
  );
}

function TableFolder({
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
            <DraggableItem
              key={resource.id}
              resource={resource}
              onResource={onResource}
              currentResource={currentResource}
              showUploadForm={showUploadForm}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TableFolder;
