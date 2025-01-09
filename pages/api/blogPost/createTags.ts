import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "@/types";
import { BlogPostTag } from '@prisma/client';
import { prisma } from "@/utils";

export default async function createTagsHandler(
    req: NextApiRequest, 
    res: NextApiResponse<BlogPostTag | ErrorResponse>
) {
    if (req.method !== 'POST'){
        return res.status(405).json({error: 'Method not allowed'});
    }

    const { tag } = req.body;
    if (!tag) {
        return res.status(400).json({ error: 'Missing tag' });
    }

    try{
        const blogPostTag = await prisma.blogPostTag.create({
            data: {
                tag: tag
            }
        });

        return res.status(201).json(blogPostTag);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create blog post tag', details: (error as Error).message});
    }
}