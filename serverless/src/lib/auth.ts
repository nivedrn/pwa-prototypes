'use server'
import { LambdaClient, InvokeCommand, InvokeCommandInput } from "@aws-sdk/client-lambda";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const secretKey = process.env.TOKEN_SECRET ?? "secret";
const key = new TextEncoder().encode(secretKey);

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

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("3600 sec from now")
        .sign(key);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (error) {
        cookies().delete('session');
        console.log("JWT Decrypt Error : " + error);
        return null;
    }
}

export async function loginUser(email: string, password: string) {
    try {
      const params: InvokeCommandInput = {
        FunctionName: 'userLogin', // Specify the name of your Lambda function
        Payload: JSON.stringify({
          email,
          password
        }),
      };
  
      const { Payload } = await lambdaClient.send(new InvokeCommand(params));
  
      const asciiDecoder = new TextDecoder('ascii');
      const data = asciiDecoder.decode(Payload);
      const responsePayload = JSON.parse(data);
  
      if (responsePayload.statusCode === 200) {
        // Login successful
        return responsePayload.results; // Return user details (ID, email, name)
      } else {
        // Handle login errors
        console.error('Error invoking Lambda function:', responsePayload);
        return { error: responsePayload.error }; // Return specific error message for user feedback (consider security implications in production)
      }
    } catch (error) {
      console.error('error', error);
      return { error: 'Failed to login user: ' + error }; // Generic error message for troubleshooting
    }
  }

export async function userSignUp(name: string, email: string, password: string) {
    try {
        const params: InvokeCommandInput = {
            FunctionName: 'userSignUp', // Specify the name of your Lambda function
            Payload: JSON.stringify({
                name,
                email,
                password
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

export async function userLogout() {
    cookies().delete('session');
    return { results: "Logout Successfull", error: null, status: 200 };
}

export async function fetchUserSession() {
    const session: any = cookies().get("session")?.value;
    console.log(session);
    if (!session) return null;
    return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get("session")?.value;
    if (!session) return;

    // Refresh the session so it doesn't expire
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 10 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: "session",
        value: await encrypt(parsed),
        httpOnly: true,
        expires: parsed.expires,
    });
    return res;
}