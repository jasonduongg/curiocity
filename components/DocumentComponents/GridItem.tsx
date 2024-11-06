function stripHtmlTags(text: string) {
  return text.replace(/<\/?[^>]+(>|$)/g, "");
}

interface Props {
  title: string;
  text: string;
  dateAdded: string;
  onClick: () => void; // Add onClick as a prop
}

export default function GridItem({ title, text, dateAdded, onClick }: Props) {
  const formattedDate = new Date(dateAdded).toLocaleString("en-US", {
    year: "numeric",
    month: "short", // 3-letter month
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="flex min-w-[200px] flex-1 flex-wrap justify-start"
      onClick={() => onClick()}
    >
      <div className="flex h-64 w-48 min-w-48 flex-col items-stretch rounded-xl border-[1px] border-textSecondary">
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
