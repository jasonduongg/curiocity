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
const tableName = process.env.TABLE_NAME || "";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

type document = {
  id: string;
  name: string;
  files: Array<string>;
  text: string;
};

// send json object to dynamodb
const putObject = async (client: any, inputData: any) => {
  const res = await client
    .send(
      new PutItemCommand({
        TableName: tableName,
        Item: inputData as any,
      }),
    )
    .then((data: any) => {
      return data;
    })
    .catch((error: any) => {
      console.log("error", error);
      throw new Error("Could not retrieve the item");
    });

  return res;
};

// get json object from dynamodb
const getObject = async (client: any, id: any) => {
  const res = await client
    .send(
      new GetItemCommand({
        TableName: tableName,
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

const deleteObject = async (client: any, id: any) => {
  // Define the parameters for the DeleteItemCommand
  const params = {
    TableName: tableName, // The name of the DynamoDB table
    Key: {
      id: { S: id }, // The key of the item (id in this case is a string, so we use {S: value})
    },
  };

  try {
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

  const item = await getObject(client, id);

  return Response.json(item.Item);
}

export async function PUT(request: Request) {
  console.log("call put dynamodb");
  const data = await request.json();

  console.log(data);

  // if had id (exiting object), pull from aws and update
  if (data.id) {
    const dynamoItem = await getObject(client, data.id);

    if (!dynamoItem?.Item) {
      throw new Error("Could not retrieve the item");
    }

    console.log("retrieved put item: ", dynamoItem.Item);

    const updatedObj = AWS.DynamoDB.Converter.unmarshall(dynamoItem.Item);
    for (const key in data) {
      updatedObj[key] = data[key];
    }

    console.log("updatedObj", updatedObj);

    // put the updated object to the db
    const res = await putObject(
      client,
      AWS.DynamoDB.Converter.marshall(updatedObj),
    );

    console.log("Updated object: ", res);
  } // else, create new obj
  else {
    const Item: document = {
      id: uuidv4(),
      name: data?.name || "test",
      files: [data?.url || ""],
      text: data?.text || "test",
    };

    const inputData = AWS.DynamoDB.Converter.marshall(Item);
    console.log("marshal data: ", inputData);

    const res = await putObject(client, inputData);

    console.log("Put new object: ", res);
  }

  return Response.json({});
}

export async function DELETE(request: Request) {
  console.log("call put dynamodb");
  const data = await request.json();

  await deleteObject(client, data.id);

  return Response.json({ msg: "success" });
}
