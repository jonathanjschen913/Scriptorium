import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/utils' 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { username, email, phoneNumber } = req.body;

    if (!username && !email && !phoneNumber) {
        return res.status(400).json({ error: 'At least one field is required' });
    }

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                    { phoneNumber },
                ],
            },
        });

        if (existingUser) {
            return res.status(200).json({
                usernameExists: existingUser.username === username,
                emailExists: existingUser.email === email,
                phoneNumberExists: existingUser.phoneNumber === phoneNumber,
            });
        } else {
            return res.status(200).json({
                usernameExists: false,
                emailExists: false,
                phoneNumberExists: false,
            });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to check uniqueness' });
    }
}