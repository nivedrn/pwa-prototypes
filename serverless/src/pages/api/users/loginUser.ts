import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../utils/dbConnect';
import bcrypt from 'bcrypt';

const SECRET_KEY = process.env.JWT_SECRET_KEY as string; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { email, password } = req.body;

        try {
            // Connect to the database
            const { db } = await connectToDatabase();

            // Find the user by email
            const user = await db.collection('users').findOne({ email });

            // If user not found, return error
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            // Check if password matches
            const passwordMatch = await bcrypt.compare(password, user.password);

            // If password doesn't match, return error
            if (!passwordMatch) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // Generate JWT token
            const token = jwt.sign({ userId: user._id }, SECRET_KEY, { expiresIn: '1h' });

            // Send the token as response
            res.status(200).json({ token });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}