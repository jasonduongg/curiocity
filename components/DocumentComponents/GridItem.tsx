import MoreOptionsDropdown from "./MoreOptionsDropdown";
function stripHtmlTags(text: string) {
  return text.replace(/<\/?[^>]+(>|$)/g, "");
}

interface Props {
  documentId?: string; // Added documentId prop
  title: string;
  text: string;
  dateAdded: string;
  lastOpened: string;
  onClick: () => void;
  refreshState: () => void;
}

export default function GridItem({
  documentId,
  title,
  text,
  dateAdded,
  lastOpened,
  onClick,
  refreshState,
}: Props) {
  const formattedDateAdded = new Date(dateAdded).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const formattedLastOpened = new Date(lastOpened).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="flex h-80 max-w-[250px] cursor-pointer flex-col justify-between rounded-lg bg-bgSecondary shadow-md transition duration-300 ease-in-out hover:bg-bgPrimary"
      onClick={onClick}
    >
      <div className="flex h-full w-full min-w-48 flex-col items-stretch rounded-xl">
        <div className="grow overflow-y-hidden rounded-t-xl border-[1px] border-white p-2 px-4 py-4">
          <p className="line-clamp-[13] text-xs text-white">
            {stripHtmlTags(text)}
          </p>
        </div>

        <div className="flex h-20 flex-col justify-center rounded-b-xl border-[1px] border-textPrimary bg-bgPrimary">
          <div className="flex flex-row justify-between px-4">
            <div className="">
              <p className="text-base font-bold text-textPrimary">{title}</p>
              <p className="text-xs text-textPrimary">
                C: {formattedDateAdded}
              </p>
              <p className="text-xs text-textPrimary">
                O: {formattedLastOpened}
              </p>
            </div>
            <div className="flex flex-col justify-end">
              <MoreOptionsDropdown
                documentId={documentId}
                refreshState={refreshState}
                onEdit={() => console.log("Edit clicked for:", documentId)}
                onDuplicate={() =>
                  console.log("Duplicate clicked for:", documentId)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
