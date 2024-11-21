import GridItem from "@/components/DocumentComponents/GridItem";
import TextInput from "@/components/GeneralComponents/TextInput";
import { Document } from "@/types/types";
import { useState } from "react";

interface AllDocumentGridProps {
  allDocuments: Document[];
  onDocumentClick: (document: Document) => void;
  onCreateNewReport: () => void;
  refreshState: () => void;
  toggleSortOrder: () => void; // Add a prop to toggle sort order
  isSortedByLastOpened: boolean; // Prop to track current sorting state
}

export default function AllDocumentGrid({
  allDocuments,
  onDocumentClick,
  onCreateNewReport,
  refreshState,
  toggleSortOrder,
  isSortedByLastOpened,
}: AllDocumentGridProps) {
  console.log(allDocuments);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = allDocuments.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Header Section */}
      <div className="w-full flex-shrink-0 px-4 py-2">
        <div className="flex w-full items-center justify-between">
          <div className="w-full px-4">
            <TextInput
              placeholder="Search for documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-row space-x-2">
            {/* Create New Report Button */}
            <div className="flex items-center px-2 py-4">
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-[1px] border-textSecondary duration-300 ease-in-out hover:bg-bgPrimary"
                onClick={onCreateNewReport}
              >
                <p className="text-lg text-textPrimary">+</p>
              </div>
            </div>

            {/* Sort Toggle Button */}
            <div className="flex items-center px-2 py-4">
              <div
                className="flex h-10 w-auto cursor-pointer items-center justify-center rounded-xl border-[1px] border-textSecondary px-4 duration-300 ease-in-out hover:bg-bgPrimary"
                onClick={toggleSortOrder}
              >
                <p className="whitespace-nowrap text-sm text-textPrimary">
                  {isSortedByLastOpened ? "Last Opened" : "Last Added"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Grid */}
      <div className="h-full flex-grow overflow-hidden px-8 py-4">
        <div className="h-full overflow-y-auto">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,235px))] gap-x-6 gap-y-6">
            {filteredDocuments.map((item, index) => (
              <GridItem
                key={index}
                documentId={item.id}
                title={item.name}
                text={item.text}
                dateAdded={item.dateAdded}
                lastOpened={item.lastOpened}
                onClick={() => onDocumentClick(item)}
                refreshState={refreshState}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
