import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Comment } from '@prisma/client';
import { userAuthentication, TokenPayload, CommentResponse } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function hideCommentHandler(
    req: NextApiRequest, 
    res: NextApiResponse<CommentResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { commentId, wantHidden } = req.body;
    if (!commentId) {
        return res.status(400).json({ error: 'Missing comment' });
    }

    /* User authorization and authentication */
    const user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    }

    if ((user as TokenPayload).role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can hide comments' });
    }
    /* End of user authorization and authentication */

    try {
        const hiddenComment = await prisma.comment.update({
            where: {
                commentId: Number(commentId)
            },
            data: {
                isHidden: wantHidden
            }
        });

        return res.status(200).json({ message: `Comment ${wantHidden ? 'hidden' : 'unhidden'} successful`, comment: hiddenComment });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to hide comment', details: (error as Error).message });
    }
}