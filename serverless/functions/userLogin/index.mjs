import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { compareSync } from 'bcryptjs';  

export async function userLogin(email, password) {
  try {
    const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: {
        email: { S: email }, 
      },
    };

    const data = await dynamodb.send(new GetItemCommand(params));

    if (!data.Item) {
      return { results: null, error: "User not found.", status: 400 };
    }

    const user = data.Item;

    const validPassword = compareSync(password, user.password.S); 
    if (!validPassword) {
      return { error: "Invalid credentials.", status: 400 };
    }


    return { results: { id: user.email.S, email: user.email.S, name: user.name?.S }, error: null, status: 200 };
  } catch (error) {
    console.error("Login action error: ", error);
    return { results: null, error: "Login action error: " + error, status: 400 };
  }
}