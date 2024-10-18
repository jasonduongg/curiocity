import dotenv from "dotenv";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

dotenv.config();

const client = new DynamoDBClient({ region: "us-west-1" });

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  console.log("call put dynamodb");
  const data = await request.json();

  console.log(data);

  type document = {
    id: string;
    name: string;
    files: Array<string>;
    text: string;
  };

  const Item: document = {
    id: uuidv4(),
    name: "test",
    files: [data?.url || ""],
    text: "test",
  };

  const inputData = AWS.DynamoDB.Converter.marshall(Item);
  console.log("marshal data: ", inputData);

  client
    .send(
      new PutItemCommand({
        TableName: "curiocity-test",
        Item: inputData,
      }),
    )
    .then((data) => {
      console.log("done putting");
      console.log(data);
    })
    .catch((error) => console.log("error", error));

  console.log("done fetching, returing ");

  return Response.json({});
}
