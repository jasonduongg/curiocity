"use client";
import React, { useState } from "react";
import MiniTextEditor from "@/components/ResourceComponents/MiniTextEditor";

// In-memory storage to simulate a database for notes
const notesDatabase: { [key: string]: string } = {};

// Mock function to fetch notes for a given resource ID
const mockFetchNotes = async (resourceId: string) => {
  return notesDatabase[resourceId] || ""; // Return saved notes or an empty string if no notes exist
};

// Mock function to save notes for a given resource ID
const mockSaveNotes = async (resourceId: string, notes: string) => {
  notesDatabase[resourceId] = notes; // Save notes to the in-memory database
  console.log(`Saved notes for ${resourceId}:`, notes);
  return;
};

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; name: string }[]
  >([]);
  const [openEditorFileId, setOpenEditorFileId] = useState<string | null>(null);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newFile = { id: `file-${Date.now()}`, name: file.name };
      setUploadedFiles([...uploadedFiles, newFile]);
    }
  };

  // Toggle notes editor for a specific file
  const toggleEditor = (fileId: string) => {
    setOpenEditorFileId((prev) => (prev === fileId ? null : fileId));
  };

  return (
    <div>
      {/* File Upload Button */}
      <input type="file" onChange={handleFileUpload} />

      {/* List of Uploaded Files */}
      <div>
        {uploadedFiles.map((file) => (
          <div key={file.id}>
            <span>{file.name}</span>
            <button onClick={() => toggleEditor(file.id)}>
              Add/Edit Notes
            </button>

            {/* MiniTextEditor for each file that opens when the button is clicked */}
            {openEditorFileId === file.id && (
              <MiniTextEditor
                resourceId={file.id}
                fetchNotes={mockFetchNotes}
                saveNotes={mockSaveNotes}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
