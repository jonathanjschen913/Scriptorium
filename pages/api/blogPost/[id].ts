import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "@/types";
import { prisma } from "@/utils";
import { BlogPost, BlogPostTag, Comment, User } from "@prisma/client";

interface BlogPostExtended extends BlogPost {
    author: {
        username: string;
        avatar: string;
    };
    tags: BlogPostTag[];
    upvotes: User[];
    downvotes: User[];
    comments: Comment[];
}

export default async function viewBlogPostHandler(
    req: NextApiRequest, 
    res: NextApiResponse<BlogPostExtended | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    if (!id) {
        return res.status(400).json({ error: 'Missing blog post id' });
    }

    try {
        const blogPost = await prisma.blogPost.findUnique({
            where: {
                postId: Number(id),
            },
            include: {
                comments: {
                    include: {
                        author: {
                            select: {
                                username: true,
                                avatar: true,
                            },
                        },
                        upvotes: true,
                        downvotes: true,
                        replies: {
                            include: {
                                author: {
                                    select: {
                                        username: true,
                                        avatar: true,
                                    },
                                },
                                upvotes: true,
                                downvotes: true,
                            }
                        },
                    },
                },
                codeTemplates: true,
                upvotes: true,
                downvotes: true,
                tags: true,
                author: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
            }
        });

        if (!blogPost || blogPost.isDeleted || blogPost.isHidden) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        return res.status(200).json(blogPost);
    } catch (error) {
        return res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
}