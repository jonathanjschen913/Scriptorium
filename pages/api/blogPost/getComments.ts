import { NextApiRequest, NextApiResponse } from "next";
import { Comment } from '@prisma/client';
import { ErrorResponse } from "@/types";
import { prisma } from "@/utils";

export default async function getCommentsHandler(
    req: NextApiRequest, 
    res: NextApiResponse<ErrorResponse | Comment[] | { message: string }>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({error: 'Method not allowed'});
    }
    
    const { blogPostId } = req.query;
    if (!blogPostId) {
        return res.status(400).json({ error: 'blogPostId is required' });
    }

    try{
        const blogPost = await prisma.blogPost.findUnique({
            where: {
                postId: Number(blogPostId)
            }
        });

        if (!blogPost || blogPost.isHidden || blogPost.isDeleted) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const comments = await prisma.comment.findMany({
            where: {
                blogPostId: Number(blogPostId),
            }
        });

        if (!comments.length) {
            return res.status(200).json({ message: 'No comments to be found' });
        }

        return res.status(200).json(comments);
    } catch (error){
        return res.status(500).json({error: 'Failed to get comments', details: (error as Error).message});
    }
}