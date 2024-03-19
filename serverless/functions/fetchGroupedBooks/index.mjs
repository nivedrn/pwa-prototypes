import { DynamoDBClient, ScanCommand, QueryCommand } from "@aws-sdk/client-dynamodb";

export const handler = async (event) => {
  // Access query parameters directly
  const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

  try {
    const categoryParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      ProjectionExpression: "categories", 
      Limit: 100, 
    };

    let filterExpression = "";

    const categoryData = await dynamodb.send(new ScanCommand(categoryParams));
    const uniqueCategories = Array.from(
      new Set(
        categoryData.Items.flatMap((item) => item.categories.SS) // Flatten and create a Set for uniqueness
      )
    );

    console.log(uniqueCategories);
    
    const groupedData = {};
    for (const category of uniqueCategories) {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        ProjectionExpression: "title, authors, thumbnail_url, isbn, short_description",
        Limit: 10,
        FilterExpression: "contains(categories, :category)",
        ExpressionAttributeValues: {
          ":category": { S: category },
        },
      };

      const categoryItems = await dynamodb.send(new ScanCommand(params));
      groupedData[category] = categoryItems.Items;
    }

    const response = {
      statusCode: 200,
      body: JSON.stringify(groupedData),
    };
    return response;
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};