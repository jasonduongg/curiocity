import dotenv from "dotenv";
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"; // Import from util-dynamodb

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.USER_TABLE_NAME || "";

// Define the User Type
export type User = {
  id: string;
  name: string;
  email: string;
  image: string;
  accountCreated: string;
  lastLoggedIn: string;
};

// PUT user object into DynamoDB
export const putUser = async (inputData: User) => {
  const marshalledData = marshall(inputData);

  try {
    await client.send(
      new PutItemCommand({
        TableName: tableName,
        Item: marshalledData,
      }),
    );
    return inputData;
  } catch (error) {
    console.error("Error putting user:", error);
    throw new Error("Could not put the user item");
  }
};

// GET user object from DynamoDB by email
export const getUser = async (email: string) => {
  if (typeof email !== "string") {
    console.error("Invalid data type for email:", typeof email);
    throw new Error("Email must be a string");
  }

  try {
    const data = await client.send(
      new GetItemCommand({
        TableName: tableName,
        Key: {
          email: { S: email },
        },
      }),
    );
    return data.Item ? (unmarshall(data.Item) as User) : null;
  } catch (error) {
    console.error("Error getting user:", error);
    throw new Error("Could not retrieve the user");
  }
};

// DELETE user object from DynamoDB by ID
export const deleteUser = async (id: string) => {
  try {
    await client.send(
      new DeleteItemCommand({
        TableName: tableName,
        Key: { id: { S: id } },
      }),
    );
    console.log("User successfully deleted");
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new Error("Could not delete the user");
  }
};

// API Endpoints

// GET endpoint to retrieve a user by email
export async function GET(request: Request) {
  console.log("Retrieving user from DynamoDB");
  const url = new URL(request.url);
  const email = url.searchParams.get("email");

  if (!email) {
    return new Response("User email is required", { status: 400 });
  }

  try {
    const user = await getUser(email);
    if (!user) {
      return new Response("User not found", { status: 404 });
    }

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

  const { id, name, email, image, lastLoggedIn } = data || {};
  if (!id || !email) {
    return new Response("User ID and email are required", { status: 400 });
  }

  const newUser: User = {
    id,
    name: name || "Anonymous",
    email,
    image: image || "",
    accountCreated: new Date().toISOString(),
    lastLoggedIn: lastLoggedIn || new Date().toISOString(),
  };

  try {
    await putUser(newUser);
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

  if (!data.email) {
    return new Response("User email is required", { status: 400 });
  }

  console.log("Retrieving user with email:", data.email);
  const existingUser = await getUser(data.email);

  if (!existingUser) {
    return new Response("User not found", { status: 404 });
  }

  const updatedUser: User = {
    ...existingUser,
    ...data,
    lastLoggedIn: new Date().toISOString(),
  };

  try {
    await putUser(updatedUser);
    return new Response(JSON.stringify(updatedUser), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// DELETE endpoint to remove a user by ID
export async function DELETE(request: Request) {
  console.log("Deleting user from DynamoDB");
  const data = await request.json();

  const { id } = data;
  if (!id) {
    return new Response("User ID is required", { status: 400 });
  }

  try {
    await deleteUser(id);
    return new Response(
      JSON.stringify({ message: "User successfully deleted" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error deleting user:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
