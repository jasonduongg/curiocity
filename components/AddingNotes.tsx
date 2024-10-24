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
        padding: "20px",
        maxWidth: "600px",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          backgroundColor: "#fff",
          borderRadius: "5px",
          padding: "10px 20px",
          color: "#000",
          cursor: "pointer",
          border: "1px solid black",
          marginBottom: "20px",
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
              padding: "20px",
              borderRadius: "10px",
              maxWidth: "600px",
              width: "100%",
              zIndex: 1001,
            }}
          >
            <button
              onClick={closeModal}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                backgroundColor: "transparent",
                border: "none",
                fontSize: "20px",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              &times;
            </button>

            <div
              style={{
                display: "flex",
                width: "400px",
                alignItems: "center",
                marginBottom: "10px",
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
                    fontSize: "24px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                    flexGrow: 1,
                    outline: "none",
                  }}
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  style={{
                    flexGrow: 1,
                    cursor: "pointer",
                    fontSize: "24px",
                    fontWeight: "700",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {title}
                </h2>
              )}

              <button
                onClick={() => setIsEditingTitle(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "2px",
                }}
              >
                <Pencil1Icon width={16} height={16} color="#0070f3" />{" "}
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#B4B3B7" }}>
              Uploaded: {uploadedAt} | PDF File
            </p>

            <div
              style={{
                borderTop: "1px solid #444",
                margin: "20px 0",
              }}
            />

            <div
              style={{
                display: "flex",
                marginBottom: "80px",
                width: "400px",
                marginTop: "20px",
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
                    color: "#fff",
                    fontSize: "16px",
                    fontWeight: "600",
                    letterSpacing: "-0.5px",
                    width: "100%",
                    minHeight: "100px",
                    borderRadius: "5px",
                    outline: "none",
                    padding: "10px",
                  }}
                />
              ) : (
                <p
                  onClick={() => setIsEditingNotes(true)}
                  style={{
                    flexGrow: 1,
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "600",
                    letterSpacing: "-0.5px",
                    color: "#B4B3B7",
                  }}
                >
                  {notes}
                </p>
              )}
              {/* Edit Icon */}
              <button
                onClick={() => setIsEditingNotes(true)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginLeft: "2px",
                  fontWeight: "600",
                }}
              >
                <Pencil1Icon width={16} height={16} color="#0070f3" />{" "}
              </button>
            </div>

            <button
              onClick={handleSave}
              style={{
                fontSize: "12px",
                backgroundColor: "#0777C9",
                borderRadius: "20px",
                padding: "4px 15px",
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
