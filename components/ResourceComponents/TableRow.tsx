import React, { useRef, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ResourceCompressed } from "@/types/types";

interface TableRowProps {
  resource: ResourceCompressed;
  folderName: string; // Add folderName as a prop
  isSelected: boolean; // Indicates if the resource is selected
  onResourceClickCallBack: (resourceId: string) => void;
  currentDocument: Document;
}

export function TableRow({
  resource,
  folderName, // Destructure folderName
  isSelected,
  onResourceClickCallBack,
  currentDocument,
}: TableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useDraggable({
      id: resource.id, // Unique ID for the draggable item
      data: { resourceId: resource.id, folderName }, // Include resourceId and folderName
    });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 0.2s ease",
    border: isSelected ? "2px solid blue" : "1px solid transparent", // Blue border if selected
  };

  const handlePointerDown = (event: React.PointerEvent) => {
    dragStartRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(false); // Reset dragging state
    listeners.onPointerDown?.(event); // Call the draggable listener
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (dragStartRef.current) {
      const distance = Math.sqrt(
        Math.pow(event.clientX - dragStartRef.current.x, 2) +
          Math.pow(event.clientY - dragStartRef.current.y, 2),
      );

      if (distance > 5) {
        setIsDragging(true); // Threshold for detecting drag
      }
    }
  };

  const handlePointerUp = async (event: React.PointerEvent) => {
    if (!isDragging) {
      try {
        const payload = {
          resourceId: resource.id,
          documentId: currentDocument.id,
          folderName,
        };
        console.log("Updating lastOpened with payload:", payload);

        const response = await fetch("/api/db/resourcemeta/updateLastOpened", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        console.log("API Response:", data);

        onResourceClickCallBack(resource.id);
      } catch (error) {
        console.error("Error updating lastOpened:", error);
      }
    }

    dragStartRef.current = null;
    listeners.onPointerUp?.(event);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex h-full cursor-pointer items-center gap-2 rounded-lg px-2 py-1 hover:border-blue-500"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div className="flex-grow overflow-hidden">
        <p className="truncate whitespace-nowrap text-sm text-textPrimary">
          {resource.name}
        </p>
      </div>
    </div>
  );
}

export default TableRow;
