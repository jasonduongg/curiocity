"use client";

interface Props {
  icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  dateAdded: string;
  lastViewed: string;
}

export default function TableRow({
  icon: Icon,
  iconColor,
  title,
  dateAdded,
  lastViewed,
}: Props) {
  console.log(dateAdded);
  console.log(lastViewed);
  return (
    <div className="flex h-full items-center gap-1 py-[1px]">
      <div className="h-full w-5">
        {Icon && <Icon className={`h-full w-full text-${iconColor}`} />}
      </div>
      <div className="h-full grow overflow-hidden">
        <p className="whitespace-nowrap text-sm text-textPrimary">{title}</p>
      </div>
      {/* <div className="h-full w-1/4">
        <p className="text-sm text-textPrimary">{dateAdded}</p>
      </div>
      <div className="h-full w-1/4">
        <p className="text-sm text-textPrimary">{lastViewed}</p>
      </div> */}
    </div>
  );
}
