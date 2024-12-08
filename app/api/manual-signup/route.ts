import { NextRequest, NextResponse } from "next/server";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { fromEnv } from "@aws-sdk/credential-providers";
import bcrypt from "bcrypt";

const dynamoDbClient = new DynamoDBClient({
  region: process.env.S3_UPLOAD_REGION,
  credentials: fromEnv(),
});

const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const USERS_TABLE = "curiocity-local-login-users";
const DEFAULT_PROFILE_IMAGE =
  "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg";

const isPasswordValid = (password: string) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?]).{8,}$/;
  return passwordRegex.test(password);
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, passwordConfirmation } = body;
    console.log("Received Body:", body);

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    if (!passwordConfirmation) {
      return NextResponse.json(
        { error: "Password confirmation is required" },
        { status: 400 },
      );
    }

    if (password !== passwordConfirmation) {
      return NextResponse.json(
        { error: "Passwords do not match" },
        { status: 400 },
      );
    }

    if (!isPasswordValid(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.",
        },
        { status: 400 },
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password + email, salt);

    const accountCreatedDate = new Date().toISOString();

    const userRecord = {
      email,
      password: hashedPassword,
      image: DEFAULT_PROFILE_IMAGE,
      username: name,
      accountCreatedDate,
      accountLastOpenedDate: null,
    };

    const params = {
      TableName: USERS_TABLE,
      Item: userRecord,
    };

    const putCommand = new PutCommand(params);
    await ddbDocClient.send(putCommand);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { email, username: name },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error saving user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
