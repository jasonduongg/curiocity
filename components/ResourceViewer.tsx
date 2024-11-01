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

  useEffect(() => {
    if (resource && resource.url.toLowerCase().endsWith(".csv")) {
      // Fetch and parse CSV content without a library
      fetch(resource.url)
        .then((response) => response.text())
        .then((text) => {
          // Split text by newlines to get rows
          const rows = text.trim().split("\n");
          // Split each row by commas to get cells
          const data = rows.map((row) => row.split(","));
          setCsvData(data);
        })
        .catch((error) => console.error("Error loading CSV file:", error));
    } else {
      setCsvData(null); // Reset CSV data if not a CSV file
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

  return (
    <div className="h-full w-full overflow-hidden p-2">
      <p className="mb-2 text-white">Added on: {resource.dateAdded}</p>

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
                    <td key={cellIndex} className="border border-gray-600 p-2">
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
    </div>
  );
}
