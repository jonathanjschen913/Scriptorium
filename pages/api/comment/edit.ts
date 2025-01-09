import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, CommentResponse } from '@/utils';
import { ErrorResponse } from '@/types';
import { PrismaClient, Comment } from '@prisma/client';

const prisma = new PrismaClient();

export default async function editCommentHandler(
    req: NextApiRequest, 
    res: NextApiResponse< CommentResponse| ErrorResponse>
) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { body, commentId, blogPostId } = req.body;
    if (!commentId) {
        return res.status(400).json({ error: 'Missing comment id' });
    } else if (!body) {
        return res.status(400).json({ error: 'Cannot write empty comment' });
    } else if (!blogPostId) {
        return res.status(400).json({ error: 'Missing blog post' });
    }

    /* User authorization and authentication */
    let user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    } else if (user.accessToken) {
        user = await userAuthentication(user.accessToken, req.headers['refresh-token']);
    }
    /* End of user authorization and authentication */
     
    try {
        const comment = await prisma.comment.findUnique({
            where: {
                commentId: Number(commentId)
            }
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        } else if (comment.userId !== (user as TokenPayload).uId) {
            return res.status(403).json({ error: 'You are not allowed to edit this comment because you are not the owner' });
        } else if (comment.isHidden) {
            return res.status(403).json({error: 'You are not allowed to edit this blog post because it has been hidden by an admin'});
        }

        const updatedComment = await prisma.comment.update({
            where: {
                commentId: Number(commentId)
            },
            data: {
                body: body
            }
        });
        return res.status(200).json({message: "Comment edit successful", comment: updatedComment, accessToken: user.accessToken});
    } catch (error) {
        return res.status(500).json({ error: 'Failed to update comment', details: (error as Error).message });
    }
}