"use client";

import React, { useEffect, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import Papa from "papaparse";
import TurndownService from "turndown";

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

      if (fileExtension === "csv") {
        const reader = new FileReader();
        reader.onload = () => {
          const text = reader.result as string;
          const results = Papa.parse(text, { header: false });
          const data = results.data;
          let markdown = "";
          if (Array.isArray(data) && data.length > 0) {
            const header = data[0];
            const separator = header.map(() => "---");
            markdown += `| ${header.join(" | ")} |\n`;
            markdown += `| ${separator.join(" | ")} |\n`;
            for (let i = 1; i < data.length; i++) {
              const row = data[i];
              markdown += `| ${row.join(" | ")} |\n`;
            }
          }
          console.log(markdown);
        };
        reader.readAsText(file);
      } else if (fileExtension === "html") {
        const reader = new FileReader();
        reader.onload = () => {
          const html = reader.result as string;
          const turndownService = new TurndownService();
          turndownService.addRule("image", {
            filter: "img",
            replacement: function (content, node) {
              const src = node.getAttribute("src");
              return `![Image](${src})`;
            },
          });
          const markdown = turndownService.turndown(html);
          console.log(markdown);
        };
        reader.readAsText(file);
      } else if (fileExtension === "pdf") {
        const reader = new FileReader();
        reader.onload = async () => {
          try {
            const typedarray = new Uint8Array(reader.result as ArrayBuffer);
            const loadingTask = pdfjs.getDocument({ data: typedarray });
            const pdf = await loadingTask.promise;
            let markdown = "";
            for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
              const page = await pdf.getPage(pageNum);
              const textContentObj = await page.getTextContent();
              const pageText = textContentObj.items
                .map((item: any) => ("str" in item ? item.str : ""))
                .join(" ");
              markdown += `# Page ${pageNum}\n\n${pageText}\n\n`;
            }
            console.log(markdown);
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
