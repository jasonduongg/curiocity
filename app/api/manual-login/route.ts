import { NextRequest, NextResponse } from "next/server";
import AWS from "aws-sdk";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

AWS.config.update({
  region: process.env.S3_UPLOAD_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const USERS_TABLE = "curiocity-local-login-users";

// profile image url (not sure if there is a exsisting image to draw on)
const DEFAULT_PROFILE_IMAGE =
  "https://st3.depositphotos.com/6672868/13701/v/450/depositphotos_137014128-stock-illustration-user-profile-icon.jpg"; // Replace with your image URL

const isPasswordValid = (password: string) => {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
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

    const hashedPassword = await bcrypt.hash(password + name, salt);

    const userId = uuidv4();

    const userRecord = {
      id: userId,
      email,
      password: hashedPassword,
      image: DEFAULT_PROFILE_IMAGE,
      username: name, // Use the name field as the username
      accountCreatedDate: null,
      accountLastOpenedDate: null,
    };

    const params = {
      TableName: USERS_TABLE,
      Item: userRecord,
    };

    await dynamoDb.put(params).promise();

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
