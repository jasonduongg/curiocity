type Resource = {
  id: string;
  documentId: string;
  name: string;
  text: string;
  url: string;
  dateAdded: string;
};

interface ResourceViewerProps {
  resource: Resource | null;
}

export default function ResourceViewer({ resource }: ResourceViewerProps) {
  if (!resource) {
    return <p className="text-white">No resource selected</p>;
  }

  const isPdf = resource.url.toLowerCase().endsWith(".pdf");

  return (
    <div className="h-full w-full overflow-hidden px-2 pb-2">
      {" "}
      {/* Wrapper with padding and overflow control */}
      <div className="h-full w-full overflow-hidden rounded-lg border-2 border-zinc-700 p-2">
        <p className="text-white">{resource.dateAdded}</p>
        {isPdf ? (
          <iframe
            src={resource.url}
            title="PDF Viewer"
            className="mb-2 h-full w-full overflow-auto" // Overflow for iframe content
            style={{ border: "none" }}
          />
        ) : (
          <img
            src={resource.url}
            alt="Resource"
            className="max-h-full max-w-full object-contain"
          />
        )}
      </div>
    </div>
  );
}
