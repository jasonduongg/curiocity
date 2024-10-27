import dotenv from "dotenv";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { Resource, putObject, getObject, Document } from "../route";

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });
const resourceTable = process.env.RESOURCE_TABLE || "";
const documentTable = process.env.DOCUMENT_TABLE || "";

export async function POST(request: Request) {
  console.log("call POST: resource");
  const data = await request.json();

  console.log(data);

  if (
    !data.documentId ||
    !data.name ||
    !data.url ||
    !data.text ||
    !data.folderName
  ) {
    return Response.json({ err: "missing fields" });
  }

  const resourceId = uuidv4();

  const Item: Resource = {
    id: resourceId,
    documentId: data.documentId,
    url: data.url,
    name: data.name,
    text: data.text,
  };

  const inputResourceData = AWS.DynamoDB.Converter.marshall(Item);

  const document = await getObject(client, data.documentId, documentTable);

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
  newDocument.folders[data.folderName].resources.push(resourceId);

  console.log(newDocument.folders[data.folderName].resources);

  // Convert the updated document to DynamoDB format
  const inputDocumentData = AWS.DynamoDB.Converter.marshall(newDocument);

  // push resource
  const res = await putObject(client, inputResourceData, resourceTable);

  // update document
  await putObject(client, inputDocumentData, documentTable);

  console.log("Put new object: ", res);

  return Response.json(newDocument);
}
