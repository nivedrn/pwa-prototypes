'use server'

import clientPromise from "../lib/mongodb";

export async function createOrder(data: any) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
        
        let orderData = data;
        const result: any = await db.collection("users").insertOne(orderData);
        console.log("Order creation error: ", result);
        if (result.acknowledged) {
            
            // return { results: { email: email, name: name}, error: null, status: 200 };
        } else {
            return { results: null, error: "Failed to sign up user.", status: 500 };
        }

    } catch (error) {
        console.log("Sign Up action error: ", error);
        return { results: null, error: "Sign Up action error: " + error, status: 400 };
    }
}
