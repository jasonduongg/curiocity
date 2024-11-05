import React from "react";
import { Resource } from "@/types/types";

interface Props {
  icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  dateAdded: string;
  lastViewed: string;
  id: string;
  isSelected: boolean;
  onResource: (url: Resource) => void;
}

export default function TableRow({
  icon: Icon,
  iconColor,
  title,
  dateAdded,
  lastViewed,
  id,
  isSelected,
  onResource,
}: Props) {
  console.log(dateAdded, lastViewed);
  const handleClick = async () => {
    try {
      const response = await fetch(`/api/db/resource?resourceId=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resource");
      }
      const data: Resource = await response.json();
      onResource(data);
    } catch (error) {
      console.error("Error fetching resource URL:", error);
    }
  };

  return (
    <div
      className={`flex h-full cursor-pointer items-center gap-2 rounded-lg border px-2 py-1 ${
        isSelected ? "border-blue-500" : "border-transparent"
      }`}
      onClick={handleClick}
    >
      <div className="h-5 w-5 flex-shrink-0">
        {Icon && (
          <Icon className="h-full w-full" style={{ color: iconColor }} />
        )}
      </div>
      <div className="flex-grow overflow-hidden">
        <p className="truncate whitespace-nowrap text-sm text-textPrimary">
          {title}
        </p>
      </div>
    </div>
  );
}
