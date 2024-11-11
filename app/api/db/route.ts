import dotenv from "dotenv";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.DOCUMENT_TABLE || "";
export const maxDuration = 60;
export const dynamic = "force-dynamic";
const resourceTable = process.env.RESOURCE_TABLE || "";

export type Resource = {
  id: string;
  markdown: string;
  url: string;
};

export type ResourceMetaCompressed = {
  id: string;
  name: string;
};

export type ResourceMeta = {
  id: string;
  hash: string;
  name: string;
  dateAdded: string;
  lastOpened: string;
  notes: string;
  summary: string;
  tags: Array<string>;
};

export type Document = {
  id: string;
  ownerID: string;
  name: string;
  folders: Record<string, Folder>;
  text: string;
  dateAdded: string;
  lastOpened: string;
};

export type Folder = {
  name: string;
  resources: Array<ResourceMetaCompressed>;
};

// send json object to dynamodb
export const putObject = async (client: any, inputData: any, table: string) => {
  const res = await client
    .send(
      new PutItemCommand({
        TableName: table,
        Item: inputData as any,
      }),
    )
    .then((data: any) => {
      return data;
    })
    .catch((error: any) => {
      console.log("error", error);
      throw new Error("Could not put the item");
    });

  return res;
};

// get json object from dynamodb
export const getObject = async (client: any, id: any, table: string) => {
  const res = await client
    .send(
      new GetItemCommand({
        TableName: table,
        Key: {
          id: { S: id },
        },
      }),
    )
    .then((data: any) => data)
    .catch((error: any) => {
      console.log(error);
      throw new Error("Could not retrieve the item");
    });

  return res;
};

export const deleteObject = async (client: any, id: any, table: string) => {
  // Define the parameters for the DeleteItemCommand
  const params = {
    TableName: table, // The name of the DynamoDB table
    Key: {
      id: { S: id }, // The key of the item (id in this case is a string, so we use {S: value})
    },
  };

  try {
    // if is document obj, delete all resources as well
    if (table === tableName) {
      const obj = await getObject(client, id, table);
      for (const folder in obj.folders) {
        for (const resource in obj.folders[folder].resources) {
          await deleteObject(client, resource, resourceTable);
        }
      }
    }

    // Send the DeleteItemCommand to DynamoDB
    const command = new DeleteItemCommand(params);
    const data = await client.send(command);

    console.log("Item successfully deleted");
    return data; // Return the delete operation's response data
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error("Could not delete the item");
  }
};

export async function GET(request: Request) {
  console.log("call get dynamodb");
  const url = new URL(request.url);
  const id = url.searchParams.get("id"); // Retrieves the 'id' query parameter

  const item = await getObject(client, id, tableName);
  return Response.json(item.Item);
}

export async function PUT(request: Request) {
  console.log("call put dynamodb");
  const data = await request.json();

  console.log(data);

  // if had id (exiting object), pull from aws and update
  if (data.id) {
    const dynamoItem = await getObject(client, data.id, tableName);

    if (!dynamoItem?.Item) {
      console.log("here");
      throw new Error("Could not retrieve the item");
    }

    console.log("retrieved put item: ", dynamoItem.Item);

    const updatedObj = AWS.DynamoDB.Converter.unmarshall(dynamoItem.Item);
    for (const key in data) {
      if (key !== "resources") {
        // don't overwrite resources
        updatedObj[key] = data[key];
      }
    }

    console.log("updatedObj", updatedObj);

    // put the updated object to the db
    const res = await putObject(
      client,
      AWS.DynamoDB.Converter.marshall(updatedObj),
      tableName,
    );

    console.log("Updated object: ", res);
  }

  return Response.json({});
}

export async function POST(request: Request) {
  console.log("call create dynamodb");
  const data = await request.json();

  console.log(data);

  const defaultFolder = { name: "General", resources: [] };

  const Item: Document = {
    id: uuidv4(),
    name: data.name,
    folders: { General: defaultFolder },
    text: data?.text || "",
    dateAdded: data.dateAdded,
    ownerID: data?.ownerID || "jason",
    lastOpened: data?.lastOpened || "now",
  };

  console.log(Item);

  const inputData = AWS.DynamoDB.Converter.marshall(Item);
  console.log("marshal data: ", inputData);

  await putObject(client, inputData, tableName);

  console.log("Put new object ");

  return Response.json(Item);
}

export async function DELETE(request: Request) {
  const data = await request.json();
  console.log("call delete dynamodb: ", data.id);

  await deleteObject(client, data.id, tableName);

  return Response.json({ msg: "success" });
}
