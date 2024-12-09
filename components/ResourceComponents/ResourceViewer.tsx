import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Resource, ResourceMeta } from "@/types/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import NotesEditor from "@/components/ResourceComponents/NotesEditor";
import EditButton from "@/components/GeneralComponents/EditButton";
import NameEditor from "@/components/ResourceComponents/NameEditor";
import Image from "next/image";

export interface ResourceViewerProps {
  resourceMeta: ResourceMeta;
  onNameChangeCallBack: (documentId: string) => void;
}

export default function ResourceViewer({
  resourceMeta,
  onNameChangeCallBack,
}: ResourceViewerProps) {
  const [viewMode, setViewMode] = useState<"URL" | "Text">("URL");
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResource = async () => {
    if (!resourceMeta?.hash) {
      console.error("Resource hash is missing. Cannot fetch resource.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/db/resource?hash=${resourceMeta.hash}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch resource: ${response.statusText}`);
      }

      const resourceData = await response.json();
      setResource(resourceData);
    } catch (error) {
      console.error("Could not fetch resource", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
  }, [resourceMeta]);

  useEffect(() => {
    if (resource && resource.url.toLowerCase().endsWith(".csv")) {
      fetch(resource.url)
        .then((response) => response.text())
        .then((text) => {
          const rows = text.trim().split("\n");
          setCsvData(rows.map((row) => row.split(",")));
        })
        .catch((error) => console.error("Error loading CSV file:", error));
    } else {
      setCsvData(null);
    }
  }, [resource]);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-white">Resource not found.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden p-2">
      <div className="mb-2 flex h-12 items-center justify-between">
        <div className="flex flex-col">
          <NameEditor
            initialName={resourceMeta?.name || ""}
            resourceMeta={resourceMeta}
            onNameChangeCallBack={onNameChangeCallBack}
          />
          {!showEditor && (
            <div className="flex flex-row">
              <p className="whitespace-nowrap pr-1 text-xs font-semibold text-white">
                {" "}
                Document Notes{" "}
              </p>
              <EditButton
                onClick={() => setShowEditor(!showEditor)}
                tooltip="Edit Resource Notes"
              />
            </div>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-white">View as {viewMode}</label>
          <Switch
            checked={viewMode === "Text"}
            onCheckedChange={(checked) => setViewMode(checked ? "Text" : "URL")}
          />
        </div>
      </div>

      {showEditor && (
        <NotesEditor
          resourceMeta={resourceMeta}
          handleBack={() => setShowEditor(false)} // Example: Close the editor when done
        />
      )}

      <div className="flex-grow overflow-hidden">
        {viewMode === "Text" ? (
          <ReactMarkdown
            className="prose text-white"
            remarkPlugins={[remarkGfm]}
          >
            {resource?.markdown || ""}
          </ReactMarkdown>
        ) : resource.url.toLowerCase().endsWith(".pdf") ? (
          <iframe src={resource.url} className="h-full w-full border-none" />
        ) : /\.(jpeg|jpg|png|gif)$/i.test(resource.url) ? (
          <Image
            src={resource.url}
            alt="Resource image"
            fill
            className="bject-contain"
          />
        ) : resource.url.toLowerCase().endsWith(".html") ? (
          <iframe
            src={resource.url}
            className="h-full w-full border-none bg-white"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />
        ) : csvData ? (
          <table className="w-full text-white">
            <thead>
              <tr>
                {csvData[0].map((header, index) => (
                  <th key={index} className="border p-2">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {csvData.slice(1).map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border p-2">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-white">Unsupported file type</p>
        )}
      </div>
    </div>
  );
}
