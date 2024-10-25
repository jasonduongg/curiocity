import { useState, useEffect } from "react";

function FileList() {
  const [files, setFiles] = useState([]);

  useEffect(() => {
    // Fetch the files from your API
    fetch("/api/your-endpoint")
      .then((response) => response.json())
      .then((data) => setFiles(data.files))
      .catch((error) => console.error("Error fetching files:", error));
  }, []);

  return (
    <div>
      <h1>Files</h1>
      {files.length > 0 ? (
        <ul>
          {files.map((file, index) => (
            <li key={index}>
              <a href={file} target="_blank" rel="noopener noreferrer">
                {file}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
}

export default FileList;
