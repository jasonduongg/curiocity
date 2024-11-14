import { NextRequest, NextResponse } from "next/server";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.DOCUMENT_TABLE || "";

export async function POST(request: NextRequest) {
  const { id } = await request.json();
  const lastOpened = new Date().toISOString();

  if (!id) {
    return NextResponse.json(
      { error: "Document ID is required" },
      { status: 400 },
    );
  }

  try {
    const command = new UpdateItemCommand({
      TableName: tableName,
      Key: { id: { S: id } },
      UpdateExpression: "SET lastOpened = :lastOpened",
      ExpressionAttributeValues: {
        ":lastOpened": { S: lastOpened },
      },
    });

    await client.send(command);
    return NextResponse.json({
      message: "lastOpened field updated successfully",
    });
  } catch (error) {
    console.error("Error updating lastOpened field:", error);
    return NextResponse.json(
      { error: "Could not update lastOpened field" },
      { status: 500 },
    );
  }
}
