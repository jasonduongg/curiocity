"use client";
import React, { useState } from "react";

const NameYourReport: React.FC = () => {
  const [reportName, setReportName] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSave = () => {
    alert(`Report saved with name: ${reportName}`);
    handleCloseModal();
  };

  const handleSkip = () => {
    setReportName("");
    handleCloseModal();
  };

  return (
    <div>
      <button
        onClick={handleOpenModal}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#0070f3",
          borderRadius: "0.3rem",
          color: "#fff",
          cursor: "pointer",
          border: "none",
        }}
      >
        Open Modal
      </button>

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
              backgroundColor: "#121212",
              color: "#fff",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "35vw",
              maxWidth: "400px",
              textAlign: "left",
              zIndex: 1001,
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h1
              style={{
                fontSize: "1.2rem",
                marginBottom: "0.25rem",
              }}
            >
              Name your report.
            </h1>

            <p
              style={{
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: "1rem",
              }}
            >
              You can always change it later!
            </p>

            <input
              type="text"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
              style={{
                padding: "0.8rem",
                borderRadius: "8px",
                border: "2px solid #0777C9",
                outline: "none",
                backgroundColor: "#000",
                color: "#fff",
                fontSize: "1rem",
                width: "100%",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1rem",
                gap: "0.5rem",
              }}
            >
              <button
                onClick={handleSkip}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#0777C9",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Skip
              </button>

              <button
                onClick={handleSave}
                style={{
                  backgroundColor: "#0777C9",
                  borderRadius: "20px",
                  padding: "0.2rem 1.2rem",
                  color: "#fff",
                  border: "none",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NameYourReport;
