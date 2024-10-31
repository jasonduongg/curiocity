"use client";
import { useState } from "react";
import AWS from "aws-sdk";
import TextEditor from "@/components/TextEditor";
import AuthButton from "@/components/AuthButton";

type newDocument = {
  id?: string; // Add id to the newDocument type for consistency
  name: string;
  files: Array<string>;
  text: string;
};

export default function TestPage() {
  const [document, setDocument] = useState<newDocument | null>(null);
  const [allDocuments, setAllDocuments] = useState<newDocument[]>([]); // Fixed initial state to an empty array
  const [term, setTerm] = useState("");

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
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    if (endpoint === "get") {
      // Get a single document
      fetch(`/api/db?id=${term}`, {
        method: "GET",
      })
        .then((r) => r.json())
        .then((data) => {
          console.log("Raw DynamoDB response:", data);

          // Unmarshall the data to convert DynamoDB types into normal JS objects
          const unmarshalledData = AWS.DynamoDB.Converter.unmarshall(data);
          console.log("Unmarshalled data:", unmarshalledData);

          // Set the unmarshalled document in the state
          setDocument(unmarshalledData);
        })
        .catch((error) => console.error("Error fetching document:", error));
    }
    if (endpoint === "getAll") {
      // Fetch all documents
      fetch("/api/db/getAll", {
        method: "GET",
      })
        .then((r) => r.json())
        .then((data) => {
          console.log("All documents response:", data);
          setAllDocuments(data);
        })
        .catch((error) =>
          console.error("Error fetching all documents:", error),
        );
    }
    if (endpoint === "create") {
      // Create a new document
      fetch("/api/db", {
        method: "POST",
        body: JSON.stringify({
          name: "test object 5",
          text: "",
          files: [],
        } as newDocument),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
    if (endpoint === "delete") {
      // Delete a document
      fetch("/api/db", {
        method: "DELETE",
        body: JSON.stringify({
          id: "052ef1f7-8c11-4428-b7d7-5dc1b7c56a59", // Replace with actual ID
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };

  const deleteDocument = (id: string) => {
    fetch("/api/db", {
      method: "DELETE",
      body: JSON.stringify({ id }),
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Document deleted", data);
        setAllDocuments((prevDocs) => prevDocs.filter((doc) => doc.id !== id)); // Update state
      })
      .catch((error) => console.error("Error deleting document:", error));
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center">
      {/* Rendering the document if fetched */}
      {document ? (
        <div>
          <h3>Document Name: {document.name}</h3>
          <h3>Document Id: {document.id}</h3>
          <p>Document Text: {document.text}</p>
          <p>Document Files:</p>
          <ul>
            {document.files?.map((file, index) => <li key={index}>{file}</li>)}
          </ul>
        </div>
      ) : (
        <p>Loading single document...</p>
      )}
      {/* Rendering all documents */}
      {allDocuments.length > 0 ? (
        <ul>
          {allDocuments.map((doc, index) => (
            <li key={index}>
              {doc.id} {doc.name} {doc.text}
              <button
                onClick={() => deleteDocument(doc.id || "")} // Handle delete click
                className="ml-2 text-red-500"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Loading all documents...</p>
      )}
      <input
        type="text"
        value={term}
        onChange={(e) => setTerm(e.target.value)} // Update title state on input change
        placeholder="Enter document title"
        className="mb-4 h-[5vh] w-1/3 bg-gray-200 p-2"
      />
      <button onClick={() => testEndpoint("get")}>Get 1</button>
      <button onClick={() => testEndpoint("getAll")}>Get All</button>

      <div className="h-[40vh]">
        <TextEditor></TextEditor>
      </div>

      <AuthButton></AuthButton>
    </div>
  );
}
