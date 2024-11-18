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
};

export default function TestPage() {
  const { data: session } = useSession();
  const [allDocuments, setAllDocuments] = useState<NewDocument[]>([]);
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

  const handleGridItemClick = (document: NewDocument) => {
    setCurrentDocument(document);
    setSwapState(true);

    //updated nov 5st by richa
    fetch("/api/db/updateLastOpened", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: document.id }),
    })
      .then((r) => r.json())
      .then((data) => {
        console.log("Updated lastOpened:", data);
      })
      .catch((error) => console.error("Error updating lastOpened:", error));
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
                          mode="full"
                          currentDocument={currentDocument}
                          swapState={handleBack}
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
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle={true} className="my-4" />

          <ResizablePanel>
            <div className="h-full w-full p-4">
              <div className="flex h-full shrink grow basis-1/2 flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
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
            createDocument(name); // Create a new document with the provided name
            setIsModalOpen(false); // Close the modal
          }}
          onCancel={() => setIsModalOpen(false)} // Close the modal without saving
        />
      )}
    </section>
  );
}
