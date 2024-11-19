import { useState, useEffect } from "react";
import TableFolder from "@/components/ResourceComponents/TableFolder";
import ResourceViewer from "@/components/ResourceComponents/ResourceViewer";
import S3Button from "./S3Button";
import TextInput from "@/components/GeneralComponents/TextInput";
import ConfirmCancelModal from "@/components/ModalComponents/ConfirmCancelModal";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Resource, ResourceMeta } from "@/types/types";
import {
  DndContext,
  useSensor,
  useSensors,
  KeyboardSensor,
  PointerSensor,
  pointerWithin,
} from "@dnd-kit/core";

type FolderData = {
  name: string;
  resources: Resource[];
};

type DocumentProps = {
  currentDocument?: {
    id: string;
    folders?: Record<string, FolderData>;
  };
  onResourceUpload: () => void;
};

function FileList({ currentDocument, onResourceUpload }: DocumentProps) {
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [currentResourceMeta, setCurrentResourceMeta] =
    useState<ResourceMeta | null>(null);
  const [resourceChangeCount, setResourceChangeCount] = useState(0);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [pendingResource, setPendingResource] = useState<Resource | null>(null);

  // New state for folders
  const [folders, setFolders] = useState<Record<string, FolderData>>({});

  useEffect(() => {
    if (currentDocument && currentDocument.folders) {
      setFolders(currentDocument.folders);
    }
  }, [currentDocument]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    if (!over) {
      console.log("Dropped outside a valid target");
      return;
    }

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) {
      return;
    }

    setFolders((prevFolders) => {
      const newFolders = { ...prevFolders };

      let sourceFolderName = null;
      let sourceFolderIndex = null;

      // Find the source folder and resource index
      for (const [folderKey, folderData] of Object.entries(newFolders)) {
        const resourceIndex = folderData.resources.findIndex(
          (resource) => resource.id === activeId,
        );
        if (resourceIndex !== -1) {
          sourceFolderName = folderKey;
          sourceFolderIndex = resourceIndex;
          break;
        }
      }

      if (sourceFolderName == null) {
        console.error("Could not find source folder for resource", activeId);
        return prevFolders;
      }

      // Deep copy the source folder data
      const sourceFolderData = {
        ...newFolders[sourceFolderName],
        resources: [...newFolders[sourceFolderName].resources],
      };

      // Remove the resource from the source folder
      const [resource] = sourceFolderData.resources.splice(
        sourceFolderIndex,
        1,
      );

      // Update the source folder in newFolders
      newFolders[sourceFolderName] = sourceFolderData;

      // Deep copy the target folder data
      const targetFolderData = {
        ...newFolders[overId],
        resources: [...newFolders[overId].resources],
      };

      // Add the resource to the target folder
      targetFolderData.resources.push(resource);

      // Update the target folder in newFolders
      newFolders[overId] = targetFolderData;

      // **Make the API call to update the database**
      updateResourceFolderInDB(
        currentDocument.id,
        resource.id,
        sourceFolderName,
        overId,
      );

      return newFolders;
    });
  };

  const updateResourceFolderInDB = async (
    documentId: string,
    resourceId: string,
    sourceFolderName: string,
    targetFolderName: string,
  ) => {
    try {
      const response = await fetch("/api/db/resourcemeta", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          documentId,
          resourceId,
          sourceFolderName,
          targetFolderName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Failed to update resource folder:", errorData.err);
        return { success: false };
      } else {
        console.log("Resource folder updated successfully");
        return { success: true };
      }
    } catch (error) {
      console.error("Error updating resource folder:", error);
      return { success: false };
    }
  };

  const handleResourceAPI = (
    resource: Resource,
    resourceMeta: ResourceMeta,
  ) => {
    if (showUploadForm) {
      setPendingResource(resource);
      setShowConfirmCancelModal(true);
    } else {
      setCurrentResource(resource);
      setCurrentResourceMeta(resourceMeta);
      setResourceChangeCount((prevCount) => prevCount + 1);
    }
  };

  const confirmLeaveUploadForm = () => {
    setShowUploadForm(false);
    setShowConfirmCancelModal(false);
    setCurrentResource(pendingResource);
    setPendingResource(null);
    setResourceChangeCount((prevCount) => prevCount + 1);
  };

  const cancelLeaveUploadForm = () => {
    setShowConfirmCancelModal(false);
    setPendingResource(null);
  };

  const openFileUploader = () => {
    setCurrentResource(null);
    setShowUploadForm(true);
  };

  const cancelFileUploader = () => {
    setCurrentResource(null);
    setShowUploadForm(false);
  };

  if (!currentDocument) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>No document is selected</p>
      </div>
    );
  }

  return (
    <>
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={65}>
          <div className="flex h-full flex-col overflow-hidden rounded-lg px-4">
            <div className="flex h-full w-full flex-col overflow-hidden border-zinc-700">
              {!showUploadForm && (
                <div className="px-2 py-4">
                  <button
                    onClick={openFileUploader}
                    className="w-full rounded-md border-[1px] border-zinc-700 py-1 text-sm text-white transition duration-300 hover:bg-gray-700"
                  >
                    Upload New Files
                  </button>
                </div>
              )}

              {!showUploadForm && !currentResource ? (
                <div className="flex h-full w-full items-center justify-center text-gray-500">
                  <p>No resources selected</p>
                </div>
              ) : !showUploadForm && currentResource ? (
                <div className="h-full w-full px-2 pb-4">
                  <div className="h-full w-full flex-grow overflow-auto rounded-lg border-[1px] border-zinc-700">
                    <ResourceViewer
                      resource={currentResource}
                      resourceMeta={currentResourceMeta}
                      resourceChangeCount={resourceChangeCount}
                    />
                  </div>
                </div>
              ) : (
                currentDocument.id && (
                  <S3Button
                    documentId={currentDocument.id}
                    folderName="General"
                    possibleFolders={currentDocument.folders}
                    onResourceUpload={() => {
                      onResourceUpload();
                      setShowUploadForm(false);
                    }}
                    cancelCallBack={cancelFileUploader}
                  />
                )
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={35}>
          <div className="flex h-full w-full flex-col items-center p-5">
            <TextInput placeholder="Search Resource" />
            <div className="h-full w-full">
              <DndContext
                sensors={sensors}
                collisionDetection={pointerWithin}
                onDragEnd={handleDragEnd}
              >
                {folders &&
                  Object.entries(folders).map(([folderKey, folderData]) => (
                    <TableFolder
                      key={folderKey}
                      folderKey={folderKey}
                      folderName={folderData.name}
                      folderData={folderData}
                      onResource={handleResourceAPI}
                      currentResource={currentResource}
                      showUploadForm={showUploadForm}
                    />
                  ))}
              </DndContext>
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      {showConfirmCancelModal && (
        <ConfirmCancelModal
          onConfirm={confirmLeaveUploadForm}
          onCancel={cancelLeaveUploadForm}
          message="Are you sure you want to leave the uploading form? Unsaved changes will be lost."
        />
      )}
    </>
  );
}

export default FileList;
