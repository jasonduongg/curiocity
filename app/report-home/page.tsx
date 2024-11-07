"use client";
import { useEffect, useState } from "react";
import FileList from "@/components/ResourceComponents/FileList";
import NavBar from "@/components/GeneralComponents/NavBar";
import TextEditor from "@/components/DocumentComponents/TextEditor";
import AllDocumentsGrid from "@/components/DocumentComponents/AllDocumentsGrid";
import NameYourReport from "@/components/DocumentComponents/newPrompt"; // Import the NameYourReport component
import AWS from "aws-sdk";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

type FolderData = {
  name: string;
  resources: string[];
};

type NewDocument = {
  id?: string;
  name: string;
  text?: string;
  folders: Record<string, FolderData>;
};

export default function TestPage() {
  const [allDocuments, setAllDocuments] = useState<NewDocument[]>([]);
  const [swapState, setSwapState] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<
    NewDocument | undefined
  >(undefined);
  const [fileListKey, setFileListKey] = useState(0); // Key for FileList to reset its state
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

  const fetchDocuments = () => {
    fetch("/api/db/getAll", { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        console.log("All documents response:", data);
        setAllDocuments(data);
      })
      .catch((error) => console.error("Error fetching all documents:", error));
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleBack = () => {
    setSwapState(false);
    fetchDocuments();
    setCurrentDocument(undefined);
    setFileListKey((prevKey) => prevKey + 1); // Increment key to reset FileList
  };

  const handleGridItemClick = (document: NewDocument) => {
    setCurrentDocument(document);
    setSwapState(true);
  };

  const handleCreateNewReport = () => {
    setIsModalOpen(true); // Open the modal to enter a new report name
  };

  const createDocument = (name: string) => {
    const newDoc = {
      name,
      text: "",
      folders: {},
    };

    // API call to create a new document in the database
    fetch("/api/db", {
      method: "POST",
      body: JSON.stringify(newDoc),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        const createdDoc = { ...newDoc, id: data.id };
        setCurrentDocument(createdDoc);
        setSwapState(true); // Open the document in TextEditor
        fetchDocuments(); // Refresh document list
      })
      .catch((error) => console.error("Error creating document:", error));
  };

  const onResourceUpload = (documentId: string) => {
    console.log(`Uploaded new resource for document ID: ${documentId}`);

    fetch(`/api/db?id=${documentId}`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        console.log("Raw DynamoDB response:", data);

        // Unmarshall the data to convert DynamoDB types into normal JS objects
        const unmarshalledData = AWS.DynamoDB.Converter.unmarshall(data);
        console.log("Unmarshalled data:", unmarshalledData);
        setCurrentDocument(unmarshalledData);
      })
      .catch((error) => console.error("Error fetching document:", error));
  };

  return (
    <section className="overscroll-none bg-bgPrimary">
      <div className="flex h-screen w-full max-w-full flex-col items-start justify-start">
        <NavBar />
        <ResizablePanelGroup direction="horizontal" className="px-8">
          <ResizablePanel>
            <div className="h-full w-full max-w-full gap-4 overflow-hidden bg-bgPrimary p-4">
              <div className="max-w-1/2 h-full shrink grow basis-1/2 flex-col gap-4 overflow-hidden rounded-xl border-[1px] border-zinc-700">
                <div className="h-full max-w-full grow flex-col overflow-hidden rounded-lg bg-bgSecondary">
                  <div className="h-full max-w-full grow flex-col overflow-hidden border-zinc-700">
                    {swapState ? (
                      <div className="h-full">
                        <TextEditor
                          currentDocument={currentDocument}
                          swapState={handleBack}
                        />
                      </div>
                    ) : (
                      <div className="h-full">
                        <AllDocumentsGrid
                          allDocuments={allDocuments}
                          onDocumentClick={handleGridItemClick}
                          onCreateNewReport={handleCreateNewReport}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle={true} className="my-4" />

          <ResizablePanel>
            <div className="h-full w-full p-4">
              <div className="flex h-full shrink grow basis-1/2 flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
                <FileList
                  key={fileListKey} // Add key here to reset FileList on change
                  currentDocument={currentDocument}
                  onResourceUpload={() =>
                    onResourceUpload(currentDocument?.id || "")
                  }
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Render the NameYourReport component as a modal */}
      {isModalOpen && (
        <NameYourReport
          onSave={(name) => {
            createDocument(name); // Create a new document with the provided name
            setIsModalOpen(false); // Close the modal
          }}
          onCancel={() => setIsModalOpen(false)} // Close the modal without saving
        />
      )}
    </section>
  );
}
