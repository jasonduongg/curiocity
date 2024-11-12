import DeleteConfirmationModal from "../ModalComponents/DeleteConfirmationModal";
function stripHtmlTags(text: string) {
  return text.replace(/<\/?[^>]+(>|$)/g, "");
}

interface Props {
  documentId?: string; // Added documentId prop
  title: string;
  text: string;
  dateAdded: string;
  onClick: () => void;
  refreshState: () => void;
}

export default function GridItem({
  documentId,
  title,
  text,
  dateAdded,
  onClick,
  refreshState,
}: Props) {
  const formattedDate = new Date(dateAdded).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div className="flex h-64 w-full max-w-full cursor-pointer flex-col justify-between rounded-lg bg-zinc-800 p-4 shadow-md hover:bg-red-300">
      <DeleteConfirmationModal
        documentId={documentId}
        refreshState={refreshState}
      />
      <div
        className="flex h-full w-full min-w-48 flex-col items-stretch rounded-xl border-[1px] border-textSecondary"
        onClick={onClick}
      >
        <div className="grow overflow-y-hidden p-2">
          <p className="text-xs text-white">{stripHtmlTags(text)}</p>
        </div>
        <div className="flex h-16 flex-col rounded-xl border-[1px] border-textPrimary bg-bgPrimary p-2">
          <p className="text-sm text-textPrimary">{title}</p>
          <p className="text-sm text-textPrimary">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
