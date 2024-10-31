import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import AWS from "aws-sdk";
import { Document } from "../route";

const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.DOCUMENT_TABLE || "";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    const res = await client.send(
      new ScanCommand({
        TableName: tableName,
      }),
    );

    if (!res.Items || res.Items.length === 0) {
      return Response.json([]);
    }

    const items = res.Items.map(
      (item) => AWS.DynamoDB.Converter.unmarshall(item) as Document,
    );

    const sortedItems = items.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : -Infinity;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : -Infinity;

      return dateB - dateA;
    });

    console.log("sorted items:", sortedItems);
    return Response.json(sortedItems);
  } catch (error) {
    console.error("Error fetching sorted items:", error);
    return Response.json(
      { error: "Could not retrieve sorted items" },
      { status: 500 },
    );
  }
}
