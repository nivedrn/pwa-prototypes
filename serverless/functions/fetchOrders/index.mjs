import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  const { limit = 20, offset = 0 } = event.queryStringParameters || {};

  const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      ProjectionExpression: 'items, paymentInfo, status, OrderId, customerEmail, customer, orderTotal, currencySymbol',  
    };

    if(params.ExpressionAttributeValues == {}){
      params.delete
    }
 
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