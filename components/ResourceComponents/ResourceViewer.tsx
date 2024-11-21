import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import AccessibilityOptionsModal from "@/components/ModalComponents/AccessibilityOptionsModal";
import { Resource, ResourceMeta } from "@/types/types";
import ReactMarkdown from "react-markdown"; // Markdown rendering library
import remarkGfm from "remark-gfm"; // GitHub-flavored markdown plugin
import NotesEditor from "@/components/ResourceComponents/NotesEditor";
import EditButton from "@/components/GeneralComponents/EditButton";

export interface ResourceViewerProps {
  resource: Resource | null;
  resourceChangeCount: number;
  resourceMeta: ResourceMeta | null;
  onResourceNameUpdate?: () => void;
}

export default function ResourceViewer({
  resource,
  resourceMeta,
  resourceChangeCount,
  onResourceNameUpdate,
}: ResourceViewerProps) {
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [viewMode, setViewMode] = useState<"URL" | "Text">("URL");
  const [textSize, setTextSize] = useState(14); // Initial text size
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false); // Track editing state for resource name
  const [resourceName, setResourceName] = useState(resourceMeta?.name || ""); // Editable name

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
    setShowEditor(false);
  }, [resourceChangeCount]);

  useEffect(() => {
    setResourceName(resourceMeta?.name || "");
  }, [resourceMeta]);

  const handleToggleViewMode = (checked: boolean) => {
    setViewMode(checked ? "Text" : "URL");
  };

  const openModal = () => {
    if (viewMode === "Text") {
      setIsModalOpen(true);
    }
  };
  const closeModal = () => setIsModalOpen(false);

  const handleSaveResourceName = async () => {
    console.log(resourceName);
    console.log(resourceMeta.name);
    if (!resourceMeta || !resourceName.trim()) {
      alert("Resource name cannot be empty.");
      return;
    }

    // Check if the name is unchanged
    if (resourceName === resourceMeta.name) {
      console.log("Resource name is unchanged. Skipping API call.");
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`/api/db/resourcemeta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resourceMeta.id,
          name: resourceName,
          documentId: resourceMeta.documentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resource name.");
      }

      const updatedResource = await response.json();
      console.log("Resource name updated successfully:", updatedResource);

      // Call the onNameUpdate callback to update the list
      if (onResourceNameUpdate) {
        onResourceNameUpdate(resourceMeta.id, resourceName);
      }

      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating resource name:", error);
      alert("Failed to update resource name.");
    }
  };

  useEffect(() => {
    // Reset editing state when a new resource is loaded
    setIsEditingName(false);
  }, [resource]);

  const textBackgroundColor = isDarkMode ? "bg-gray-900" : "bg-white";
  const textColor = isDarkMode ? "text-white" : "text-black";

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-2">
      <div className="mb-2 flex h-12 flex-shrink-0 items-center justify-between rounded-md px-2 py-1">
        <div className="w-1/2">
          <div className="flex w-full flex-row">
            {viewMode === "Text" ? (
              <button
                onClick={openModal}
                className="whitespace-nowrap rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white"
              >
                Accessibility Options
              </button>
            ) : (
              <div className="flex w-full flex-col">
                <div className="flex items-center justify-between">
                  {isEditingName ? (
                    <input
                      value={resourceName}
                      onChange={(e) => setResourceName(e.target.value)}
                      onBlur={handleSaveResourceName}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveResourceName();
                      }}
                      className="w-full rounded-md bg-gray-800 p-1 text-white"
                    />
                  ) : (
                    <p
                      className="text-white"
                      onDoubleClick={() => setIsEditingName(true)}
                    >
                      {resourceName}
                    </p>
                  )}
                  <EditButton
                    onClick={() => setIsEditingName(true)}
                    tooltip="Edit Resource Name"
                    size={6}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">
                    Document Notes
                  </p>
                  <div className="mr-1">
                    <EditButton
                      onClick={() => setShowEditor(!showEditor)}
                      tooltip="Edit Notes"
                      size={4}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-1/2 items-center justify-end space-x-2">
          <label className="whitespace-nowrap text-sm text-white">
            Viewing as {viewMode}
          </label>
          <Switch
            checked={viewMode === "Text"}
            onCheckedChange={handleToggleViewMode}
          />
        </div>
      </div>

      {showEditor && <NotesEditor resourceMetaId={resourceMeta?.id || ""} />}

      <div className="mt-2 flex-grow overflow-hidden">
        {viewMode === "Text" ? (
          <div className="h-full overflow-y-auto">
            <div
              className={`rounded-md p-4 pb-16 ${textBackgroundColor} ${textColor}`}
              style={{ fontSize: `${textSize}px`, minHeight: "100%" }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose max-w-none"
              >
                {resource.markdown || ""}
              </ReactMarkdown>
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
