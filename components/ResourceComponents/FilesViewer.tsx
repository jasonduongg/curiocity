"use client";

import React, { useState } from "react";
import ResourceViewer from "@/components/ResourceComponents/ResourceViewer";
import S3Button from "@/components/ResourceComponents/S3Button";
import FileList from "@/components/ResourceComponents/FileList";
import { Resource, ResourceMeta } from "@/types/types";

interface FolderData {
  name: string;
  resources: Resource[];
}

interface FileViewerProps {
  currentDocument?: {
    id: string;
    folders?: Record<string, FolderData>;
  };
  setCurrentDocument: (doc: any) => void; // Function to update currentDocument state
}

const FileViewer: React.FC<FileViewerProps> = ({
  currentDocument,
  setCurrentDocument,
}) => {
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [currentResourceMeta, setCurrentResourceMeta] =
    useState<ResourceMeta | null>(null);
  const showUploadForm = useState(false);

  // Function to refresh the current document from the server
  const refreshDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/db?id=${documentId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch updated document");
      }

      const dynamoResponse = await response.json();
      const updatedDocument = AWS.DynamoDB.Converter.unmarshall(dynamoResponse);

      // Update currentDocument state with the fetched document
      setCurrentDocument(updatedDocument);
      console.log("Document refreshed:", updatedDocument);
    } catch (error) {
      console.error("Error refreshing document:", error);
    }
  };

  // Function to refresh resource metadata
  const refreshResourceMeta = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/db/resourcemeta?resourceId=${resourceId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch resource metadata");
      }

      const resourceMetaData = await response.json();
      setCurrentResourceMeta(resourceMetaData);
      console.log("Resource metadata refreshed:", resourceMetaData);
    } catch (error) {
      console.error("Error refreshing resource metadata:", error);
    }
  };

  // Handle resource name update with document and metadata refresh
  const handleNameUpdate = async (resourceId: string, newName: string) => {
    if (!currentDocument?.id || !newName.trim()) {
      console.error("Invalid update parameters");
      return;
    }

    try {
      const response = await fetch(`/api/db/resourcemeta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: resourceId,
          name: newName,
          documentId: currentDocument.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update resource name.");
      }

      console.log("Resource name updated successfully");

      // Refresh the document and resource metadata after a successful update
      await refreshDocument(currentDocument.id);
      await refreshResourceMeta(resourceId);
    } catch (error) {
      console.error("Error updating resource name:", error);
    }
  };

  return (
    <div className="flex h-full w-full">
      <div className="w-2/3 p-4">
        {currentResource && currentDocument?.id ? (
          <ResourceViewer
            resource={currentResource}
            resourceMeta={currentResourceMeta}
            resourceChangeCount={0}
            onResourceNameUpdate={async () => {
              if (currentDocument?.id) {
                await refreshDocument(currentDocument.id);
              }
              if (currentResourceMeta?.id) {
                await refreshResourceMeta(currentResourceMeta.id);
              }
            }}
          />
        ) : (
          currentDocument?.id && (
            <S3Button
              documentId={currentDocument.id}
              folderName="General"
              possibleFolders={currentDocument.folders}
              onResourceUpload={async () => {
                await refreshDocument(currentDocument.id);
              }}
            />
          )
        )}
      </div>

      <div className="w-1/3 border-l border-gray-700 p-4">
        <FileList
          currentDocument={currentDocument}
          onResource={(res, meta) => {
            setCurrentResource(res);
            setCurrentResourceMeta(meta);
          }}
          currentResource={currentResource}
          currentResourceMeta={currentResourceMeta}
          showUploadForm={showUploadForm}
          onNameUpdate={handleNameUpdate}
        />
      </div>
    </div>
  );
};

export default FileViewer;
