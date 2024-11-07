import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import AWS from "aws-sdk";
import { NextResponse } from "next/server";

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.DOCUMENT_TABLE || "";

// Function to get all entries with only `id` and `name`
const getAllEntries = async (previewLength: number) => {
  if (!tableName)
    throw new Error("DOCUMENT_TABLE environment variable not set");

  try {
    const params = {
      TableName: tableName,
      ProjectionExpression: "id, #name, #text, #folders", // Retrieve only `id` and `name`
      ExpressionAttributeNames: {
        "#name": "name", // Handle reserved word `name`
        "#text": "text",
        "#folders": "folders",
      },
    };

    const command = new ScanCommand(params);
    const data = await client.send(command);

    // Unmarshall the data
    const items =
      data.Items?.map((item: any) => {
        const unmarshalledItem = AWS.DynamoDB.Converter.unmarshall(item);
        return {
          id: unmarshalledItem.id,
          name: unmarshalledItem.name,
          text: unmarshalledItem.text
            ? unmarshalledItem.text.substring(
                0,
                Math.min(previewLength, unmarshalledItem.text.length),
              )
            : "",
        };
      }) || [];

    // Sort items by createdAt date (most past to most present)
    const sortedItems = items.sort((a, b) => {
      const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : -Infinity;
      const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : -Infinity;
      return dateB - dateA; // Ascending order
    });

    return sortedItems;
  } catch (error) {
    console.error("Error retrieving all entries:", error);
    throw new Error("Could not retrieve entries");
  }
};

export async function GET() {
  try {
    const previewLength = 10;
    const items = await getAllEntries(previewLength);
    return NextResponse.json(items);
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
