import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, BlogPostResponse, prisma } from '@/utils';
import { ErrorResponse } from '@/types';

export default async function hideBlogPostHandler(
    req: NextApiRequest, 
    res: NextApiResponse<BlogPostResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { blogPostId, wantHidden } = req.body;
    if (!blogPostId) {
        return res.status(400).json({ error: 'Missing blog post id' });
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
        const hiddenBlogPost = await prisma.blogPost.update({
            where: {
                postId: Number(blogPostId)
            },
            data: {
                isHidden: wantHidden
            }
        });

        return res.status(200).json({ message: `Blog post ${wantHidden ? 'hidden' : 'unhidden'} successful`, blogPost: hiddenBlogPost });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to hide blog post', details: (error as Error).message });
    }
}