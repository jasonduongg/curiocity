"use client";

import React from "react";
import TextInput from "@/components/GeneralComponents/TextInput";
import TableFolder from "@/components/ResourceComponents/TableFolder";
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
  onResource: (resource: Resource, meta: ResourceMeta) => void;
  currentResource: Resource | null;
  currentResourceMeta: ResourceMeta | null;
  showUploadForm: boolean;
}

const FileList: React.FC<FileListProps> = ({
  currentDocument,
  onResource,
  currentResource,
  currentResourceMeta,
  showUploadForm,
}) => {
  if (!currentDocument) {
    return (
      <div className="flex h-full items-center justify-center text-gray-500">
        <p>No document selected</p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center">
      <TextInput placeholder="Search Resource" />
      <div className="h-full w-full px-2">
        {currentDocument.folders &&
          Object.entries(currentDocument.folders).map(
            ([folderName, folderData]) => (
              <TableFolder
                key={folderName}
                folderName={folderData.name}
                folderData={folderData}
                onResource={onResource}
                currentResource={currentResource}
                currentResourceMeta={currentResourceMeta}
                showUploadForm={showUploadForm}
              />
            ),
          )}
      </div>
    </div>
  );
};

export default FileList;
