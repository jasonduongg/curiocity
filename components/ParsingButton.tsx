"use client";

import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

const FileUploadComponent: React.FC = () => {
  const [pdfjs, setPdfjs] = useState<typeof pdfjsLib | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (async () => {
        try {
          const pdfjs = await import("pdfjs-dist");
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
          setPdfjs(pdfjs);
        } catch (error) {
          console.error("Failed to load pdfjs-dist:", error);
        }
      })();
    }
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files && files.length > 0 && pdfjs) {
      const file = files[0];
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv" || fileExtension === "html") {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          console.log(`Extracted text from ${fileName}:\n`, text);
        };
        reader.readAsText(file);
      } else if (fileExtension === "pdf") {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result as ArrayBuffer);
            const loadingTask = pdfjs.getDocument({ data: typedarray });
            const pdf = await loadingTask.promise;
            let textContent = "";
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const textContentObj = await page.getTextContent();
              const pageText = textContentObj.items
                .map((item: any) => ("str" in item ? item.str : ""))
                .join(" ");
              textContent += pageText + "\n";
            }
            console.log(`Extracted text from ${fileName}:\n`, textContent);
          } catch (error) {
            console.error("Error parsing PDF:", error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        console.error("Unsupported file type");
      }
    } else {
      console.error("PDF.js library not loaded yet or no file selected");
    }
  };

  return (
    <div>
      <input type="file" accept=".csv,.pdf,.html" onChange={handleFileChange} />
    </div>
  );
};

export default FileUploadComponent;
