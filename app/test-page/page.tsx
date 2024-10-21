"use client";
import S3Button from "@/components/S3Button";
import { useEffect } from "react";

type newDocument = {
  name: string;
  files: Array<string>;
  text: string;
};

export default function TestPage() {
  const testEndpoint = (endpoint: string) => {
    if (endpoint === "update") {
      // Update
      console.log("update");
      fetch("/api/db", {
        method: "PUT",
        body: JSON.stringify({
          id: "ad42ecbf-120e-455c-bbe1-6c076d625418", // Specify ID of existing object
          name: "test new", // and fields to update
        }),
      });
    }
    if (endpoint === "get") {
      // get
      fetch("/api/db?id=ad42ecbf-120e-455c-bbe1-6c076d625418", {
        method: "GET",
      })
        .then((r) => r.json())
        .then((res) => console.log(res));
    }
    if (endpoint === "create") {
      // create
      fetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          name: "test object 5",
          text: "",
        } as newDocument),
      });
    }
    if (endpoint === "delete") {
      // delete
      fetch("/api/db", {
        method: "DELETE",
        body: JSON.stringify({
          id: "052ef1f7-8c11-4428-b7d7-5dc1b7c56a59",
        }),
      });
    }
  };

  useEffect(() => {
    testEndpoint("create");
  }, []);

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <p>This is a test page to demonstrate Next.js routing.</p>
      <S3Button />
    </div>
  );
}
