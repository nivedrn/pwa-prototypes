import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  const { bookid = "" } = event.queryStringParameters || {};

  console.log("Book ID:", bookid);
  const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        isbn: { S: bookid }, // Assuming 'isbn' is the primary key
      },
    };

    if (!bookid) {
      return {
        statusCode: 400, // Bad request for missing bookid
        body: JSON.stringify({ error: "Book ID is required" }),
      };
    }

    const data = await dynamodb.send(new GetItemCommand(params));

    if (!data.Item) {
      return {
        statusCode: 404, // Not found
        body: JSON.stringify({ error: "Book not found" }),
      };
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Item),
    };
    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }), // Don't expose detailed error information
    };
  }
};