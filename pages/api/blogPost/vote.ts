import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, BlogPostVoteExtended, upvoteBlogPost, removeBlogPostUpvote, downvoteBlogPost, removeBlogPostDownvote, prisma } from '@/utils';
import { ErrorResponse } from '@/types';

export default async function voteHandler(
    req: NextApiRequest, 
    res: NextApiResponse<{ message: string } | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { blogPostId } = req.query;
    const { voteType } = req.body;
    if (!blogPostId) {
        return res.status(400).json({ error: 'Blog post id is required' });
    } else if (!voteType) {
        return res.status(400).json({ error: 'Vote type is required' });
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
        const userId  = (user as TokenPayload).uId;
        const postId = Number(blogPostId);

        const blogPostFromDB = await prisma.blogPost.findUnique({
            where: {
                postId: postId
            },
            include: {
                upvotes: true,
                downvotes: true
            }
        });

        const blogPost = (blogPostFromDB as BlogPostVoteExtended);

        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        } else if (blogPost.userId === userId) {
            return res.status(403).json({ error: 'You cannot vote on your own blog post' });
        }

        if (voteType === 'upvote') {
            // if user has already upvoted the blog post, remove upvote
            if (Array.isArray(blogPost.upvotes) && blogPost.upvotes.some(upvote => upvote.uId === userId)) {
                const ret = await removeBlogPostUpvote(blogPost, postId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to remove upvote', details: ret.error });
                }

                return res.status(200).json({ message: 'Removed upvote', accessToken: user.accessToken });
            } else {
                // if user has already downvoted the blog post, remove downvote
                if (Array.isArray(blogPost.downvotes) && blogPost.downvotes.some(downvote => downvote.uId === userId)) {
                    const ret = await removeBlogPostDownvote(blogPost, postId, userId);
                    if ("error" in ret) {
                        return res.status(500).json({ error: 'Failed to remove downvote', details: ret.error });
                    }
                }

                const ret = await upvoteBlogPost(postId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to upvote', details: ret.error });
                }

                return res.status(200).json({ message: 'Upvoted', accessToken: user.accessToken });
            }
        } else if (voteType === 'downvote') {
            // if user has already downvoted the blog post, remove downvote
            if (Array.isArray(blogPost.downvotes) && blogPost.downvotes.some(downvote => downvote.uId === userId)) {
                const ret = await removeBlogPostDownvote(blogPost, postId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to remove downvote', details: ret.error });
                }

                return res.status(200).json({ message: 'Removed downvote', accessToken: user.accessToken });
            } else {
                // if user has already upvoted the blog post, remove upvote
                if (Array.isArray(blogPost.upvotes) && blogPost.upvotes.some(upvote => upvote.uId === userId)) {
                    const ret = await removeBlogPostUpvote(blogPost, postId, userId);
                    if ("error" in ret) {
                        return res.status(500).json({ error: 'Failed to remove upvote', details: ret.error });
                    }
                }

                const ret = await downvoteBlogPost(postId, userId);
                if ("error" in ret) {
                    return res.status(500).json({ error: 'Failed to downvote', details: ret.error });
                }

                return res.status(200).json({ message: 'Downvoted', accessToken: user.accessToken });
            }
        } else {
            return res.status(400).json({ error: 'Invalid vote type' });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to vote', details: (error as Error).message });
    }
}