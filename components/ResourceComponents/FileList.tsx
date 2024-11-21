"use client";

import { useState, useEffect } from "react";
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor, pointerWithin } from "@dnd-kit/core";
import TextInput from "@/components/GeneralComponents/TextInput";
import TableFolder from "@/components/ResourceComponents/TableFolder";
import ResourceViewer from "@/components/ResourceComponents/ResourceViewer";
import S3Button from "@/components/ResourceComponents/S3Button";
import ConfirmCancelModal from "@/components/ModalComponents/ConfirmCancelModal";
import { Resource, ResourceMeta } from "@/types/types";

interface FolderData {
  name: string;
  resources: Resource[];
}

interface FileListProps {
  currentDocument?: {
    id: string;
    folders?: Record<string, FolderData>;
  };
  onResourceUpload: () => void;
}

const FileList: React.FC<FileListProps> = ({ currentDocument, onResourceUpload }) => {
  const [folders, setFolders] = useState<Record<string, FolderData>>({});
  const [currentResource, setCurrentResource] = useState<Resource | null>(null);
  const [currentResourceMeta, setCurrentResourceMeta] = useState<ResourceMeta | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false);
  const [pendingResource, setPendingResource] = useState<Resource | null>(null);
  const [resourceChangeCount, setResourceChangeCount] = useState(0);

  // Initialize folders when currentDocument changes
  useEffect(() => {
    if (currentDocument?.folders) {
      setFolders(currentDocument.folders);
    }
  }, [currentDocument]);

  // Sensors for drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  // Handle drag-and-drop end event
  const handleDragEnd = ({ active, over }: { active: any; over: any }) => {
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setFolders((prevFolders) => {
      const newFolders = { ...prevFolders };

      // Find the source folder and resource
      let sourceFolderName = null;
      let sourceFolderIndex = null;

      for (const [folderKey, folderData] of Object.entries(newFolders)) {
        const resourceIndex = folderData.resources.findIndex((resource) => resource.id === activeId);
        if (resourceIndex !== -1) {
          sourceFolderName = folderKey;
          sourceFolderIndex = resourceIndex;
          break;
        }
      }

      if (sourceFolderName == null) return prevFolders;

      // Remove resource from source folder
      const sourceFolderData = { ...newFolders[sourceFolderName] };
      const [resource] = sourceFolderData.resources.splice(sourceFolderIndex, 1);
      newFolders[sourceFolderName] = sourceFolderData;

      // Add resource to target folder
      const targetFolderData = { ...newFolders[overId] };
      targetFolderData.resources.push(resource);
      newFolders[overId] = targetFolderData;

      // Update database
      updateResourceFolderInDB(currentDocument?.id || "", resource.id, sourceFolderName, overId);

      return newFolders;
    });
  };

  // Update resource folder in the database
  const updateResourceFolderInDB = async (
    documentId: string,
    resourceId: string,
    sourceFolderName: string,
    targetFolderName: string
  ) => {
    try {
      await fetch("/api/db/resourcemeta", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId, resourceId, sourceFolderName, targetFolderName }),
      });
    } catch (error) {
      console.error("Error updating resource folder:", error);
    }
  };

  // Handle resource API
  const handleResourceAPI = (resource: Resource, resourceMeta: ResourceMeta) => {
    if (showUploadForm) {
      setPendingResource(resource);
      setShowConfirmCancelModal(true);
    } else {
      setCurrentResource(resource);
      setCurrentResourceMeta(resourceMeta);
      setResourceChangeCount((prev) => prev + 1);
    }
  };

  const confirmLeaveUploadForm = () => {
    setShowUploadForm(false);
    setShowConfirmCancelModal(false);
    setCurrentResource(pendingResource);
    setPendingResource(null);
    setResourceChangeCount((prev) => prev + 1);
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

  return (
    <>
      <div className="flex h-full w-full flex-col">
        <TextInput placeholder="Search Resource" />
        <div className="h-full w-full overflow-auto">
          <DndContext sensors={sensors} collisionDetection={pointerWithin} onDragEnd={handleDragEnd}>
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
      {showConfirmCancelModal && (
        <ConfirmCancelModal
          onConfirm={confirmLeaveUploadForm}
          onCancel={cancelLeaveUploadForm}
          message="Are you sure you want to leave the uploading form? Unsaved changes will be lost."
        />
      )}
      {showUploadForm && currentDocument?.id && (
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
      )}
    </>
  );
};

export default FileList;
