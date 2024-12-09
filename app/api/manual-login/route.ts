import { NextRequest, NextResponse } from "next/server";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const dynamoDbClient = new DynamoDBClient({
  region: process.env.S3_UPLOAD_REGION,
  credentials: fromEnv(),
});

const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const USERS_TABLE = "curiocity-local-login-users";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    console.log("Received Sign In Body:", body);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const params = {
      TableName: USERS_TABLE,
      Key: {
        email: email,
      },
    };

    const getCommand = new GetCommand(params);
    const response = await ddbDocClient.send(getCommand);
    const userRecord = response.Item;

    if (!userRecord) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const hashedPassword = userRecord.password;

    const isPasswordMatch = await bcrypt.compare(
      password + email,
      hashedPassword,
    );

    if (!isPasswordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Generate a session ID
    const sessionId = uuidv4();

    // Update the user's last opened date
    userRecord.accountLastOpenedDate = new Date().toISOString();

    const updateParams = {
      TableName: USERS_TABLE,
      Item: userRecord,
    };

    await ddbDocClient.send(new PutCommand(updateParams));

    // Create cookies for session ID and email
    const responsePayload = {
      message: "User signed in successfully",
      user: { email: userRecord.email, username: userRecord.username },
    };

    const nextResponse = NextResponse.json(responsePayload, { status: 200 });

    nextResponse.cookies.set("sessionId", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: "/",
    });

    nextResponse.cookies.set("email", email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: "/",
    });

    return nextResponse;
  } catch (error) {
    console.error("Error signing in user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
