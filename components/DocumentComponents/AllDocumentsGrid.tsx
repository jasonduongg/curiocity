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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = allDocuments.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="relative flex h-full w-full flex-col">
      <div className="h-1/8 flex w-full px-4 py-2">
        <div className="flex h-full w-full flex-row items-center justify-between">
          <div className="w-full px-4 pt-3">
            <TextInput
              placeholder="Search for documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-row space-x-2">
            <div className="w-full px-2 py-4">
              <div
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border-[1px] border-textSecondary duration-300 ease-in-out hover:bg-bgPrimary"
                onClick={onCreateNewReport}
              >
                <p className="text-lg text-textPrimary">+</p>
              </div>
            </div>

            {/* Sort Toggle Button */}
            <div className="w-full px-2 py-4">
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

      <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(200px,235px))] gap-x-6 gap-y-8 overflow-y-auto px-8 py-4">
        {filteredDocuments.map((item, index) => (
          <GridItem
            key={index}
            documentId={item.id}
            title={item.name}
            text={item.text}
            dateAdded={item.dateAdded}
            lastOpened={item.lastOpened}
            onClick={() => onDocumentClick(item)}
            refreshState={() => refreshState()}
          />
        ))}
      </div>
    </div>
  );
}
