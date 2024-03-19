import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

export async function userSignUp(name, email, password) {
  try {
    // Assuming password is already hashed (implement hashing logic if needed)
    const hashedPassword = password;

    const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        name: { S: name }, // S for String data type
        email: { S: email },
        password: { S: hashedPassword }
      },
    };

    const data = await dynamodb.send(new PutItemCommand(params));

    if (!data.UnprocessedItems) {
      // User successfully inserted
      const userId = data.Attributes.email.S; // Assuming email is the primary key
      return { results: { id: userId, email }, error: null, status: 200 };
    } else {
      // Handle potential errors (e.g., email already exists)
      return { results: null, error: "Failed to sign up user.", status: 500 };
    }
  } catch (error) {
    console.error("Sign Up action error: ", error);
    return { results: null, error: "Sign Up action error: " + error, status: 400 };
  }
}