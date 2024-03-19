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

export async function fetchBooks(limit: number, offset: number = 0, featured: boolean = false, category: string = "", search: string = "") {
    try {
        // Define parameters for invoking the Lambda function
        const params: InvokeCommandInput = {
            FunctionName: 'fetchBooks', // Specify the name of your Lambda function
            Payload: JSON.stringify({
                limit,
                offset,
                featured,
                category,
                search,
            }),
        };

        const { Payload } = await lambdaClient.send(new InvokeCommand(params));

        const asciiDecoder = new TextDecoder('ascii');
        const data = asciiDecoder.decode(Payload);
        const responsePayload = JSON.parse(data);

        if (responsePayload.statusCode === 200) {
            const booksData = JSON.parse(responsePayload.body);
            const unMarshalledData = booksData.map((item:any) => unmarshall(item));
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

export async function fetchBookDetails(bookId: string) {
    try {
        // Define parameters for invoking the Lambda function
        const params: InvokeCommandInput = {
            FunctionName: 'fetchBookDetails', // Specify the name of your Lambda function
            Payload: JSON.stringify({
                bookId
            }),
        };

        const { Payload } = await lambdaClient.send(new InvokeCommand(params));

        const asciiDecoder = new TextDecoder('ascii');
        const data = asciiDecoder.decode(Payload);
        const responsePayload = JSON.parse(data);

        if (responsePayload.statusCode === 200) {
            const booksData = JSON.parse(responsePayload.body);
            const unMarshalledData = booksData.map((item:any) => unmarshall(item));
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

export async function fetchGroupedBooks() {
    try {
        // Define parameters for invoking the Lambda function
        const params: InvokeCommandInput = {
            FunctionName: 'fetchGroupedBooks' 
        };

        const { Payload } = await lambdaClient.send(new InvokeCommand(params));

        const asciiDecoder = new TextDecoder('ascii');
        const data = asciiDecoder.decode(Payload);
        const responsePayload = JSON.parse(data);

        if (responsePayload.statusCode === 200) {
            const booksData = JSON.parse(responsePayload.body);
            let unMarshalledData: any = [];
            for(let item in booksData){
                unMarshalledData.push({
                    category: item,
                    books: booksData[item].map((item:any) => unmarshall(item))
                });
            }
            console.log(unMarshalledData);
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


export async function checkAWS() {
    try {

        const params: InvokeCommandInput = {
            FunctionName: 'checkAWS',
        };

        const { Payload } = await lambdaClient.send(new InvokeCommand(params));

        const asciiDecoder = new TextDecoder('ascii');
        const data = asciiDecoder.decode(Payload);
        const responsePayload = JSON.parse(data);
        console.log(responsePayload);
        if (responsePayload.statusCode === 200) {
            const booksData = JSON.parse(responsePayload.body);
            return { results: booksData };
        } else {
            console.error('Error invoking Lambda function:', responsePayload);
            return { data: null, error: 'Failed to fetch book records' };
        }
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch book records: ' + error };
    }
}