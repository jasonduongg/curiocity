"use client";

import { useEffect, useState } from "react";
import GridItem from "@/components/GridItem";
import TextInput from "@/components/TextInput";
import FileList from "@/components/FileList";
import NavBar from "@/components/NavBar";
import TextEditor from "@/components/TextEditor";

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

  // Fetch documents
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
    setCurrentDocument(undefined);
  };
  const handleGridItemClick = (document: newDocument) => {
    setCurrentDocument(document); // Set the current document
    setSwapState(true); // Swap the state
    console.log(document);
  };

  return (
    <>
      <section className="overscroll-none bg-bgPrimary">
        <div className="flex h-screen w-full max-w-full flex-col items-start justify-start px-10">
          <NavBar documentId={currentDocument?.id || ""} />
          <div className="mb-8 mt-4 flex h-full w-full max-w-full gap-4 overflow-hidden bg-bgPrimary">
            {/* Left Side of Screen */}
            <div className="max-w-1/2 flex h-full shrink grow basis-1/2 flex-col gap-4">
              <div className="flex w-full flex-row justify-between">
                <p className="mx-2 w-40 bg-gradient-to-r from-accentPrimary to-accentSecondary bg-clip-text text-2xl font-bold text-transparent">
                  Report Home
                </p>
                <div className="flex justify-end">
                  <button onClick={() => handleBack()}>
                    <p className="text-white">Swap modes</p>
                  </button>
                </div>
              </div>
              <div className="flex h-full max-w-full grow flex-col overflow-hidden rounded-lg border-[2px] border-black bg-bgSecondary">
                <div className="flex h-full max-w-full grow flex-col overflow-hidden border-zinc-700">
                  {swapState ? (
                    <div className="h-full w-full max-w-full bg-black">
                      <TextEditor
                        document={currentDocument}
                        swapState={() => {}}
                      />
                    </div>
                  ) : (
                    <div className="h-full">
                      <div className="flex flex-col border-b-[1px] border-zinc-700 pb-6">
                        <div className="flex flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary px-8 py-2 text-sm">
                          <TextInput placeholder="Search for documents..." />
                        </div>
                        <p className="mx-8 my-4 text-2xl font-semibold text-textPrimary">
                          Create Report
                        </p>
                        <div
                          className="mx-8 mt-4 grid place-items-center rounded-xl border-[1px] border-textSecondary"
                          onClick={() => {
                            /* Handle the creation of a new report here */
                          }}
                        >
                          <p className="text-4xl text-textPrimary">+</p>
                        </div>
                      </div>
                      <p className="my-4 px-8 text-2xl font-medium text-textPrimary">
                        Recent Reports
                      </p>
                      <div className="flex h-[50vh] w-full flex-wrap gap-8 overflow-y-scroll p-8">
                        {allDocuments.map((item, index) => (
                          <GridItem
                            key={index}
                            title={item.name}
                            text={item.text}
                            onClick={() => handleGridItemClick(item)} // Pass the click handler
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side of Screen */}
            <div className="flex shrink grow basis-1/2 flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
              {!swapState ? (
                <div className="flex flex-col border-b-[1px] border-zinc-700 py-3">
                  <p>SELECT</p>
                </div>
              ) : (
                <FileList currentDocument={currentDocument} />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
