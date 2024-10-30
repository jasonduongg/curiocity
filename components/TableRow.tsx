"use client";

type Resource = {
  id: string;
  documentId: string;
  name: string;
  text: string;
  url: string;
  dateAdded: string;
};

interface Props {
  icon: React.ComponentType<any>;
  iconColor: string;
  title: string;
  dateAdded: string;
  lastViewed: string;
  id: string; // Add an id prop to uniquely identify the resource
  onResource: (url: Resource) => void; // Define the callback prop
}

export default function TableRow({
  icon: Icon,
  iconColor,
  title,
  dateAdded,
  lastViewed,
  id,
  onResource,
}: Props) {
  console.log(dateAdded);
  console.log(lastViewed);
  const handleClick = async () => {
    try {
      const response = await fetch(`/api/db/resource?resourceId=${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch resource");
      }
      const data = await response.json();
      console.log("Resource URL:", data);
      onResource(data); // Call the callback with the URL
    } catch (error) {
      console.error("Error fetching resource URL:", error);
    }
  };

  return (
    <div
      className="flex h-full cursor-pointer items-center gap-1 py-[1px]"
      onClick={handleClick}
    >
      <div className="h-full w-5">
        {Icon && <Icon className={`h-full w-full text-${iconColor}`} />}
      </div>
      <div className="h-full grow overflow-hidden">
        <p className="whitespace-nowrap text-sm text-textPrimary">{title}</p>
      </div>
    </div>
  );
}
