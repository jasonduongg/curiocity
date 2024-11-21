"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Import useSession to access user session
import NameYourReport from "@/components/DocumentComponents/newPrompt";
import FileViewer from "@/components/ResourceComponents/FilesViewer";
import NavBar from "@/components/GeneralComponents/NavBar";
import TextEditor from "@/components/DocumentComponents/TextEditor";
import AllDocumentsGrid from "@/components/DocumentComponents/AllDocumentsGrid";
import AWS from "aws-sdk";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { Document } from "@/types/types";

export default function TestPage() {
  const { data: session } = useSession();
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [isSortedByLastOpened, setIsSortedByLastOpened] = useState(true);
  const [swapState, setSwapState] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<Document | undefined>(
    undefined,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileViewerKey, setFileViewerKey] = useState(0);

  const fetchDocuments = () => {
    if (!session?.user?.id) return;

    const endpoint = isSortedByLastOpened
      ? `/api/db/getAllLastOpened?ownerID=${session.user.id}`
      : `/api/db/getAll?ownerID=${session.user.id}`;

    fetch(endpoint, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        setAllDocuments(data);
      })
      .catch((error) =>
        console.error("Error fetching user's documents:", error),
      );
  };

  useEffect(() => {
    fetchDocuments();
  }, [session, isSortedByLastOpened]);

  const fetchSingleDocument = async (document: Document | undefined) => {
    if (!document?.id) return;
    try {
      const response = await fetch(`/api/db?id=${document.id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch document");
      const dynamoResponse = await response.json();
      const unmarshalledData =
        AWS.DynamoDB.Converter.unmarshall(dynamoResponse);
      console.log("hhere2");
      setCurrentDocument(unmarshalledData);
    } catch (error) {
      console.error("Error fetching single document:", error);
    }
  };

  // Handle clicking a document in the grid
  const handleGridItemClick = async (document: Document) => {
    await fetchSingleDocument(document);
    setSwapState(true);
    // Update the lastOpened field
    try {
      await fetch("/api/db/updateLastOpened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: document.id }),
      });
    } catch (error) {
      console.error("Error updating lastOpened:", error);
    }
  };

  const toggleSortOrder = () => {
    setIsSortedByLastOpened((prevState) => !prevState);
  };

  const handleBack = () => {
    setSwapState(false);
    fetchDocuments();
    setCurrentDocument(undefined);
    setFileViewerKey((prevKey) => prevKey + 1);
  };

  const handleCreateNewReport = () => {
    setIsModalOpen(true); // Open the modal to enter a new report name
  };

  const createDocument = (name: string) => {
    if (!session?.user?.id) {
      console.error("User ID not found. Please log in.");
      return;
    }

    const newDoc = {
      name,
      text: "",
      ownerID: session.user.id, // Set the ownerID to the logged-in user’s ID
      dateAdded: new Date().toISOString(),
      lastOpened: new Date().toISOString(),
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

  return (
    <section className="h-screen overscroll-contain bg-bgPrimary">
      <div className="flex h-full w-full flex-col items-start justify-start overflow-hidden">
        <NavBar />
        <ResizablePanelGroup direction="horizontal" className="flex-grow px-8">
          <ResizablePanel>
            <div className="h-full w-full max-w-full gap-4 overflow-hidden bg-bgPrimary p-4">
              <div className="max-w-1/2 h-full shrink grow basis-1/2 flex-col gap-4 overflow-hidden rounded-xl border-[1px] border-zinc-700">
                <div className="h-full max-w-full grow flex-col overflow-hidden rounded-lg bg-bgSecondary">
                  {swapState ? (
                    <div className="h-full">
                      <TextEditor
                        mode="full"
                        currentDocument={currentDocument}
                        handleBack={() => {
                          handleBack();
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-full">
                      <AllDocumentsGrid
                        allDocuments={allDocuments}
                        onDocumentClick={handleGridItemClick}
                        refreshState={handleBack}
                        onCreateNewReport={handleCreateNewReport}
                        toggleSortOrder={toggleSortOrder} // Pass toggleSortOrder function
                        isSortedByLastOpened={isSortedByLastOpened} // Pass current sorting state
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle={true} className="my-4" />

          <ResizablePanel>
            <div className="h-full w-full p-4">
              <div className="flex h-full flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
                <FileViewer
                  key={fileViewerKey}
                  currentDocument={currentDocument}
                  setCurrentDocument={setCurrentDocument} // Pass the updater
                  refreshDocument={() => {
                    fetchSingleDocument(currentDocument);
                  }}
                />
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

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
