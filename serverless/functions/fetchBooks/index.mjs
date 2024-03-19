import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  const { limit = 14, offset = 0, featured = false, category = "", search = "" } = event.queryStringParameters || {};

  const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      ProjectionExpression: 'title, authors, thumbnail_url, isbn, short_description', // Customize projection as needed
    };

    // Build filter based on query parameters
    if (featured) {
      params.FilterExpression += ' featured = :featured';
      params.ExpressionAttributeValues[':featured'] = { BOOL: featured };
    }
    if (category && category !== "") {
      if (params.FilterExpression !== '') {
        params.FilterExpression += ' AND ';
      }
      params.FilterExpression += ' contains(categories, :category)';
      params.ExpressionAttributeValues[':category'] = { S: category };
    }
    if (search && search !== "") {
      if (params.FilterExpression !== '') {
        params.FilterExpression += ' AND ';
      }
      params.FilterExpression += '(contains(title, :search) OR any(contains(authors, :search)))';
      params.ExpressionAttributeValues[':search'] = { S: search };
    }

    if(params.ExpressionAttributeValues == {}){
      params.delete
    }

    // Pagination (DynamoDB doesn't support direct offset)
    const exclusiveStartKey = event.body ? JSON.parse(event.body).LastEvaluatedKey : undefined;
    if (exclusiveStartKey) {
      params.ExclusiveStartKey = exclusiveStartKey;
    }
    params.Limit = limit;

    const data = await dynamodb.send(new ScanCommand(params));

    const response = {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" + error }),
    };
  }
};