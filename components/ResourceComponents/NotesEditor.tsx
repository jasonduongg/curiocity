"use client";

import React, { useEffect, useState } from "react";
import TextEditor from "../DocumentComponents/TextEditor";

interface NotesEditorProps {
  resourceMetaId: string;
}

const NotesEditor: React.FC<NotesEditorProps> = ({ resourceMetaId }) => {
  const [notes, setNotes] = useState<string>(""); // State to hold the notes
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch notes for the given resourceMetaId
  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/db/resourcemeta/notes?id=${resourceMetaId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch notes: ${response.statusText}`);
        }
        const data = await response.json();
        setNotes(data.notes || ""); // Assume the API returns { notes: string }
      } catch (error) {
        console.error(error);
        setError("Failed to load notes. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [resourceMetaId]);

  // Save updated notes to the API
  const saveNotes = async (updatedNotes: string) => {
    try {
      const response = await fetch(`/api/db/resourcemeta/notes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resourceMetaId, notes: updatedNotes }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save notes: ${response.statusText}`);
      }
      console.log("Notes saved successfully.");
    } catch (error) {
      console.error(error);
      alert("Failed to save notes. Please try again.");
    }
  };

  // Render loading/error state
  if (loading) {
    return <p className="text-gray-500">Loading notes...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  // Render the TextEditor with the fetched notes
  return (
    <TextEditor
      mode="mini"
      resourceMeta={{ id: resourceMetaId, notes }} // Pass the notes into resourceMeta
      swapState={() => console.log("Closing editor...")} // Handle closing editor logic
      onSave={(updatedNotes: string) => {
        setNotes(updatedNotes); // Update local state
        saveNotes(updatedNotes); // Save to API
      }}
    />
  );
};

export default NotesEditor;
