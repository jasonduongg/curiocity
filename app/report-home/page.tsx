"use client";

import { useState } from "react";
import GridItem from "@/components/GridItem";
import TextInput from "@/components/TextInput";
import TableRow from "@/components/TableRow";
import { FileIcon } from "@radix-ui/react-icons";
import NavBar from "@/components/NavBar";
import TextEditor from "@/components/TextEditor";

export default function TestPage() {
  const [reports, setReports] = useState<string[]>([]);
  const [swapState] = useState(true);

  const addReport = () => {
    const newReport: string = `Report ${reports.length + 1}`;
    setReports([...reports, newReport]);
  };

  return (
    <>
      <section className="bg-bgPrimary">
        <div className="flex h-screen w-full flex-col items-start justify-start px-10">
          <NavBar></NavBar>
          <div className="mb-8 mt-4 flex h-full w-full gap-4 overflow-hidden bg-bgPrimary">
            <div className="flex shrink grow basis-1/2 flex-col gap-4">
              <p className="w-40 bg-gradient-to-r from-accentPrimary to-accentSecondary bg-clip-text text-2xl font-bold text-transparent">
                {" "}
                Report Home
              </p>
              <div className="flex flex-col rounded-xl border-[1px] border-zinc-700 bg-bgSecondary px-8 py-2 text-sm">
                <TextInput placeholder="Search for documents..."></TextInput>
              </div>
              <div className="flex h-full grow flex-col overflow-hidden rounded-xl border-[1px] border-zinc-700 bg-bgSecondary">
                <div className="flex flex-col border-b-[1px] border-zinc-700 py-6">
                  <p className="px-8 text-2xl font-semibold text-textPrimary">
                    {" "}
                    Create Report
                  </p>
                  <div className="mx-8 mt-4 grid place-items-center rounded-xl border-[1px] border-textSecondary">
                    <p
                      className="text-4xl text-textPrimary"
                      onClick={addReport}
                    >
                      +
                    </p>
                  </div>
                </div>
                <div className="flex grow flex-col overflow-hidden border-zinc-700 py-6">
                  {swapState ? (
                    <div>
                      <p className="mb-4 px-8 text-2xl font-medium text-textPrimary">
                        {" "}
                        Text Editor
                      </p>
                      <div className="bg-white">
                        <TextEditor></TextEditor>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-4 px-8 text-2xl font-medium text-textPrimary">
                        {" "}
                        Recent Reports
                      </p>
                      <div className="flex h-0 h-full w-full flex-wrap justify-around gap-8 overflow-y-scroll px-8">
                        {reports.map((item, index) => (
                          <GridItem key={index} title={item} />
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
