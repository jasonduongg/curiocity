// components/AllDocumentGrid.tsx
import GridItem from "@/components/GridItem";
import TextInput from "@/components/TextInput";

type Document = {
  id?: string;
  name: string;
  files: Array<string>;
  text: string;
  dateAdded: string;
  lastOpened?: string;
};

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
  return (
    <div className="h-full">
      <div className="flex flex-col border-b-[1px] border-zinc-700 pb-6">
        <div className="flex flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary px-8 py-2 text-sm">
          <TextInput placeholder="Search for documents..." />
        </div>
        <p className="mx-8 my-4 text-2xl font-semibold text-textPrimary">
          Create Report
        </p>
        <div
          className="mx-8 mt-4 grid cursor-pointer place-items-center rounded-xl border-[1px] border-textSecondary"
          onClick={onCreateNewReport}
        >
          <p className="text-4xl text-textPrimary">+</p>
        </div>
      </div>
      <p className="my-4 px-8 text-2xl font-medium text-textPrimary">
        Recent Reports
      </p>
      <div className="flex h-[50vh] w-full flex-wrap gap-8 overflow-y-scroll p-8">
        {allDocuments.map((item, index) => (
          <GridItem
            key={index}
            title={item.name}
            text={item.text}
            dateAdded={item.dateAdded}
            lastOpened={item.lastOpened}
            onClick={() => onDocumentClick(item)}
          />
        ))}
      </div>
    </div>
  );
}
