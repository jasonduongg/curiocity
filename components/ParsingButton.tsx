"use client";
import React from "react";

function ParsingButton() {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      console.error("No file selected");
      return;
    }

    const formData = new FormData();
    formData.append("myFile", file);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Server error: ${response.statusText} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      console.log("Markdown:", data.markdown);
      console.log("Images", data.images);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={handleFileChange} />
    </div>
  );
}

export default ParsingButton;
