"use client";

interface Props {
  title: string;
}

export default function GridItem({ title }: Props) {
  return (
    <div className="flex flex-wrap justify-start">
      <div className="flex h-64 w-48 flex-col items-stretch rounded-xl border-[1px] border-textSecondary">
        <div className="grow"></div>
        <div className="flex h-16 flex-col rounded-xl border-[1px] border-textPrimary bg-bgPrimary p-2">
          <p className="text-textPrimary">{title}</p>
        </div>
      </div>
    </div>
  );
}
