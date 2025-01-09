import { NextApiRequest, NextApiResponse } from "next";
import { userAuthentication, TokenPayload, BlogPostExtended, prisma } from '@/utils';
import { ErrorResponse } from "@/types";

export default async function createBlogPostHandler(
    req: NextApiRequest, 
    res: NextApiResponse<{ message: string, blogPost: BlogPostExtended } | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const { title, description, body, tags } = req.body;
    if (!title || !description || !body) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    /* User authorization and authentication */
    let user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if (!user) {
        return res.status(401).json({ error: 'User not authenticated' });
    } else if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    } else if (user.accessToken) {
        user = await userAuthentication(user.accessToken, req.headers['refresh-token']);
    }
    /* End of user authorization and authentication */

    try {
        const blogPost = await prisma.blogPost.create({
        data: {
            title: title,
            description: description,
            body: body,
            userId: (user as TokenPayload).uId,
            tags: {
                connect: tags.map((tag: string) => ({ tag: tag }))
            }
        }, 
        include: {
            codeTemplates: true,
            comments: true,
        }
    });
        return res.status(201).json({ message: 'Blog post created successfully', blogPost, accessToken: user.accessToken });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create blog post', details: (error as Error).message });
    }
}
