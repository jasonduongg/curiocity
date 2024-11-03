// components/ResourceViewer.tsx

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import AccessibilityOptionsModal from "@/components/AccessibilityOptionsModal";

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
  const [textSize, setTextSize] = useState(14); // Initial text size
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

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

  const handleToggleViewMode = (checked: boolean) => {
    setViewMode(checked ? "Text" : "URL");
  };

  const openModal = () => {
    if (viewMode === "Text") {
      setIsModalOpen(true);
    }
  };
  const closeModal = () => setIsModalOpen(false);

  // Conditionally apply background and text color based on viewMode
  const textBackgroundColor = isDarkMode ? "bg-gray-900" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-2">
      {/* Fixed mini navigation bar */}
      <div className="mb-2 flex h-12 flex-shrink-0 items-center justify-between rounded-md px-2 py-1">
        <div>
          {viewMode === "Text" ? (
            <button
              onClick={openModal}
              className="whitespace-nowrap rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white"
            >
              Accessibility Options
            </button>
          ) : (
            <p className="whitespace-nowrap text-sm font-bold text-white">
              {resource.name}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="whitespace-nowrap text-sm text-white">
            Viewing as {viewMode}
          </label>
          <Switch
            checked={viewMode === "Text"}
            onCheckedChange={handleToggleViewMode}
          />
        </div>
      </div>

      {/* Content Display based on View Mode */}
      <div className="flex-grow overflow-hidden">
        {viewMode === "Text" ? (
          <div className="h-full overflow-y-auto">
            <div
              className={`rounded-md p-4 pb-16 ${textBackgroundColor} ${textColor}`} // Added `pb-8` for extra bottom padding
              style={{ fontSize: `${textSize}px`, minHeight: "100%" }}
            >
              <p className="whitespace-normal break-words">{resource.text}</p>
            </div>
          </div>
        ) : (
          <>
            {resource.url.toLowerCase().endsWith(".pdf") ? (
              <iframe
                src={resource.url}
                title="PDF Viewer"
                className="h-full w-full overflow-auto"
                style={{ border: "none" }}
              />
            ) : resource.url.toLowerCase().endsWith(".html") ? (
              <div className="h-full w-full overflow-auto bg-white">
                <iframe
                  src={resource.url}
                  title="HTML Viewer"
                  className="h-full w-full"
                  style={{ border: "none" }}
                />
              </div>
            ) : /\.(jpeg|jpg|png|gif)$/i.test(resource.url) ? (
              <img
                src={resource.url}
                alt="Resource"
                className="max-h-full max-w-full object-contain"
              />
            ) : csvData ? (
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
        )}
      </div>

      <AccessibilityOptionsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        textSize={textSize}
        setTextSize={setTextSize}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />
    </div>
  );
}
