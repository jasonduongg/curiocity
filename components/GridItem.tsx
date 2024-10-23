interface Props {
  title: string;
  text: string;
  onClick: () => void; // Add onClick as a prop
}

export default function GridItem({ title, text, onClick }: Props) {
  return (
    <div
      className="flex min-w-[200px] flex-1 flex-wrap justify-start"
      onClick={onClick}
    >
      <div className="flex h-64 w-48 min-w-48 flex-col items-stretch rounded-xl border-[1px] border-textSecondary">
        <div className="grow overflow-y-hidden">
          <p className="text-white">{text}</p>
        </div>
        <div className="flex h-16 flex-col rounded-xl border-[1px] border-textPrimary bg-bgPrimary p-2">
          <p className="text-textPrimary">{title}</p>
        </div>
      </div>
    </div>
  );
}
