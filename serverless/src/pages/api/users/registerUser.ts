import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/dbConnect';
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { name, email, password } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Connect to MongoDB
        const { db } = await connectToDatabase();

        // Access the ResearchStudy user collection
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email });

        if (!user) {            

            const newUser = {
                name,
                email,
                password: hashedPassword,
                addresses: [],
                paymentMethods: []
            };

            await usersCollection.insertOne(newUser);
            res.status(200).json({ message: 'User registered successfully' });
        }else{
            res.status(401).json({ message: 'This email id has been already registered' });
        }

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
}
