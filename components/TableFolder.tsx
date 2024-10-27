import { useState } from "react";
import TableRow from "@/components/TableRow";
import { FileIcon } from "@radix-ui/react-icons";

interface FolderData {
  name: string;
  resources: string[];
}

interface TableFolderProps {
  folderName: string;
  folderData: FolderData;
}

export default function TableFolder({
  folderName,
  folderData,
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
          {folderData.resources.map((resourceId) => (
            <TableRow
              key={resourceId}
              icon={FileIcon}
              iconColor="textPrimary"
              title={resourceId}
              dateAdded="Unknown"
              lastViewed="Unknown"
            />
          ))}
        </div>
      )}
    </div>
  );
}
