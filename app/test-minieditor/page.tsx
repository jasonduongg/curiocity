// src/pages/index.tsx or the main page of your app
"use client";
import React from "react";
import MiniTextEditor from "@/components/ResourceComponents/MiniTextEditor";

// Mock functions to simulate database fetch and save
const mockFetchNotes = async (resourceId: string) => {
  console.log(`Fetching notes for resource: ${resourceId}`);
  // Simulate an initial note for testing purposes
  return "These are the existing notes for this resource.";
};

const mockSaveNotes = async (resourceId: string, notes: string) => {
  console.log(`Saving notes for resource: ${resourceId}`);
  console.log("Saved notes:", notes);
  // Simulate saving without actually interacting with a database
  return;
};

export default function HomePage() {
  return (
    <div>
      <h1>Main Page</h1>

      {/* Render MiniTextEditor with a sample resourceId */}
      <MiniTextEditor
        resourceId="sample-resource-id-1" // Provide a unique ID for testing
        fetchNotes={mockFetchNotes}
        saveNotes={mockSaveNotes}
      />
    </div>
  );
}
