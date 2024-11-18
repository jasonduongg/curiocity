import React, { useState } from "react";
import TableRow from "@/components/ResourceComponents/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import { Resource } from "@/types/types";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
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

function SortableItem({
  resource,
  onResource,
  currentResource,
  showUploadForm,
}: {
  resource: Resource;
  onResource: (resource: Resource, resourceMeta: any) => void;
  currentResource: Resource | null;
  showUploadForm: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: resource.id });

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

export default function TableFolder({
  folderName,
  folderData,
  onResource,
  currentResource,
  showUploadForm,
}: TableFolderProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resources, setResources] = useState(folderData.resources);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Minimum drag distance in pixels before drag activates
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleFolderClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    if (!over) {
      console.log("Dropped outside a valid target");
      return; // Exit if there is no valid target
    }

    if (active.id !== over.id) {
      setResources((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={resources}
              strategy={verticalListSortingStrategy}
            >
              {resources.map((resource) => (
                <SortableItem
                  key={resource.id}
                  resource={resource}
                  onResource={onResource}
                  currentResource={currentResource}
                  showUploadForm={showUploadForm}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
}
