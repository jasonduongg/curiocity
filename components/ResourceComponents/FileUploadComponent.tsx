"use client";

import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Papa from "papaparse";
import TurndownService from "turndown";

interface FileUploadComponentProps {
  file: File;
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
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc =
          pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        setPdfjs(pdfjs);
      })();
    }
  }, []);

  useEffect(() => {
    const extractText = async () => {
      const fileExtension = file.name.split(".").pop()?.toLowerCase();
      let extractedText = "";

      console.log(`Extracting text from: ${file.name} (${fileExtension})`);

      if (fileExtension === "csv") {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const results = Papa.parse(text, { header: false });
          const data = results.data;

          if (Array.isArray(data) && data.length > 0) {
            const header = data[0];
            const separator = header.map(() => "---");
            extractedText += `| ${header.join(" | ")} |\n`;
            extractedText += `| ${separator.join(" | ")} |\n`;
            for (let i = 1; i < data.length; i++) {
              const row = data[i];
              extractedText += `| ${row.join(" | ")} |\n`;
            }
          } else {
            console.log("CSV file has no data.");
          }

          console.log("Extracted CSV Markdown:", extractedText);
          onTextExtracted(extractedText);
        };
        reader.readAsText(file);
      } else if (fileExtension === "html") {
        const reader = new FileReader();
        reader.onload = () => {
          const html = reader.result as string;
          const turndownService = new TurndownService();
          turndownService.addRule("image", {
            filter: "img",
            replacement: (content, node) =>
              `![Image](${node.getAttribute("src")})`,
          });
          extractedText = turndownService.turndown(html);
          console.log("Extracted HTML Markdown:", extractedText);
          onTextExtracted(extractedText);
        };
        reader.readAsText(file);
      } else if (fileExtension === "pdf") {
        if (!pdfjs) {
          console.error("PDF.js is not ready yet.");
          return;
        }

        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result as ArrayBuffer);
            const loadingTask = pdfjs.getDocument({ data: typedarray });
            const pdf = await loadingTask.promise;

            console.log(`Extracting text from PDF (${pdf.numPages} pages)...`);

            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const textContentObj = await page.getTextContent();
              extractedText += textContentObj.items
                .map((item: any) => ("str" in item ? item.str : ""))
                .join(" ");
            }

            console.log("Extracted PDF Text:", extractedText);
            onTextExtracted(extractedText);
          } catch (error) {
            console.error("Error parsing PDF:", error);
            onTextExtracted(""); // Pass empty string if there's an error
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        console.error("Unsupported file type:", fileExtension);
        onTextExtracted(""); // Pass empty string for unsupported file types
      }
    };

    extractText();
  }, [file, pdfjs, onTextExtracted]);

  return <div>Processing {file.name}...</div>;
};

export default FileUploadComponent;
