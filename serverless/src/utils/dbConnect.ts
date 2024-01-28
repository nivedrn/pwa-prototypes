import { MongoClient, MongoClientOptions, Db } from 'mongodb';

let cachedDb: Db;

export async function connectToDatabase(): Promise<{ db: Db }> {

    try {

        if (cachedDb) {
            console.log('Using existing MongoDB connection');
            return { db : cachedDb };
        }

        const client = await MongoClient.connect(process.env.MONGODB_URI as string);
        cachedDb = await client.db(process.env.MONGODB_NAME);
        return {db : cachedDb};

    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
        throw error;
    }
}
