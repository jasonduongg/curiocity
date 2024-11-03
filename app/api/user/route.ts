import dotenv from "dotenv";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import AWS from "aws-sdk";

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.USER_TABLE_NAME || "";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Define the User Type
export type User = {
  id: string;
  name: string;
  email: string;
  accountCreated: string;
  lastLoggedIn: string;
};

// PUT user object into DynamoDB
export const putUser = async (
  client: DynamoDBClient,
  inputData: User,
  table: string,
) => {
  const marshalledData = AWS.DynamoDB.Converter.marshall(inputData);

  try {
    const data = await client.send(
      new PutItemCommand({
        TableName: table,
        Item: marshalledData,
      }),
    );
    return data;
  } catch (error) {
    // Check table schema
    const marshalledData = AWS.DynamoDB.Converter.marshall(inputData);
    console.log("Marshalled data format:", marshalledData);
    console.log("Error putting user:", error);
    throw new Error("Could not put the user item");
  }
};

// GET user object from DynamoDB by ID
export const getUser = async (
  client: DynamoDBClient,
  id: string,
  table: string,
) => {
  try {
    const data = await client.send(
      new GetItemCommand({
        TableName: table,
        Key: {
          id: { S: id },
        },
      }),
    );
    return data.Item
      ? (AWS.DynamoDB.Converter.unmarshall(data.Item) as User)
      : null;
  } catch (error) {
    console.log("Error getting user:", error);
    throw new Error("Could not retrieve the user");
  }
};

// DELETE user object from DynamoDB by ID
export const deleteUser = async (
  client: DynamoDBClient,
  id: string,
  table: string,
) => {
  try {
    const data = await client.send(
      new DeleteItemCommand({
        TableName: table,
        Key: {
          id: { S: id },
        },
      }),
    );
    console.log("User successfully deleted");
    return data;
  } catch (error) {
    console.log("Error deleting user:", error);
    throw new Error("Could not delete the user");
  }
};

// API Endpoints

// GET endpoint to retrieve a user by ID
export async function GET(request: Request) {
  console.log("Retrieving user from DynamoDB");
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      console.error("User ID is required but not provided.");
      return new Response("User ID is required", { status: 400 });
    }

    const user = await getUser(client, id, tableName);
    if (!user) {
      console.warn("User not found for ID:", id);
      return new Response("User not found", { status: 404 });
    }

    console.log("User retrieved successfully:", user);
    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// POST endpoint to create a new user
export async function POST(request: Request) {
  console.log("Creating new user in DynamoDB");

  const data = await request.json();
  const userId = data.userData.userId;

  if (!userId) {
    console.error("User ID is required but not provided.");
    return new Response("User ID is required", { status: 400 });
  }

  try {
    // Check if the user already exists
    // const existingUser = await getUser(client, userId, tableName);

    const newUser: User = {
      id: userId,
      name: data.userData.name || "Anonymous",
      email: data.userData.email,
      accountCreated: new Date().toISOString(), // Use existing date or current date
      lastLoggedIn: data.userData.lastLoggedIn || new Date().toISOString(),
    };

    console.log("New user data before putting into DynamoDB:", newUser);

    await putUser(client, newUser, tableName);
    return new Response(JSON.stringify(newUser), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// PUT endpoint to update an existing user
export async function PUT(request: Request) {
  console.log("Updating user in DynamoDB");
  const data = await request.json();

  if (!data.id) {
    return new Response("User ID is required", { status: 400 });
  }

  const existingUser = await getUser(client, data.id, tableName);
  if (!existingUser) {
    return new Response("User not found", { status: 404 });
  }

  const updatedUser = {
    ...existingUser,
    ...data,
    lastLoggedIn: new Date().toISOString(), // Update last login timestamp
  };

  await putUser(client, updatedUser as User, tableName);
  return new Response(JSON.stringify(updatedUser), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

// DELETE endpoint to remove a user by ID
export async function DELETE(request: Request) {
  console.log("Deleting user from DynamoDB");
  const data = await request.json();

  if (!data.id) {
    return new Response("User ID is required", { status: 400 });
  }

  await deleteUser(client, data.id, tableName);
  return new Response(
    JSON.stringify({ message: "User successfully deleted" }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
