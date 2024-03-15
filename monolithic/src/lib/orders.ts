'use server'

import clientPromise from "../lib/mongodb";

export async function createOrder(data: any) {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
        const orderData = JSON.parse(data);   
        console.log(orderData.paymentInfo);
        const existingOrder = await db.collection("orders").findOne({ 
            "paymentInfo.paymentIntentSecret" : orderData.paymentInfo.paymentIntentSecret, 
            "paymentInfo.paymentIntent" : orderData.paymentInfo.paymentIntent 
        });

        if (existingOrder) {
            return { results: null, error: "Order Already Created.", status: 400 };
        }

        const result: any = await db.collection("orders").insertOne(orderData);
        console.log("Order creation result: ", result);
        if (result.acknowledged) {
            return { results: "Order Successful", error: null, status: 200 };
        } else {
            return { results: null, error: "Failed to create order.", status: 500 };
        }

    } catch (error) {
        console.log("Order Creation action error: ", error);
        return { results: null, error: "Order Creation action error: " + error, status: 400 };
    }
}


export async function fetchOrders(currentUser: boolean = true, currentUserId: string | undefined, limit: number, offset: number = 0, search: string = "") {
    try {
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);
        
        const query: any = {};
        
        if (search && search !== "") {
            query.$or = [
                { "items.title": { $regex: search, $options: 'i' } }, 
                { "items.authors": { $elemMatch: { $regex: search, $options: 'i' } } } 
            ];
        }

        if(currentUser && currentUserId != null){
            query.customer = currentUserId;
        }

        const options = { 
            projection: {
                id: { $toString: "$_id" },
                items: 1,
                paymentInfo: 1,
                status: 1,
                customerEmail: 1,
                orderTotal: 1,
                currencySymbol: 1,
                _id: 0
            },
            skip: offset, limit: limit };
        const ordersData = await db.collection("orders").find(query, options).toArray();

        return { results: ordersData, error: null };
    } catch (error) {
        console.log('error', error);
        return { results: null, error: 'Failed to fetch order records: ' + error };
    }
}

