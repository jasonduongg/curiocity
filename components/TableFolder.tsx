import { useState } from "react";
import TableRow from "@/components/TableRow";
import { FileIcon } from "@radix-ui/react-icons";

interface Resource {
  name: string;
  id: string;
}

interface FolderData {
  name: string;
  resources: Resource[];
}

interface TableFolderProps {
  folderName: string;
  folderData: FolderData;
  onResourceUrl: (url: string) => void; // Define the callback prop
}

export default function TableFolder({
  folderName,
  folderData,
  onResourceUrl,
}: TableFolderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Toggle folder dropdown
  const handleFolderClick = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-2">
      <div
        className="cursor-pointer rounded-lg border-[1px] border-white px-2 py-1"
        onClick={handleFolderClick}
      >
        <p className="text-sm font-semibold text-textPrimary">{folderName}</p>
      </div>
      {isExpanded && (
        <div className="pt-1">
          {folderData.resources.map((resource) => (
            <TableRow
              key={resource.id}
              icon={FileIcon}
              iconColor="white" // Assuming a static color for simplicity
              title={resource.name}
              dateAdded="Unknown"
              lastViewed="Unknown"
              id={resource.id}
              onResourceUrl={onResourceUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}
