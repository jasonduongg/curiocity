import { Resource } from "@/types/types";

interface ResourceViewerProps {
  resource: Resource | null;
}

export default function ResourceViewer({ resource }: ResourceViewerProps) {
  if (!resource) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-white">No resource selected</p>
      </div>
    );
  }

  const isPdf = resource.url.toLowerCase().endsWith(".pdf");

  return (
    <div className="h-full w-full overflow-hidden">
      {" "}
      {/* Wrapper with padding and overflow control */}
      <div className="h-full w-full overflow-hidden p-2">
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
