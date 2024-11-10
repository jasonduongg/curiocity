"use client"; //to use hooks

import React, { useState, useEffect } from "react";

interface MiniTextEditorProps {
  resourceId: string; // ID of the file
  fetchNotes: (resourceId: string) => Promise<string>; // fetch notes func: takes in resourceId  and returns notes content string
  saveNotes: (resourceId: string, notes: string) => Promise<void>; // save notes func: takes in resourceId and notes, returns nothing
}

//function component w/ props
const MiniTextEditor: React.FC<MiniTextEditorProps> = ({
  resourceId,
  fetchNotes,
  saveNotes,
}) => {
  //3 state variables
  const [showEditor, setShowEditor] = useState(false); //editor visibility boolean
  const [notes, setNotes] = useState(""); //notes content string
  const [isSaving, setIsSaving] = useState(false); //boolean for saving
  const [hasLoadedNotes, setHasLoadedNotes] = useState(false); // tracks if notes have been loaded initially

  // Fetch notes when the component mounts
  useEffect(() => {
    fetchNotes(resourceId)
      .then((fetchedNotes) => {
        setNotes(fetchedNotes);
        setHasLoadedNotes(true); // Indicate that notes have been loaded
      })
      .catch((error) => console.error("Error fetching notes:", error));
  }, [resourceId, fetchNotes]);

  // Toggle the editor visibility boolean
  const toggleEditor = () => {
    setShowEditor((prev) => !prev);
  };

  // Handle saving notes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNotes(resourceId, notes);
      console.log("Notes saved successfully");
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="minitext-editor-container">
      <button onClick={toggleEditor} className="toggle-editor-button">
        {showEditor ? "Close Notes" : "Add/Edit Notes"}
      </button>

      {/* Display notes content if it exists and has been loaded */}
      {hasLoadedNotes && notes && !showEditor && (
        <div className="existing-notes">
          <p>{notes}</p>
        </div>
      )}

      {showEditor && (
        <div className="editor-content">
          <h3 className="editor-title">Document Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter notes here..."
            rows={4}
            className="notes-textarea"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="save-button"
          >
            {isSaving ? <div className="loader"></div> : "Save"}
          </button>
        </div>
      )}

      {/* Style for the component */}
      <style jsx>{`
        .minitext-editor-container {
          display: flex;
          flex-direction: column;
          align-items: start;
          width: 100%;
          max-width: 400px;
          border: 1px solid #333333;
          border-radius: 0.5rem;
          background-color: #130e16;
          color: white;
          padding: 1rem;
        }

        .existing-notes {
          width: 100%;
          margin-bottom: 0.5rem;
          padding: 0.5rem;
          border-radius: 0.5rem;
          color: white;
          font-size: 0.9rem;
        }

        .toggle-editor-button {
          width: 100%;
          padding: 0.5rem;
          background-color: transparent;
          border: 1px solid #333333;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 0.5rem;
        }

        .toggle-editor-button:hover {
          background-color: #333333;
        }

        .editor-content {
          display: flex;
          flex-direction: column;
          margin-top: 1rem;
          width: 100%;
        }

        .editor-title {
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .notes-textarea {
          width: 100%;
          background-color: #130e16;
          color: white;
          padding: 0.5rem;
          border-radius: 0.5rem;
          resize: none;
        }
        .notes-textarea:focus {
          outline: none;
        }

        .save-button {
          margin-top: 0.5rem;
          width: 100%;
          padding: 0.5rem;
          background-color: transparent;
          border: 1px solid #333333;
          color: white;
          font-size: 1rem;
          cursor: pointer;
          border-radius: 0.5rem;
        }

        .save-button:hover {
          background-color: #333333;
        }

        .loader {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default MiniTextEditor;
