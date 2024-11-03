"use client";
import { TrashIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";

type DeleteProps = {
  documentId: string;
};

const DeleteConfirmationModal: React.FC<DeleteProps> = ({ documentId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleDelete = () => {
    console.log("File deleted: ", documentId);
    // delete api call
    fetch("/api/db", {
      method: "DELETE",
      body: JSON.stringify({
        id: documentId,
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        console.log(res);
        window.location.reload();
      });

    handleCloseModal();
  };

  return (
    <div>
      {/* <button
        
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          borderRadius: "0.3rem",
          color: "#fff",
          cursor: "pointer",
          border: "none",
        }}
      >
        Delete File
      </button> */}
      <div
        className="grid h-10 w-10 cursor-pointer place-items-center rounded-lg border-2 border-fileRed"
        onClick={handleOpenModal}
      >
        <TrashIcon className="h-6 w-6 text-fileRed"></TrashIcon>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div>
          <div
            onClick={handleCloseModal}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
            }}
          />

          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#1B111F",
              color: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              width: "40%",
              maxWidth: "700px",
              textAlign: "center",
              zIndex: 1001,
            }}
          >
            <h1 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
              Are you sure?
            </h1>
            <p
              style={{
                fontSize: "1rem",
                color: "#ccc",
                marginBottom: "1.5rem",
              }}
            >
              Are you sure you want to delete this file? This action cannot be
              undone.
            </p>

            <div
              style={{ display: "flex", justifyContent: "center", gap: "10px" }}
            >
              <button
                onClick={handleCloseModal}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: "0.3rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  border: "1px solid #000",
                  color: "#000",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                style={{
                  backgroundColor: "#8F3B3B",
                  borderRadius: "0.3rem",
                  padding: "0.5rem 1rem",
                  cursor: "pointer",
                  border: "none",
                  color: "#fff",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteConfirmationModal;
