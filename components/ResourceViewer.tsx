import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";

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
  resourceChangeCount: number;
}

export default function ResourceViewer({
  resource,
  resourceChangeCount,
}: ResourceViewerProps) {
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [viewMode, setViewMode] = useState<"URL" | "Text">("URL");

  useEffect(() => {
    if (resource && resource.url.toLowerCase().endsWith(".csv")) {
      fetch(resource.url)
        .then((response) => response.text())
        .then((text) => {
          const rows = text.trim().split("\n");
          const data = rows.map((row) => row.split(","));
          setCsvData(data);
        })
        .catch((error) => console.error("Error loading CSV file:", error));
    } else {
      setCsvData(null);
    }
  }, [resource]);

  useEffect(() => {
    setViewMode("URL");
  }, [resourceChangeCount]);

  if (!resource) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-white">No resource selected</p>
      </div>
    );
  }

  const isPdf = resource.url.toLowerCase().endsWith(".pdf");
  const isHtml = resource.url.toLowerCase().endsWith(".html");
  const isImage = /\.(jpeg|jpg|png|gif)$/i.test(resource.url);
  const isCsv = resource.url.toLowerCase().endsWith(".csv");

  const handleToggleViewMode = (checked: boolean) => {
    if (checked && resource.text && resource.text.trim() !== "") {
      setViewMode("Text");
    } else if (!checked) {
      setViewMode("URL");
    } else {
      alert("Text content is empty, cannot switch to Text view.");
    }
  };

  // Format date to "Nov 1, 2024 11:00PM"
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(new Date(resource.dateAdded));

  return (
    <div className="h-full w-full overflow-hidden p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="whitespace-nowrap text-sm text-white">
          Added on: {formattedDate}
        </p>
        <div className="flex items-center space-x-4">
          <label className="whitespace-nowrap text-sm text-white">
            View as Text
          </label>
          <Switch
            checked={viewMode === "Text"}
            onCheckedChange={handleToggleViewMode}
          />
        </div>
      </div>

      {viewMode === "URL" ? (
        <>
          {isPdf ? (
            <iframe
              src={resource.url}
              title="PDF Viewer"
              className="mb-2 h-full w-full overflow-auto"
              style={{ border: "none" }}
            />
          ) : isHtml ? (
            <div className="h-full w-full overflow-auto bg-white">
              <iframe
                src={resource.url}
                title="HTML Viewer"
                className="h-full w-full"
                style={{ border: "none" }}
              />
            </div>
          ) : isImage ? (
            <img
              src={resource.url}
              alt="Resource"
              className="max-h-full max-w-full object-contain"
            />
          ) : isCsv && csvData ? (
            <div className="overflow-auto">
              <table className="w-full table-auto border-collapse text-white">
                <thead>
                  <tr>
                    {csvData[0].map((header, index) => (
                      <th
                        key={index}
                        className="border border-gray-600 bg-gray-800 p-2"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1).map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="border border-gray-600 p-2"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white">Unsupported file type</p>
          )}
        </>
      ) : (
        <div className="h-full w-full overflow-y-scroll">
          <div className="rounded-md bg-gray-800 p-4 text-white">
            <p className="whitespace-normal text-wrap break-words">
              {resource.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
