import AWS from 'aws-sdk';

// Configure AWS SDK
AWS.config.update({
  region: 'us-west-1', // Replace with your AWS region
  accessKeyId: 'AKIAUBKFCTV7CA35GVMA', // Replace with your AWS Access Key
  secretAccessKey: 'A38T+wI603HcdYocF3VVKPlF6hPoUOndATjOy/9V', // Replace with your AWS Secret Key
});

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function testDynamoDb() {
  const params = {
    TableName: 'curiocity-local-login-users', // Replace with your DynamoDB table name
    Item: {
      id: 'test-id',
      name: 'Test User',
      email: 'test@example.com',
    },
  };

  try {
    await dynamoDb.put(params).promise();
    console.log('DynamoDB is working! Test item saved successfully.');
  } catch (error) {
    console.error('DynamoDB error:', error);
  }
}

testDynamoDb();
