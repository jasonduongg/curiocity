// components/GridItem.tsx
interface Props {
  title: string;
  text: string;
  dateAdded: string;
  onClick: () => void;
}

export default function GridItem({ title, text, dateAdded, onClick }: Props) {
  const formattedDate = new Date(dateAdded).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="flex h-64 w-full max-w-full cursor-pointer flex-col justify-between rounded-lg bg-zinc-800 p-4 shadow-md hover:bg-red-300"
      onClick={onClick}
    >
      <div className="flex-grow overflow-hidden p-2">
        <p className="text-xs text-white">{text}</p>
      </div>
      <div className="mt-2 rounded-lg border-textSecondary bg-bgPrimary p-2">
        <p className="text-sm font-semibold text-textPrimary">{title}</p>
        <p className="text-xs text-textSecondary">{formattedDate}</p>
      </div>
    </div>
  );
}
