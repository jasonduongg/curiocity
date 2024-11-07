// components/AllDocumentGrid.tsx
import GridItem from "@/components/DocumentComponents/GridItem";
import TextInput from "@/components/GeneralComponents/TextInput";
import { Document } from "@/types/types";
import { useState } from "react";

interface AllDocumentGridProps {
  allDocuments: Document[];
  onDocumentClick: (document: Document) => void;
  onCreateNewReport: () => void;
}

export default function AllDocumentGrid({
  allDocuments,
  onDocumentClick,
  onCreateNewReport,
}: AllDocumentGridProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDocuments = allDocuments.filter(
    (doc) =>
      doc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.text?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-1/4 w-full flex-col justify-center">
        <div className="w-full px-10 pt-3">
          <TextInput
            placeholder="Search for documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="w-full px-8 py-4">
          <div
            className="cursor-pointer rounded-xl border-[1px] border-textSecondary px-1 py-2"
            onClick={onCreateNewReport}
          >
            <div className="flex h-full w-full items-center justify-center">
              <p className="text-lg text-textPrimary">Add New Document</p>
            </div>
          </div>
        </div>
      </div>

      <div className="justify-left flex w-full grow flex-wrap gap-8 overflow-y-auto p-8">
        {filteredDocuments.map((item, index) => (
          <div key={index} className="flex-shrink-0 flex-grow-0">
            <GridItem
              key={index}
              title={item.name}
              text={item.text}
              dateAdded={item.dateAdded}
              onClick={() => onDocumentClick(item)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
