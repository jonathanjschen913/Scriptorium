import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, Comment } from '@prisma/client';
import { TokenPayload, userAuthentication, getParentBlogPost, getParentComment, CommentResponse } from '@/utils';
import { ErrorResponse } from "@/types";

const prisma = new PrismaClient();

export default async function createCommentHandler(
    req: NextApiRequest, 
    res: NextApiResponse< CommentResponse | ErrorResponse >
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { body, parentId, blogPostId } = req.body;
    if (!body) {
        return res.status(400).json({ error: 'Cannot write empty comment' });
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
        let blogPost = await getParentBlogPost(blogPostId);
        if (!blogPost || "error" in blogPost) {
            return res.status(404).json({ error: 'Blog post not found', details: blogPost?.error });
        }

        let parentComment = await getParentComment(parentId);
        if (parentComment && "error" in parentComment) {
            return res.status(404).json({ error: 'Parent comment not found' });
        }

        let comment: Comment;

        /* Case 1:  Comment being created is a top level comment on a blog */
        if (parentComment === null || Object.keys(parentComment).length === 0) {
            comment = await prisma.comment.create({
                data: {
                    body: body,
                    blogPostId: Number(blogPostId),
                    userId: (user as TokenPayload).uId
                }
            });

            // add comment to blog post
            await prisma.blogPost.update({
                where: {
                    postId: Number(blogPostId)
                },
                data: {
                    comments: {
                        connect: {
                            commentId: comment.commentId
                        }
                    }
                }
            });

            return res.status(201).json({ message: "Comment created successfully", comment});

        /* Case 2: Comment is a reply */
        } else if (parentComment !== null && Object.keys(parentComment).length > 0) {
            comment = await prisma.comment.create({
                data: {
                    body: body,
                    blogPostId: Number(blogPostId),
                    userId: (user as TokenPayload).uId,
                    parentId: Number(parentId),
                    depth: parentComment.depth + 1
                }
            });

            // add comment to parent comment
            await prisma.comment.update({
                where: {
                    commentId: Number(parentId)
                },
                data: {
                    replies: {
                        connect: {
                            commentId: comment.commentId
                        }
                    }
                }
            });

            return res.status(201).json({ message: "Comment created successfully", comment, accessToken: user.accessToken });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create comment', details: (error as Error).message });
    }
}
