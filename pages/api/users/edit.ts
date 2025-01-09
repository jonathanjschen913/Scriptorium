import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, UserSimplified, prisma } from '@/utils';
import path from "path";
import { ErrorResponse } from '@/types';

export default async function editUserProfilehandler(
    req: NextApiRequest, 
    res: NextApiResponse<{ message: string, user: UserSimplified} | ErrorResponse>
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: 'Missing user ID' });
    }
    
    const { username, email, phoneNumber, firstName, lastName, avatar } = req.body;
    if (!username && !email && !phoneNumber && !firstName && !lastName && !avatar) {
        return res.status(400).json({ error: 'Missing fields to update' });
    }

    /* User authorization and authentication */
    const user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    }

    if ((user as TokenPayload).uId !== Number(userId)) {
        return res.status(403).json({ error: 'You can only update your own profile' });
    }
    /* End of user authorization and authentication */

    try {
        const user = await prisma.user.findUnique({
            where: {
                uId: Number(userId)
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let avatarPath;
        if (avatar) {
            avatarPath = path.join("/avatars/", `${avatar}.png`);
        }

        const updatedUser = await prisma.user.update({
            where: {
                uId: Number(userId)
            },
            data: {
                username,
                email,
                phoneNumber,
                firstName,
                lastName,
                avatar: avatarPath
            },
            select: {
                uId: true,
                username: true,
                avatar: true,
                createdAt: true,
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

        return res.status(200).json({ message: "User updated successfully", user: updatedUser });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update user', details: (error as Error).message });
    }
}