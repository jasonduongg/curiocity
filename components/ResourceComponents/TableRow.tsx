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
  onResource: (url: Resource, meta: any) => void;
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
      // Step 1: Fetch resourceMeta data using resourceId
      const resourceMetaResponse = await fetch(
        `/api/db/resourcemeta?resourceId=${id}`,
      );
      if (!resourceMetaResponse.ok) {
        throw new Error("Failed to fetch resourceMeta");
      }
      const resourceMetaData = await resourceMetaResponse.json();
      console.log("Fetched resourceMeta:", resourceMetaData);

      // Step 2: Use the hash from resourceMeta to fetch the actual resource
      const resourceResponse = await fetch(
        `/api/db/resource?hash=${resourceMetaData.hash}`,
      );
      if (!resourceResponse.ok) {
        throw new Error("Failed to fetch resource");
      }
      const resourceData: Resource = await resourceResponse.json();
      console.log("Fetched resource:", resourceData);

      // Step 3: Pass both resourceData and resourceMetaData to onResource
      onResource(resourceData, resourceMetaData);
    } catch (error) {
      console.error("Error fetching resource data:", error);
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
