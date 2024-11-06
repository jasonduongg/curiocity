import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import AWS from "aws-sdk";
import { Document } from "../route";

const client = new DynamoDBClient({ region: "us-west-1" });
const tableName = process.env.DOCUMENT_TABLE || "";

export async function GET(request: NextRequest) {
  try {
    const res = await client.send(new ScanCommand({ TableName: tableName }));

    if (!res.Items || res.Items.length === 0) {
      return NextResponse.json([]);
    }

    const items = res.Items.map(item =>
      AWS.DynamoDB.Converter.unmarshall(item) as Document
    );

    const sortedItems = items.sort((a, b) => {
      const dateA = a.lastOpened ? new Date(a.lastOpened).getTime() : -Infinity;
      const dateB = b.lastOpened ? new Date(b.lastOpened).getTime() : -Infinity;
      return dateB - dateA;
    });

    return NextResponse.json(sortedItems);
  } catch (error) {
    console.error("Error fetching sorted documents:", error);
    return NextResponse.json({ error: "Could not fetch sorted documents" }, { status: 500 });
  }
}
