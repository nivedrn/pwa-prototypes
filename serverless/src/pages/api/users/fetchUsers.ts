import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/dbConnect';
//import { User } from '../../../models/user';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        
        const { db } = await connectToDatabase();
        const users = await db.collection('users').find({}, { projection: { _id: 0, password: 0 } }).toArray();
        res.status(200).json(users);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
