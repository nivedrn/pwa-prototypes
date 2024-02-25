'use server'

import clientPromise from "../lib/mongodb";

export async function fetchBooks(limit: number, offset:number = 0, featured: boolean = false ) {
    try {
        
        const client = await clientPromise;
        const db = client.db(process.env.MONGODB_NAME);        

        const query = featured ?  { featured: featured } :  {};         
        const options = { projection: { _id: 0 }, skip: offset, limit: limit };
        const booksData = await db.collection("books").find(query, options).toArray();
        
        return { results: booksData };
    } catch (error) {
        console.log('error', error);
        return { data: null, error: 'Failed to fetch book records: ' + error };
    }
}
