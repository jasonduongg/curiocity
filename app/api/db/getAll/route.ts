import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import AWS from "aws-sdk";
import { NextResponse } from "next/server";

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.TABLE_NAME || "";

// Function to get all entries with only `id` and `name`
const getAllEntries = async () => {
  try {
    const params = {
      TableName: tableName,
      ProjectionExpression: "id, #name", // Retrieve only `id` and `name`
      ExpressionAttributeNames: {
        "#name": "name", // Handle reserved word `name`
      },
    };

    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Unmarshall the data
    const items =
      data.Items?.map((item: any) => AWS.DynamoDB.Converter.unmarshall(item)) ||
      [];

    return items;
  } catch (error) {
    console.error("Error retrieving all entries:", error);
    throw new Error("Could not retrieve entries");
  }
};

export async function GET() {
  try {
    const items = await getAllEntries();
    return NextResponse.json(items);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
