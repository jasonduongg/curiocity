import { NextResponse } from 'next/server';
import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { unmarshall, marshall } from '@aws-sdk/util-dynamodb';

const dynamoDBClient = new DynamoDBClient({ region: 'us-west-1' });
const resourceMetaTable = process.env.RESOURCEMETA_TABLE || '';

export async function POST(req: Request) {
  try {
    const { id, notes } = await req.json();

    if (!id || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Resource ID and notes are required.' },
        { status: 400 },
      );
    }

    // Prepare item to save
    const newItem = {
      id,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save item to DynamoDB
    const command = new PutItemCommand({
      TableName: resourceMetaTable,
      Item: marshall(newItem),
    });

    await dynamoDBClient.send(command);

    return NextResponse.json({
      message: 'Notes created successfully.',
      data: newItem,
    });
  } catch (error) {
    console.error('Error in POST /resourceMetaNotes:', error);
    return NextResponse.json(
      { error: 'Failed to create notes.' },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  console.log('Received PUT request for resourceMetaNotes');

  try {
    const { id, notes } = await request.json();
    console.log('Request payload:', { id, notes });

    if (!id || typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Resource ID and notes are required.' },
        { status: 400 },
      );
    }

    // Retrieve the existing item
    const getCommand = new GetItemCommand({
      TableName: resourceMetaTable,
      Key: { id: { S: id } },
    });

    const getResult = await dynamoDBClient.send(getCommand);

    if (!getResult.Item) {
      console.error('Resource not found for ID:', id);
      return NextResponse.json(
        { error: 'Resource not found.' },
        { status: 404 },
      );
    }

    const existingItem = unmarshall(getResult.Item);
    console.log('Retrieved item from DynamoDB:', existingItem);

    // Update the item with new notes and updatedAt
    const updatedItem = {
      ...existingItem,
      notes,
      updatedAt: new Date().toISOString(),
    };

    console.log('Updated item:', updatedItem);

    // Save the updated item back to DynamoDB
    const putCommand = new PutItemCommand({
      TableName: resourceMetaTable,
      Item: marshall(updatedItem),
    });

    const putResult = await dynamoDBClient.send(putCommand);
    console.log('Put result:', putResult);

    return NextResponse.json({
      message: 'Notes updated successfully.',
      data: updatedItem,
    });
  } catch (error) {
    console.error('Error in PUT /resourceMetaNotes:', error);
    return NextResponse.json(
      { error: 'Failed to update notes.' },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    // Log the received ID
    console.log('Received resource ID:', id);

    if (!id) {
      console.error('Missing resource ID in query parameters.');
      return NextResponse.json(
        { error: 'Resource ID is required.' },
        { status: 400 },
      );
    }

    // Prepare and log the DynamoDB command
    const command = new GetItemCommand({
      TableName: resourceMetaTable,
      Key: {
        id: { S: id },
      },
    });

    console.log('DynamoDB GetItemCommand:', command);

    // Send the command to DynamoDB
    const result = await dynamoDBClient.send(command);

    // Log the result from DynamoDB
    console.log('DynamoDB result:', result);

    if (!result.Item) {
      console.warn('Resource not found for ID:', id);
      return NextResponse.json(
        { error: 'Resource not found.' },
        { status: 404 },
      );
    }

    const data = unmarshall(result.Item);

    // Log the unmarshalled data
    console.log('Unmarshalled data:', data);

    return NextResponse.json({ notes: data.notes || '' });
  } catch (error) {
    console.error('Error in GET /resourceMetaNotes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notes.' },
      { status: 500 },
    );
  }
}
