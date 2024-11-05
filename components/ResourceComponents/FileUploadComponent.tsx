"use client";

import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

interface FileUploadComponentProps {
  file: File | null;
  onTextExtracted: (text: string) => void;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  file,
  onTextExtracted,
}) => {
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

  useEffect(() => {
    if (file && pdfjs) {
      const fileName = file.name;
      const fileExtension = fileName.split(".").pop()?.toLowerCase();

      if (fileExtension === "csv" || fileExtension === "html") {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          onTextExtracted(text);
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
            onTextExtracted(textContent);
          } catch (error) {
            console.error("Error parsing PDF:", error);
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        console.error("Unsupported file type");
      }
    }
  }, [file, pdfjs, onTextExtracted]);

  return null; // This component no longer renders anything
};

export default FileUploadComponent;
