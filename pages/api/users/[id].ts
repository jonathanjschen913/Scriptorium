import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "@/types";
import { UserSimplified, prisma } from "@/utils";

export default async function userHandler(
    req: NextApiRequest, 
    res: NextApiResponse<UserSimplified | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Missing user id' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                username: id as string
            },
            select: {
                uId: true,
                username: true,
                avatar: true,
                createdAt: true,
                phoneNumber: true,
                email: true,
                firstName: true,
                lastName: true,
                blogPosts: {
                    where: {
                        isHidden: false,
                        isDeleted: false
                    }, 
                },
                codeTemplates: {
                    where: {
                        isHidden: false,
                        isDeleted: false
                    }   
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to get user', details: (error as Error).message });
    }
}