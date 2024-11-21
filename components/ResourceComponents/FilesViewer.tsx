import React, { useState } from "react";
import ResourceViewer from "@/components/ResourceComponents/ResourceViewer";
import S3Button from "@/components/ResourceComponents/S3Button";
import FileList from "@/components/ResourceComponents/FileList";
import ConfirmCancelModal from "@/components/ModalComponents/ConfirmCancelModal";
import { Resource, ResourceMeta, Document } from "@/types/types";

interface FileViewerProps {
  currentDocument?: Document;
  setCurrentDocument: (doc: any) => void;
  refreshDocument: () => void;
}

const FileViewer: React.FC<FileViewerProps> = ({
  currentDocument,
  refreshDocument,
}) => {
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [currentResourceMeta, setCurrentResourceMeta] =
    useState<ResourceMeta | null>(null);
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);

  const handleResourceClick = (resource: Resource, meta: ResourceMeta) => {
    if (showUploadForm) {
      setShowConfirmCancelModal(true); // Show the confirmation modal
    } else {
      setCurrentResource(resource);
      setCurrentResourceMeta(meta);
    }
  };

  const handleConfirmExit = () => {
    setShowUploadForm(false); // Exit S3 form
    setShowConfirmCancelModal(false); // Close the modal
  };

  const handleCancelExit = () => {
    setShowConfirmCancelModal(false); // Close the modal
  };

  const refreshResourceMeta = async (resourceId: string) => {
    try {
      const response = await fetch(
        `/api/db/resourcemeta?resourceId=${resourceId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) throw new Error("Failed to fetch resource metadata");

      const resourceMetaData = await response.json();
      setCurrentResourceMeta(resourceMetaData);
    } catch (error) {
      console.error("Error refreshing resource metadata:", error);
    }
  };

  if (!currentDocument) {
    return (
      <div className="flex h-full w-full items-center justify-center text-gray-500">
        <p>No document selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <div className="w-2/3 p-4">
        <div className="mb-4 flex w-full">
          {!showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)} // Toggle form visibility
              className="w-full rounded-md border-[1px] border-zinc-700 px-2 py-1 text-sm text-white hover:bg-blue-600"
            >
              Open Upload Form
            </button>
          )}
        </div>

        {!showUploadForm && !currentResource ? (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            <p>No resources selected</p>
          </div>
        ) : !showUploadForm && currentResource ? (
          <div className="h-full w-full pb-4">
            <div className="h-full w-full flex-grow overflow-auto rounded-lg border-[1px] border-zinc-700">
              <ResourceViewer
                resource={currentResource}
                resourceMeta={currentResourceMeta}
                onResourceNameUpdate={async () => {
                  if (currentDocument?.id) {
                    await refreshDocument();
                  }
                  if (currentResourceMeta?.id) {
                    await refreshResourceMeta(currentResourceMeta.id);
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <S3Button
            documentId={currentDocument.id}
            folderName="General"
            possibleFolders={currentDocument.folders}
            onResourceUpload={async () => {
              await refreshDocument();
              setShowUploadForm(false); // Automatically close form after upload
            }}
            onCancel={() => {
              // Show the confirmation modal instead of directly closing the form
              setShowConfirmCancelModal(true);
            }}
          />
        )}
      </div>

      <div className="w-1/3 border-l border-gray-700 p-4">
        <FileList
          currentDocument={currentDocument}
          onResource={(res, meta) => handleResourceClick(res, meta)} // Handle resource click
          currentResource={currentResource}
          currentResourceMeta={currentResourceMeta}
          onNameUpdate={async (resourceId, newName) => {
            if (!currentDocument?.id || !newName.trim()) return;

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

              if (!response.ok)
                throw new Error("Failed to update resource name.");

              await refreshDocument();
              await refreshResourceMeta(resourceId);
            } catch (error) {
              console.error("Error updating resource name:", error);
            }
          }}
        />
      </div>

      {/* Confirmation Modal */}
      {showConfirmCancelModal && (
        <ConfirmCancelModal
          onConfirm={handleConfirmExit}
          onCancel={handleCancelExit}
          message="Are you sure you want to exit the upload form? Unsaved changes will be lost."
        />
      )}
    </div>
  );
};

export default FileViewer;
