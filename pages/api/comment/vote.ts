import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, User, Comment } from '@prisma/client';
import { userAuthentication, TokenPayload, upvoteComment, removeCommentUpvote, downvoteComment, removeCommentDownvote, CommentExtended } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function voteCommentHandler(
    req: NextApiRequest, 
    res: NextApiResponse<{ message: string } | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const { voteType } = req.body;
    if (!id) {
        return res.status(400).json({ error: "Missing commentId" });
    } else if (!voteType) {
        return res.status(400).json({ error: "Missing vote type" });
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
        const userId = (user as TokenPayload).uId;
        const commentId = Number(id);

        const commentFromDB = await prisma.comment.findUnique({
            where: {
                commentId: commentId
            },
            include: {
                upvotes: true,
                downvotes: true
            }
        });

        const comment = (commentFromDB as CommentExtended);

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        } else if (comment.userId === userId) {
            return res.status(403).json({ error: 'You cannot vote on your own comment' });
        }

        if (voteType === "upvote") {
            // if user has already upvoted the comment, remove upvote
            if (Array.isArray(comment.upvotes) && comment.upvotes.some(upvote => upvote.uId === userId)) {
                const ret = await removeCommentUpvote(comment, commentId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to remove upvote', details: ret.error });
                }

                return res.status(200).json({ message: 'Removed upvote', accessToken: user.accessToken });
            } else {
                // if user has downvoted the comment, remove downvote first
                if (Array.isArray(comment.downvotes) && comment.downvotes.some(downvote => downvote.uId === userId)) {
                    const ret = await removeCommentDownvote(comment, commentId, userId);
                    if ("error" in ret) {
                        return res.status(500).json({ error: 'Failed to remove downvote', details: ret.error });
                    }
                }

                const ret = await upvoteComment(commentId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to upvote comment', details: ret.error });
                }

                return res.status(200).json({ message: 'Upvoted comment', accessToken: user.accessToken });
            }
        } else if (voteType === "downvote") {
            // if user has already downvoted the comment, remove downvote
            if (Array.isArray(comment.downvotes) && comment.downvotes.some(downvote => downvote.uId === userId)) {
                const ret = await removeCommentDownvote(comment, commentId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to remove downvote', details: ret.error });
                }

                return res.status(200).json({ message: 'Removed downvote', accessToken: user.accessToken });
            } else {
                // if user has upvoted the comment, remove upvote first
                if (Array.isArray(comment.upvotes) && comment.upvotes.some(upvote => upvote.uId === userId)) {
                    const ret = await removeCommentUpvote(comment, commentId, userId);
                    if ("error" in ret) {
                        return res.status(500).json({ error: 'Failed to remove upvote', details: ret.error });
                    }
                }

                const ret = await downvoteComment(commentId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to downvote comment', details: ret.error });
                }

                return res.status(200).json({ message: 'Downvoted comment', accessToken: user.accessToken });
            }
        } else {
            return res.status(400).json({ error: 'Invalid vote type' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch comment', details: (error as Error).message });
    }
}