import { NextRequest, NextResponse } from 'next/server';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { fromEnv } from '@aws-sdk/credential-providers';
import bcrypt from 'bcrypt';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.S3_UPLOAD_REGION,
  credentials: fromEnv(),
});

const ddbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);

const USERS_TABLE = 'curiocity-local-login-users';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;
    // console.log("Received Sign In Body:", body);d

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
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
        { error: 'Invalid email or password' },
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
        { error: 'Invalid email or password' },
        { status: 401 },
      );
    }

    userRecord.accountLastOpenedDate = new Date().toISOString();

    const updateParams = {
      TableName: USERS_TABLE,
      Item: userRecord,
    };

    await ddbDocClient.send(new PutCommand(updateParams));

    return NextResponse.json(
      {
        message: 'User signed in successfully',
        user: { email: userRecord.email, username: userRecord.username },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error signing in user:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
