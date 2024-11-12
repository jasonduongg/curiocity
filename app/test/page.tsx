"use client";
import { useState } from "react";
import TextEditor from "@/components/DocumentComponents/TextEditor";

export default function TestResourceMetaAPI() {
  const [name, setName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [dateAdded, setDateAdded] = useState("");
  const [documentIdPost, setDocumentIdPost] = useState("");
  const [postResponse, setPostResponse] = useState(null);
  const [file, setFile] = useState(null);

  const [documentIdGet, setDocumentIdGet] = useState("");
  const [singleDocument, setSingleDocument] = useState(null);
  const [allDocuments, setAllDocuments] = useState(null);
  const [error, setError] = useState(null);

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  // Handle POST request
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    // Prepare form data to send to the backend
    const formData = new FormData();
    formData.append("documentId", documentIdPost);
    formData.append("name", name);
    formData.append("folderName", folderName);
    formData.append("dateAdded", dateAdded);
    formData.append("file", file); // Attach the file itself

    try {
      const res = await fetch("/api/db/resourcemeta", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      setPostResponse(result);

      if (!res.ok) {
        console.error("Error:", result.err);
      } else {
        console.log("POST request successful:", result);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setPostResponse({ error: "Failed to send POST request" });
    }
  };

  // Handle GET request for fetching one document
  const handleGetDocument = async () => {
    try {
      const res = await fetch(`/api/db?id=${documentIdGet}`, {
        method: "GET",
      });

      const result = await res.json();

      if (!res.ok) {
        console.error("Error:", result.error);
        setError(result.error || "Failed to fetch document.");
        setSingleDocument(null);
      } else {
        console.log("GET request successful:", result);
        setSingleDocument(result);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setError("Failed to fetch document");
      setSingleDocument(null);
    }
  };

  // Handle GET all documents request
  const handleGetAllDocuments = async () => {
    try {
      const res = await fetch("/api/db/getAll");

      const result = await res.json();

      if (!res.ok) {
        console.error("Error fetching all documents:", result.err);
        setError("Failed to fetch all documents.");
      } else {
        console.log("GET all documents request successful:", result);
        setAllDocuments(result);
        setError(null);
      }
    } catch (error) {
      console.error("Error fetching all documents:", error);
      setError("Failed to fetch all documents");
    }
  };

  return (
    <div>
      <h1>Test ResourceMeta API</h1>

      {/* POST Form */}
      <div>
        <h2>Test POST to /api/db/resourcemeta</h2>
        <form onSubmit={handlePostSubmit}>
          <label>
            Document ID:
            <input
              type="text"
              value={documentIdPost}
              onChange={(e) => setDocumentIdPost(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Name:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            File:
            <input type="file" onChange={handleFileChange} required />
          </label>
          <br />
          <label>
            Folder Name:
            <input
              type="text"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              required
            />
          </label>
          <br />
          <label>
            Date Added:
            <input
              type="date"
              value={dateAdded}
              onChange={(e) => setDateAdded(e.target.value)}
              required
            />
          </label>
          <br />
          <button type="submit">Submit</button>
        </form>

        {postResponse && (
          <div>
            <h3>POST Response</h3>
            <pre>{JSON.stringify(postResponse, null, 2)}</pre>
          </div>
        )}
      </div>

      <hr />

      {/* Form to Get One Document */}
      <div>
        <h2>Fetch Single Document by ID</h2>
        <label>
          Document ID:
          <input
            type="text"
            value={documentIdGet}
            onChange={(e) => setDocumentIdGet(e.target.value)}
            required
          />
        </label>
        <button onClick={handleGetDocument}>Fetch Document</button>

        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {singleDocument && (
          <div>
            <h3>Fetched Document</h3>
            <pre>{JSON.stringify(singleDocument, null, 2)}</pre>
          </div>
        )}
      </div>

      <hr />

      {/* Button to Get All Documents */}
      <div>
        <h2>Get All Documents</h2>
        <button onClick={handleGetAllDocuments}>Fetch All Documents</button>

        {error && <p style={{ color: "red" }}>Error: {error}</p>}

        {allDocuments && (
          <div>
            <h3>All Documents</h3>
            <pre>{JSON.stringify(allDocuments, null, 2)}</pre>
          </div>
        )}
      </div>

      <TextEditor />
    </div>
  );
}
