"use client";

import React, { useState, useEffect } from "react";
import TextEditor from "@/components/DocumentComponents/TextEditor";
import { ResourceMeta } from "@/types/types";

interface NotesEditorProps {
  resourceMeta: ResourceMeta;
  handleBack: () => void;
}

const NotesEditor: React.FC<NotesEditorProps> = ({
  resourceMeta,
  handleBack,
}) => {
  const [notes, setNotes] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes using resourceMeta.id
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/db/resourcemeta/notes?id=${resourceMeta.id}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch notes: ${response.statusText}`);
        }
        const data = await response.json();
        setNotes(data.notes || ""); // Fallback to an empty string if no notes exist
      } catch (err) {
        console.error(err);
        setError("Failed to load notes. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [resourceMeta.id]);

  // Render loading/error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-gray-500">Loading notes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Render the TextEditor once notes are loaded
  return (
    <div className="flex flex-col py-2 text-white">
      <TextEditor
        mode="mini"
        source={{ ...resourceMeta, notes }} // Pass fetched notes to TextEditor
        generalCallback={handleBack}
      />
    </div>
  );
};

export default NotesEditor;
