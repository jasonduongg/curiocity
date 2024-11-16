"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react"; // Import useSession to access user session
import NameYourReport from "@/components/DocumentComponents/newPrompt";
import FileList from "@/components/ResourceComponents/FileList";
import NavBar from "@/components/GeneralComponents/NavBar";
import TextEditor from "@/components/DocumentComponents/TextEditor";
import AllDocumentsGrid from "@/components/DocumentComponents/AllDocumentsGrid";
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
  ownerID?: string; // Add ownerID to the NewDocument type
  text?: string;
  folders: Record<string, FolderData>;
  tags: Array<string>;
};

export default function TestPage() {
  const { data: session } = useSession();
  const [allDocuments, setAllDocuments] = useState<NewDocument[]>([]);
  console.log(allDocuments);
  const [isSortedByLastOpened, setIsSortedByLastOpened] = useState(true); // Track sorting state
  const [swapState, setSwapState] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<
    NewDocument | undefined
  >(undefined);
  const [fileListKey, setFileListKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const toggleSortOrder = () => {
    setIsSortedByLastOpened((prevState) => !prevState);
  };

  const handleBack = () => {
    setSwapState(false);
    fetchDocuments();
    setCurrentDocument(undefined);
    setFileListKey((prevKey) => prevKey + 1); // Increment key to reset FileList
  };

  const handleGridItemClick = async (document: NewDocument) => {
    try {
      // Fetch the document via your API
      const response = await fetch(`/api/db?id=${document.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Failed to fetch document:", response.statusText);
        return;
      }

      // Parse the response and unmarshall DynamoDB data
      const dynamoResponse = await response.json();
      const unmarshalledData =
        AWS.DynamoDB.Converter.unmarshall(dynamoResponse);

      console.log("Fetched and unmarshalled document:", unmarshalledData);

      // Update the state with the fetched document
      setCurrentDocument(unmarshalledData);
      setSwapState(true);

      // Update the lastOpened field via your API
      const lastOpenedResponse = await fetch("/api/db/updateLastOpened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: document.id }),
      });

      if (!lastOpenedResponse.ok) {
        console.error(
          "Failed to update lastOpened:",
          lastOpenedResponse.statusText,
        );
        return;
      }

      const lastOpenedData = await lastOpenedResponse.json();
      console.log("Updated lastOpened:", lastOpenedData);
    } catch (error) {
      console.error("Error handling grid item click:", error);
    }
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

        const unmarshalledData = AWS.DynamoDB.Converter.unmarshall(data);
        console.log("Unmarshalled data:", unmarshalledData);
        setCurrentDocument(unmarshalledData);
      })
      .catch((error) => console.error("Error fetching document:", error));
  };

  return (
    <section className="h-screen overscroll-contain bg-bgPrimary">
      <div className="flex h-full w-full flex-col items-start justify-start overflow-hidden">
        <NavBar />
        <ResizablePanelGroup direction="horizontal" className="flex-grow px-8">
          <ResizablePanel>
            <div className="flex h-full w-full flex-col gap-4 overflow-hidden bg-bgPrimary p-4">
              <div className="flex flex-grow flex-col gap-4 overflow-hidden rounded-xl border-[1px] border-zinc-700">
                <div className="flex flex-grow flex-col overflow-hidden rounded-lg bg-bgSecondary">
                  {swapState ? (
                    <TextEditor
                      currentDocument={currentDocument}
                      swapState={handleBack}
                    />
                  ) : (
                    <AllDocumentsGrid
                      allDocuments={allDocuments}
                      onDocumentClick={handleGridItemClick}
                      refreshState={handleBack}
                      onCreateNewReport={handleCreateNewReport}
                      toggleSortOrder={toggleSortOrder}
                      isSortedByLastOpened={isSortedByLastOpened}
                    />
                  )}
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle={true} className="my-4" />

          <ResizablePanel>
            <div className="h-full w-full p-4">
              <div className="flex h-full flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
                <FileList
                  key={fileListKey}
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
            createDocument(name);
            setIsModalOpen(false);
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      )}
    </section>
  );
}
