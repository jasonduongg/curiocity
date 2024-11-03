"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import FileList from "@/components/FileList";
import NavBar from "@/components/NavBar";
import TextEditor from "@/components/TextEditor";
import AllDocumentsGrid from "@/components/AllDocumentsGrid";
import AuthButton from "@/components/AuthButton";
import AWS from "aws-sdk";

type newDocument = {
  id?: string;
  name: string;
  files: Array<string>;
  text: string;
  folders?: Record<
    string,
    {
      name: string;
      resources: string[];
    }
  >;
};

export default function TestPage() {
  const [allDocuments, setAllDocuments] = useState<newDocument[]>([]);
  const [swapState, setSwapState] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<
    newDocument | undefined
  >(undefined);

  const { data: session } = useSession();

  const fetchDocuments = () => {
    fetch("/api/db/getAll", {
      method: "GET",
    })
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
  };

  const handleGridItemClick = (document: newDocument) => {
    setCurrentDocument(document);
    setSwapState(true);
  };

  const handleCreateNewReport = () => {
    // Define the logic for creating a new report here
    console.log("Creating a new report...");
  };

  const onResourceUpload = (documentId: string) => {
    console.log(`Uploaded new resource for document ID: ${documentId}`);

    fetch(`/api/db?id=${documentId}`, {
      method: "GET",
    })
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
      <div className="flex h-screen w-full max-w-full flex-col items-start justify-start px-10">
        <NavBar />
        <div className="mb-8 mt-4 flex h-full w-full max-w-full gap-4 overflow-hidden bg-bgPrimary">
          <div className="max-w-1/2 flex h-full shrink grow basis-1/2 flex-col gap-4">
            <div className="flex w-full flex-row justify-between">
              <p className="mx-2 w-40 bg-gradient-to-r from-accentPrimary to-accentSecondary bg-clip-text text-2xl font-bold text-transparent">
                Report Home
              </p>
              <div className="flex justify-end">
                <button onClick={handleBack}>
                  <p className="text-white">Swap modes</p>
                </button>
              </div>
            </div>
            <div className="flex h-full max-w-full grow flex-col overflow-hidden rounded-lg bg-bgSecondary">
              <div className="flex h-full max-w-full grow flex-col overflow-hidden border-zinc-700">
                {swapState ? (
                  <TextEditor
                    currentDocument={currentDocument}
                    swapState={() => {}}
                  />
                ) : (
                  <AllDocumentsGrid
                    allDocuments={allDocuments}
                    onDocumentClick={handleGridItemClick}
                    onCreateNewReport={handleCreateNewReport}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink grow basis-1/2 flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
            {!swapState ? (
              <div className="flex flex-col border-b-[1px] border-zinc-700 py-3 text-textPrimary">
                <p>SELECT</p>
                <div className="flex flex-col">
                  <p>{`UserID: ${session?.user.id}`}</p>
                  <p>{`(Example user data): Last Logged In: ${session?.user.lastLoggedIn}`}</p>
                  <AuthButton></AuthButton>
                </div>
              </div>
            ) : (
              <FileList
                currentDocument={currentDocument}
                onResourceUpload={() =>
                  onResourceUpload(currentDocument?.id || "")
                }
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
