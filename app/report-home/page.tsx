"use client";

import { useEffect, useState } from "react";
import GridItem from "@/components/GridItem";
import TextInput from "@/components/TextInput";
import TableRow from "@/components/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import NavBar from "@/components/NavBar";
import TextEditor from "@/components/TextEditor";

type newDocument = {
  id?: string; // Add id to the newDocument type for consistency
  name: string;
  files: Array<string>;
  text: string;
};

export default function TestPage() {
  const [allDocuments, setAllDocuments] = useState<newDocument[]>([]); // Fixed initial state to an empty array
  const [swapState, setSwapState] = useState(false);

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

  return (
    <>
      <section className="overscroll-none bg-bgPrimary">
        <div className="flex h-screen w-full max-w-full flex-col items-start justify-start px-10">
          <NavBar></NavBar>
          <div className="mb-8 mt-4 flex h-full w-full max-w-full gap-4 overflow-hidden bg-bgPrimary">
            {/* Left Side of Screen */}
            <div className="max-w-1/2 flex h-full shrink grow basis-1/2 flex-col gap-4">
              <div className="flex w-full flex-row justify-between">
                <p className="mx-2 w-40 bg-gradient-to-r from-accentPrimary to-accentSecondary bg-clip-text text-2xl font-bold text-transparent">
                  Report Home
                </p>

                <div className="flex justify-end">
                  <button
                    onClick={() => setSwapState((prevState) => !prevState)}
                  >
                    <p className="text-white">Swap modes</p>
                  </button>
                </div>
              </div>

              <div className="flex h-full max-w-full grow flex-col overflow-hidden rounded-lg border-[2px] border-black bg-bgSecondary">
                <div className="flex h-full max-w-full grow flex-col overflow-hidden border-zinc-700">
                  {swapState ? (
                    <div className="h-full w-full max-w-full bg-black">
                      <TextEditor />
                    </div>
                  ) : (
                    <div className="h-full">
                      <div className="flex flex-col border-b-[1px] border-zinc-700 pb-6">
                        <div className="flex flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary px-8 py-2 text-sm">
                          <TextInput placeholder="Search for documents..."></TextInput>
                        </div>

                        <p className="mx-8 my-4 text-2xl font-semibold text-textPrimary">
                          {" "}
                          Create Report
                        </p>

                        <div
                          className="mx-8 mt-4 grid place-items-center rounded-xl border-[1px] border-textSecondary"
                          onClick={() => {}}
                        >
                          <p className="text-4xl text-textPrimary">+</p>
                        </div>
                      </div>

                      <p className="my-4 px-8 text-2xl font-medium text-textPrimary">
                        {" "}
                        Recent Reports
                      </p>
                      {/* not sure why h-full doesnt work here */}
                      <div className="flex h-[50vh] w-full flex-wrap gap-8 overflow-y-scroll p-8">
                        {allDocuments.map((item, index) => (
                          <GridItem
                            key={index}
                            title={item.name}
                            text={item.text}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink grow basis-1/2 flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary px-8">
              <div className="flex flex-col border-b-[1px] border-zinc-700 py-3">
                <TextInput placeholder="Find Resource..."></TextInput>
              </div>
              <div className="mb-2 flex gap-4 border-b-[1px] border-zinc-700 py-3">
                <div className="">
                  <p className="w-10 text-sm text-textPrimary">Icon</p>
                </div>
                <div className="grow">
                  <p className="text-sm text-textPrimary">Title</p>
                </div>
                <div className="w-24">
                  <p className="text-sm text-textPrimary">Date Added</p>
                </div>
                <div className="w-36">
                  <p className="text-sm text-textPrimary">Last Viewed</p>
                </div>
              </div>
              <TableRow
                icon={FileIcon}
                iconColor="textPrimary"
                title="This is a test folder"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="textPrimary"
                title="This is a test folder"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="textPrimary"
                title="This is a test folder"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <div className="mt-2 flex flex-col border-b-[1px] border-zinc-700"></div>
              <TableRow
                icon={FileIcon}
                iconColor="fileRed"
                title="This is a test file"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="fileRed"
                title="This is a test file"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="fileRed"
                title="This is a test file"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="fileRed"
                title="This is a test file"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="fileRed"
                title="This is a test file"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
              <TableRow
                icon={FileIcon}
                iconColor="fileRed"
                title="This is a test file"
                dateAdded="Feb 16, 24"
                lastViewed="2/16/24 3:01 PM"
              ></TableRow>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
