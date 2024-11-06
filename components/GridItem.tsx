interface Props {
  title: string;
  text: string;
  dateAdded: string;
  lastOpened?: string;
  onClick: () => void;
}

export default function GridItem({
  title,
  text,
  dateAdded,
  lastOpened,
  onClick,
}: Props) {
  const formattedDateAdded = new Date(dateAdded).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedLastOpened = lastOpened
    ? new Date(lastOpened).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : null;

  return (
    <div
      className="flex min-w-[200px] flex-1 flex-wrap justify-start"
      onClick={() => onClick()}
    >
      <div className="flex h-64 w-48 min-w-48 flex-col items-stretch rounded-xl border-[1px] border-textSecondary">
        <div className="max-h-32 flex-grow overflow-hidden text-ellipsis p-2">
          <p className="text-xs text-white">{text}</p>
        </div>
        <div className="flex-shrink-0 rounded-b-xl border-t-[1px] border-textPrimary bg-bgPrimary p-4">
          <p className="text-sm font-semibold text-textPrimary">{title}</p>
          {formattedLastOpened && (
            <p className="text-xs text-textPrimary">
              Last Opened: {formattedLastOpened}
            </p>
          )}
          <p className="text-xs text-textPrimary">
            Created: {formattedDateAdded}
          </p>
        </div>
      </div>
    </div>
  );
}
