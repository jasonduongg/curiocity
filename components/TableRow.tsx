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
  return (
    <div className="flex gap-4 py-3">
      <div className="flex h-full w-10">
        {Icon && <Icon className={`h-5 w-5 text-${iconColor}`} />}
      </div>
      <div className="h-full grow">
        <p className="text-sm text-textPrimary">{title}</p>
      </div>
      <div className="h-full w-24">
        <p className="text-sm text-textPrimary">{dateAdded}</p>
      </div>
      <div className="h-full w-36">
        <p className="text-sm text-textPrimary">{lastViewed}</p>
      </div>
    </div>
  );
}
