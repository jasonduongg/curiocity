"use client";

import React, { useState } from "react";
import TextEditor from "@/components/DocumentComponents/TextEditor";

// Mock database for notes
const notesDatabase: { [key: string]: string } = {};

// Mock function to fetch notes for a given resource ID
const mockFetchNotes = async (resourceId: string) => {
  console.log(`Fetching notes for resourceId: ${resourceId}`);
  return notesDatabase[resourceId] || ""; // Return saved notes or an empty string
};

// Mock function to save notes for a given resource ID
const mockSaveNotes = async (resourceId: string, notes: string) => {
  notesDatabase[resourceId] = notes; // Save notes to the mock database
  console.log(`Saved notes for ${resourceId}: ${notes}`);
  return;
};

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<
    { id: string; name: string }[]
  >([]);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newFile = { id: `file-${Date.now()}`, name: file.name };
      setUploadedFiles([...uploadedFiles, newFile]);
    }
  };

  return (
    <div className="p-4">
      <h1 className="mb-4 text-2xl font-bold">Mini Text Editor Example</h1>

      {/* File Upload Button */}
      <div className="mb-4">
        <input type="file" onChange={handleFileUpload} />
      </div>

      {/* List of Uploaded Files */}
      <div className="space-y-4">
        {uploadedFiles.map((file) => (
          <div key={file.id} className="rounded-md border border-gray-300 p-4">
            <div className="flex items-center justify-between">
              <span>{file.name}</span>
            </div>

            {/* TextEditor in mini mode */}
            <TextEditor
              mode="mini" // Enable mini mode
              resourceId={file.id} // Pass the resource ID
              fetchNotes={mockFetchNotes} // Mock function to fetch notes
              saveNotes={mockSaveNotes} // Mock function to save notes
              swapState={() => {}} // Dummy function (no "back" button needed here)
            />
          </div>
        ))}
      </div>
    </div>
  );
}
