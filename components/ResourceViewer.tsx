import { useEffect, useState } from "react";

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
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [viewMode, setViewMode] = useState<"URL" | "Text">("URL");

  useEffect(() => {
    if (resource && resource.url.toLowerCase().endsWith(".csv")) {
      // Fetch and parse CSV content without a library
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

  const handleToggleViewMode = () => {
    if (viewMode === "URL") {
      if (resource.text && resource.text.trim() !== "") {
        setViewMode("Text");
      } else {
        alert("Text content is empty, cannot switch to Text view.");
      }
    } else {
      setViewMode("URL");
    }
  };

  return (
    <div className="h-full w-full overflow-hidden p-2">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-white">Added on: {resource.dateAdded}</p>
        <button
          onClick={handleToggleViewMode}
          className="relative flex h-8 w-20 items-center rounded-full bg-gray-300 p-1 transition-colors duration-300"
        >
          <div
            className={`absolute h-6 w-6 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              viewMode === "URL" ? "translate-x-0" : "translate-x-12"
            }`}
          />
          <span
            className={`absolute left-3 text-sm font-medium transition-opacity duration-300 ${
              viewMode === "URL" ? "opacity-100" : "opacity-0"
            }`}
          >
            URL
          </span>
          <span
            className={`absolute right-3 text-sm font-medium transition-opacity duration-300 ${
              viewMode === "Text" ? "opacity-100" : "opacity-0"
            }`}
          >
            Text
          </span>
        </button>
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
