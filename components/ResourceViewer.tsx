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
    <div className="h-full w-full">
      <p className="text-white">{resource.dateAdded}</p>
      {isPdf ? (
        <iframe
          src={resource.url}
          title="PDF Viewer"
          className="h-full w-full"
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
  );
}
