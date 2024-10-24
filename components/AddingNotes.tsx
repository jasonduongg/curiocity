"use client";
import React, { useState } from "react";
import { format } from "date-fns";
import { Pencil1Icon } from "@radix-ui/react-icons";

const AddingNotes: React.FC = () => {
  const [title, setTitle] = useState<string>("joj");
  const [notes, setNotes] = useState<string>("Document Notes");
  const [isEditingTitle, setIsEditingTitle] = useState<boolean>(false);
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const currentDate = format(new Date(), "MM/dd/yyyy 'at' hh:mm a");
  const [uploadedAt, setUploadedAt] = useState<string>(currentDate);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    setUploadedAt(currentDate);
    closeModal();
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: "100%",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: "#fff",
          borderRadius: "0.5rem",
          padding: "1rem 2rem",
          color: "#000",
          cursor: "pointer",
          border: "1px solid black",
          marginBottom: "2rem",
        }}
      >
        Add note
      </button>

      {isModalOpen && (
        <div>
          <div
            onClick={closeModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          ></div>

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#1B111F",
              color: "#fff",
              padding: "2rem",
              borderRadius: "1rem",
              width: "80%",
              maxWidth: "600px",
              zIndex: 1001,
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "2rem",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <div
              style={{
                display: "flex",
                width: "55%",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              {isEditingTitle ? (
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#fff",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                    flexGrow: 1,
                    outline: "none",
                  }}
                  autoFocus
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    flexGrow: 1,
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {title}
                </h2>
              )}

              {!isEditingTitle && (
                <button
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    marginLeft: "0.5rem",
                  }}
                >
                  <Pencil1Icon width={16} height={16} color="#0070f3" />
                </button>
              )}
            </div>

            <p style={{ fontSize: "0.875rem", color: "#B4B3B7" }}>
              Uploaded: {uploadedAt} | PDF File
            </p>

            <div
              style={{
                borderTop: "1px solid #444",
                margin: "2rem 0",
              }}
            />

            <div
              style={{
                display: "flex",
                marginBottom: "5rem",
                width: "90%",
                marginTop: "1rem",
              }}
            >
              {isEditingNotes ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onBlur={() => setIsEditingNotes(false)}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    color: "#B4B3B7",
                    fontSize: "1rem",
                    fontWeight: "600",
                    letterSpacing: "-0.5px",
                    width: "100%",
                    minHeight: "6rem",
                    borderRadius: "0.5rem",
                    outline: "none",
                    padding: "1rem",
                  }}
                />
              ) : (
                <div style={{ display: "flex", width: "100%" }}>
                  <p
                    onClick={() => setIsEditingNotes(true)}
                    style={{
                      flexGrow: 1,
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600",
                      letterSpacing: "-0.5px",
                      color: "#B4B3B7",
                    }}
                  >
                    {notes}
                  </p>

                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        marginLeft: "0.5rem",
                      }}
                    >
                      <Pencil1Icon width={16} height={16} color="#0070f3" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              style={{
                fontSize: "0.875rem",
                backgroundColor: "#0777C9",
                borderRadius: "1rem",
                padding: "0.2rem 0.8rem",
                color: "#fff",
                cursor: "pointer",
                border: "none",
              }}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddingNotes;
