import { NextApiRequest, NextApiResponse } from "next";
import { userAuthentication, TokenPayload, BlogPostResponse, prisma } from '@/utils';
import { ErrorResponse } from "@/types";


export default async function deleteBlogPostHandler(
    req: NextApiRequest, 
    res: NextApiResponse<BlogPostResponse | ErrorResponse>
) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({error: 'Method not allowed'});
    }

    const{ blogPostId } = req.query;
    if (!blogPostId) {
        return res.status(400).json({ error: 'Missing blog post ID' });
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
        const blogPost = await prisma.blogPost.findUnique({
            where: {
                postId: Number(blogPostId)
            }
        });

        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        } else if (blogPost.userId !== Number((user as TokenPayload).uId)){
            return res.status(403).json({error: 'You are not allowed to delete this blog post because you are not the owner'});
        }

        const deletedBlogPost = await prisma.blogPost.update({
            where: {
                postId: Number(blogPostId)
            },    
            data: {
                isDeleted: true
            }    
        });
        
        return res.status(200).json({ message: 'Blog post deleted successfully', blogPost: deletedBlogPost, accessToken: user.accessToken });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete blog post', details: (error as Error).message });
    }
}