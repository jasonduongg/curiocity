import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import {
  Resource,
  ResourceCompressed,
  putObject,
  getObject,
  Document,
} from "../route";

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });
const resourceTable = process.env.RESOURCE_TABLE || "";
const documentTable = process.env.DOCUMENT_TABLE || "";

export async function POST(request: Request) {
  try {
    console.log("call POST: resource");
    const data = await request.json();

    console.log(data);

    if (
      !data.documentId ||
      !data.name ||
      !data.url ||
      !data.folderName ||
      !data.dateAdded
    ) {
      console.error("Error: Missing fields", {
        documentId: !!data.documentId,
        name: !!data.name,
        url: !!data.url,
        folderName: !!data.folderName,
        dateAdded: !!data.dateAdded,
      });
      return new Response(JSON.stringify({ err: "missing fields" }), {
        status: 400,
      });
    }

    const resourceId = uuidv4();

    const resourceItem: Resource = {
      id: resourceId,
      documentId: data.documentId,
      url: data.url,
      name: data.name,
      text: data.text,
      dateAdded: data.dateAdded,
    };

    const compressedResourceItem: ResourceCompressed = {
      id: resourceId,
      name: data.name,
    };

    const inputResourceData = AWS.DynamoDB.Converter.marshall(resourceItem);

    const document = await getObject(client, data.documentId, documentTable);

    if (!document.Item) {
      console.error(
        "Error: Document not found with documentId:",
        data.documentId,
      );
      return new Response(JSON.stringify({ err: "document not found" }), {
        status: 404,
      });
    }

    const newDocument = AWS.DynamoDB.Converter.unmarshall(
      document.Item,
    ) as Document;

    // Check if the folder exists in the document; if not, initialize it
    if (!newDocument.folders[data.folderName]) {
      newDocument.folders[data.folderName] = {
        name: data.folderName,
        resources: [],
      };
    }

    // Append the resource to the specified folder's resources
    newDocument.folders[data.folderName].resources.push(compressedResourceItem);

    console.log("Updated folders:", newDocument.folders);

    // Convert the updated document to DynamoDB format
    const inputDocumentData = AWS.DynamoDB.Converter.marshall(newDocument);

    // Push resource to the resource table
    const res = await putObject(client, inputResourceData, resourceTable);

    // Update document in the document table
    await putObject(client, inputDocumentData, documentTable);

    console.log("Put new object:", res);

    return new Response(JSON.stringify(newDocument), { status: 200 });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(JSON.stringify({ err: "internal server error" }), {
      status: 500,
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("resourceId");

    if (!resourceId) {
      console.error("Error: Missing resourceId in GET request");
      return new Response(JSON.stringify({ err: "missing resourceId" }), {
        status: 400,
      });
    }

    // Retrieve the resource from DynamoDB
    const resource = await getObject(client, resourceId, resourceTable);

    if (!resource.Item) {
      console.error("Error: Resource not found with resourceId:", resourceId);
      return new Response(JSON.stringify({ err: "resource not found" }), {
        status: 404,
      });
    }

    // Convert DynamoDB item to JSON format
    const resourceData = AWS.DynamoDB.Converter.unmarshall(
      resource.Item,
    ) as Resource;

    console.log("Retrieved resource:", resourceData);

    return new Response(JSON.stringify(resourceData), { status: 200 });
  } catch (error) {
    console.error("Error in GET request:", error);
    return new Response(JSON.stringify({ err: "internal server error" }), {
      status: 500,
    });
  }
}
