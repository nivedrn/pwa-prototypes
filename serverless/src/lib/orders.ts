'use server';
import { LambdaClient, InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";

// Configure AWS credentials
const credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    region: 'eu-central-1',
};

// Create an instance of the Lambda client
const lambdaClient = new LambdaClient(credentials);

interface LambdaEvent {
    limit: number;
    offset?: number;
    featured?: boolean;
    category?: string;
    search?: string;
}
export async function createOrder(orderData: any) {
    try {
        const params: InvokeCommandInput = {
            FunctionName: 'userSignUp', // Specify the name of your Lambda function
            Payload: JSON.stringify({
                orderData
            }),
        };

        const { Payload } = await lambdaClient.send(new InvokeCommand(params));

        const asciiDecoder = new TextDecoder('ascii');
        const data = asciiDecoder.decode(Payload);
        const responsePayload = JSON.parse(data);

        if (responsePayload.statusCode === 200) {
            // User signup successful
            return responsePayload.results; // Return user ID and email
        } else {
            // Handle signup errors
            console.error('Error invoking Lambda function:', responsePayload);
            return { data: null, error: 'Failed to sign up user' };
        }
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to sign up user: ' + error };
    }
}

export async function fetchOrders(currentUser: boolean = true, currentUserId: string | undefined, limit: number, offset: number = 0, search: string = "") {
    try {
        // Define parameters for invoking the Lambda function
        const params: InvokeCommandInput = {
            FunctionName: 'fetchBooks', // Specify the name of your Lambda function
            Payload: JSON.stringify({
                currentUser,
                currentUserId,
                limit,
                offset,
                search,
            }),
        };

        const { Payload } = await lambdaClient.send(new InvokeCommand(params));

        const asciiDecoder = new TextDecoder('ascii');
        const data = asciiDecoder.decode(Payload);
        const responsePayload = JSON.parse(data);

        if (responsePayload.statusCode === 200) {
            const ordersData = JSON.parse(responsePayload.body);
            const unMarshalledData = ordersData.map((item:any) => unmarshall(item));
            return { results: unMarshalledData };
        } else {
            console.error('Error invoking Lambda function:', responsePayload);
            return { data: null, error: 'Failed to fetch book records' };
        }

    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch book records: ' + error };
    }
}

