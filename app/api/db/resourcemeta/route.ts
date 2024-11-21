import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import crypto from "crypto";
import {
  Resource,
  ResourceMeta,
  ResourceMetaCompressed,
  putObject,
  getObject,
  Document,
  deleteObject,
} from "../route";

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });
const documentTable = process.env.DOCUMENT_TABLE || "";
export const resourceMetaTable = process.env.RESOURCEMETA_TABLE || "";
export const resourceTable = process.env.RESOURCE_TABLE || "";

// Function to generate MD5 hash of a file
const generateFileHash = (fileBuffer: any) => {
  const hash = crypto.createHash("md5");
  hash.update(fileBuffer);
  return hash.digest("hex");
};

export async function POST(request: Request) {
  try {
    console.log("POST request received");

    const data = await request.json();
    console.log("Received data:", data);

    // Check for missing fields and log which ones are missing
    if (!data.documentId) console.error("Missing field: documentId");
    if (!data.name) console.error("Missing field: name");
    if (!data.folderName) console.error("Missing field: folderName");
    if (!data.file) console.error("Missing field: file");
    if (!data.url) console.error("Missing field: url");
    if (!data.dateAdded) console.error("Missing field: dateAdded");

    if (
      !data.documentId ||
      !data.name ||
      !data.folderName ||
      !data.file || // Ensure file data is provided
      !data.url ||
      !data.dateAdded
    ) {
      console.error("Missing essential fields in POST request");
      return new Response(JSON.stringify({ err: "Missing Essential Field" }), {
        status: 400,
      });
    }

    console.log("All required fields are present");

    // Generate MD5 hash from the file data
    const fileBuffer = Buffer.from(data.file, "base64"); // Assuming file is base64-encoded
    const fileHash = generateFileHash(fileBuffer);
    console.log("Generated file hash:", fileHash);

    const resourceMetaId = uuidv4();
    console.log("Generated resourceMetaId:", resourceMetaId);

    const resourceMetaItem: ResourceMeta = {
      id: resourceMetaId,
      hash: fileHash,
      name: data.name,
      lastOpened: data.lastOpened,
      dateAdded: data.dateAdded,
      notes: data.notes || "",
      summary: data.summary || "",
      tags: data.tags || [],
      documentId: data.documentId,
    };

    const resourceMetaCompressed: ResourceMetaCompressed = {
      id: resourceMetaId,
      name: data.name,
    };

    const resource: Resource = {
      id: fileHash,
      markdown: data.markdown, // Placeholder - replace as needed
      url: data.url,
    };

    console.log("ResourceMetaItem:", resourceMetaItem);
    console.log("ResourceMetaCompressed:", resourceMetaCompressed);
    console.log("Resource:", resource);

    const inputResourceMetaData =
      AWS.DynamoDB.Converter.marshall(resourceMetaItem);
    const inputResourceData = AWS.DynamoDB.Converter.marshall(resource);

    // Retrieve and update document
    const document = await getObject(client, data.documentId, documentTable);
    console.log("Fetched document:", document);

    if (!document.Item) {
      console.error(
        "Error: Document not found with documentId:",
        data.documentId,
      );
      return new Response(JSON.stringify({ err: "Document not found" }), {
        status: 404,
      });
    }

    const newDocument = AWS.DynamoDB.Converter.unmarshall(
      document.Item,
    ) as Document;

    console.log("Unmarshalled document:", newDocument);

    if (!newDocument.folders[data.folderName]) {
      newDocument.folders[data.folderName] = {
        name: data.folderName,
        resources: [],
      };
    }

    newDocument.folders[data.folderName].resources.push(resourceMetaCompressed);
    const inputDocumentData = AWS.DynamoDB.Converter.marshall(newDocument);

    console.log("Final document data to update:", inputDocumentData);

    // Put items in DynamoDB tables
    await putObject(client, inputResourceMetaData, resourceMetaTable);
    await putObject(client, inputDocumentData, documentTable);
    await putObject(client, inputResourceData, resourceTable); // Store resource in resourceTable

    console.log("Successfully updated DynamoDB");

    return new Response(JSON.stringify(newDocument), { status: 200 });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ err: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("resourceId");

    if (!id) {
      console.error("Error: Missing resourceId in GET request");
      return new Response(JSON.stringify({ err: "Missing resourceId" }), {
        status: 400,
      });
    }

    // Retrieve the resourceMeta from resourceMetaTable
    const resourceMeta = await getObject(client, id, resourceMetaTable);

    if (!resourceMeta.Item) {
      console.error("Error: ResourceMeta not found with resourceId:", id);
      return new Response(JSON.stringify({ err: "ResourceMeta not found" }), {
        status: 404,
      });
    }

    // Convert DynamoDB item to JSON format
    const resourceMetaData = AWS.DynamoDB.Converter.unmarshall(
      resourceMeta.Item,
    ) as ResourceMeta;
    console.log("Retrieved resourceMetaData:", resourceMetaData);

    return new Response(JSON.stringify(resourceMetaData), { status: 200 });
  } catch (error) {
    console.error("Error in GET request for resourceMeta:", error);
    return new Response(JSON.stringify({ err: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const data = await request.json();
    console.log("call delete resourceMeta: ", data.id);

    await deleteObject(client, data.id, resourceMetaTable);

    return Response.json({ msg: "success" });
  } catch (error) {
    console.error("Error in DELETE request for resourceMeta:", error);
    return new Response(JSON.stringify({ err: "Internal server error" }), {
      status: 500,
    });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { documentId, resourceId, sourceFolderName, targetFolderName, id, name, notes, summary, tags } = data;

    if (!documentId || !resourceId || !sourceFolderName || !targetFolderName) {
      return new Response(JSON.stringify({ err: "Missing Essential Field" }), {

    if (!id) {
      console.error("Error: Missing resourceMeta ID in PUT request");
      return new Response(JSON.stringify({ err: "Missing resourceMeta ID" }), {
        status: 400,
      });
    }

    // Retrieve the document
    const document = await getObject(client, documentId, documentTable);

    if (!document.Item) {
      return new Response(JSON.stringify({ err: "Document not found" }), 
                          
    // Retrieve the existing resourceMeta
    const resourceMeta = await getObject(client, id, resourceMetaTable);

    if (!resourceMeta.Item) {
      console.error("Error: ResourceMeta not found with ID:", id);
      return new Response(JSON.stringify({ err: "ResourceMeta not found" }), {
        status: 404,
      });
    }

    const newDocument = AWS.DynamoDB.Converter.unmarshall(
      document.Item,
    ) as Document;

    // Remove the resource from the source folder
    const sourceFolder = newDocument.folders[sourceFolderName];
    if (!sourceFolder) {
      return new Response(JSON.stringify({ err: "Source folder not found" }), {
        status: 404,
      });
    }

    const resourceIndex = sourceFolder.resources.findIndex(
      (resource) => resource.id === resourceId,
    );

    if (resourceIndex === -1) {
      return new Response(
        JSON.stringify({ err: "Resource not found in source folder" }),
        {
          status: 404,
        },
      );
    }

    const [movedResource] = sourceFolder.resources.splice(resourceIndex, 1);

    // Add the resource to the target folder
    if (!newDocument.folders[targetFolderName]) {
      newDocument.folders[targetFolderName] = {
        name: targetFolderName,
        resources: [],
      };
    }

    newDocument.folders[targetFolderName].resources.push(movedResource);

    // Update the document in the database
    const inputDocumentData = AWS.DynamoDB.Converter.marshall(newDocument);
    await putObject(client, inputDocumentData, documentTable);

    return new Response(
      JSON.stringify({ msg: "Resource moved successfully" }),
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error in PUT request:", error);

    const existingResourceMeta = AWS.DynamoDB.Converter.unmarshall(
      resourceMeta.Item,
    ) as ResourceMeta;
    console.log("Existing resourceMeta:", existingResourceMeta);

    // Update fields if provided
    const updatedResourceMeta = {
      ...existingResourceMeta,
      name: name || existingResourceMeta.name,
      notes: notes || existingResourceMeta.notes,
      summary: summary || existingResourceMeta.summary,
      tags: tags || existingResourceMeta.tags,
      updatedAt: new Date().toISOString(),
    };

    console.log("Updated resourceMeta:", updatedResourceMeta);

    // Save updated resourceMeta back to DynamoDB
    const input = AWS.DynamoDB.Converter.marshall(updatedResourceMeta);
    await putObject(client, input, resourceMetaTable);

    // Update document table to reflect the new name in folder structure
    const documentId = updatedResourceMeta.documentId;
    if (documentId) {
      console.log("Updating folder structure in document table...");

      // Retrieve the document
      const document = await getObject(client, documentId, documentTable);
      if (!document.Item) {
        console.error("Error: Document not found with documentId:", documentId);
        return new Response(JSON.stringify({ err: "Document not found" }), {
          status: 404,
        });
      }

      const existingDocument = AWS.DynamoDB.Converter.unmarshall(
        document.Item,
      ) as Document;

      console.log("Existing document:", existingDocument);

      // Locate the resource in the folder structure and update its name
      const updatedFolders = { ...existingDocument.folders };
      let resourceFound = false;

      for (const folderName in updatedFolders) {
        const folder = updatedFolders[folderName];
        const updatedResources = folder.resources.map((resource) => {
          if (resource.id === id) {
            resourceFound = true;
            return { ...resource, name: name || resource.name };
          }
          return resource;
        });
        updatedFolders[folderName] = { ...folder, resources: updatedResources };
      }

      if (resourceFound) {
        // Update the document
        const updatedDocument = {
          ...existingDocument,
          folders: updatedFolders,
          updatedAt: new Date().toISOString(),
        };

        const documentInput = AWS.DynamoDB.Converter.marshall(updatedDocument);
        await putObject(client, documentInput, documentTable);

        console.log("Document folder structure updated:", updatedDocument);
      } else {
        console.warn("ResourceMeta not found in any document folder.");
      }
    }

    return new Response(JSON.stringify(updatedResourceMeta), { status: 200 });
  } catch (error) {
    console.error("Error in PUT request for resourceMeta:", error);
    return new Response(JSON.stringify({ err: "Internal server error" }), {
      status: 500,
    });
  }
}
