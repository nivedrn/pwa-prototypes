import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid'; 

export async function createOrder(orderData) {
  try {
    const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

    const OrderId = uuidv4();  
    const timestamp = new Date().toISOString();

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        OrderId: { S: OrderId }, 
        customer: { S: orderData.customer },
        customerEmail: { S: orderData.customerEmail },
        orderTotal: { N: String(orderData.orderTotal) },  
        currencySymbol: { S: orderData.currencySymbol },
        items: { L: orderData.items.map(item => ({
          M: {
            id: { S: item.id },
            isbn: { S: item.isbn },
            title: { S: item.title },
            qty: { N: String(item.qty) },  
            price: { N: String(item.price) },  
            amount: { N: String(item.amount) },  
          }
        }))} ,
        paymentInfo: { M: orderData.paymentInfo },  
        status: { S: orderData.status },
        createdAt: { S: timestamp },
      },
    };

    const data = await dynamodb.send(new PutItemCommand(params));

    if (!data.UnprocessedItems) {
   
      return {
        statusCode: 200,
        body: JSON.stringify(data.OrderId),
      }; 
    } else {
      console.error('Error inserting order:', data.UnprocessedItems);
      throw new Error('Failed to create order');  
    }
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;  
  }
}