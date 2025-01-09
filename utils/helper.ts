import { PrismaClient, Comment, BlogPost, CodeTemplate, User, Report, Code } from "@prisma/client";

const prisma = new PrismaClient();

export interface ReportSearchResponse {
    reports: Report[],
    currentPage: number,
    totalPages: number,
    totalReports: number
}

export interface UserSimplified {
    uId: number;
    username: string;
    avatar: string;
    createdAt: Date;
    blogPosts: BlogPost[];
    codeTemplates: CodeTemplate[];
}

export interface CodeTemplateResponse {
    message: string,
    codeTemplate: CodeTemplate
}

export interface BlogPostResponse {
    message: string,
    blogPost: BlogPost
}

export interface CommentResponse {
    message: string,
    comment: Comment
}

export interface ReportRespose {
    message: string,
    report: Report
}

export interface CodeResponse {
    message: string,
    code: Code
}

export interface BlogPostExtended extends BlogPost {
    comments: Comment[];
    codeTemplates: CodeTemplate[];
}

export interface BlogPostVoteExtended extends BlogPost {
    upvotes: User[];
    downvotes: User[];
}

export interface CommentExtended extends Comment {
    upvotes: User[];
    downvotes: User[]; 
}

export async function getParentBlogPost(blogPostId: string) {
    try {
        return await prisma.blogPost.findUnique({
            where: {
                postId: Number(blogPostId)
            }
        });
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function getParentComment(commentId: string) {
    if (!commentId) {
        return null;
    }

    try {
        return await prisma.comment.findUnique({
            where: {
                commentId: Number(commentId)
            }
        });
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function removeBlogPostUpvote(blogPost: BlogPostVoteExtended, blogPostId: number, userId: number) {
    try {
        await prisma.blogPost.update({
            where: {
                postId: Number(blogPostId)
            },
            data: {
                upvotes: {
                    set: blogPost.upvotes.filter((upvote: User) => upvote.uId !== userId)
                },
                netvote: {
                    decrement: 1
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function removeBlogPostDownvote(blogPost: BlogPostVoteExtended, blogPostId: number, userId: number) {
    try {
        await prisma.blogPost.update({
            where: {
                postId: Number(blogPostId)
            },
            data: {
                downvotes: {
                    set: blogPost.downvotes.filter((downvote: User) => downvote.uId !== userId)
                },
                netvote: {
                    increment: 1
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function upvoteBlogPost(blogPostId: number, userId: number) {
    try {
        await prisma.blogPost.update({
            where: {
                postId: Number(blogPostId)
            },
            data: {
                upvotes: {
                    connect: {
                        uId: userId
                    }
                },
                netvote: {
                    increment: 1
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function downvoteBlogPost(blogPostId: number, userId: number) {
    try {
        await prisma.blogPost.update({
            where: {
                postId: Number(blogPostId)
            },
            data: {
                downvotes: {
                    connect: {
                        uId: userId
                    }
                },
                netvote: {
                    decrement: 1
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function removeCommentUpvote(comment: CommentExtended, commentId: number, userId: number) {
    try {
        await prisma.comment.update({
            where: {
                commentId: Number(commentId)
            },
            data: {
                upvotes: {
                    set: comment.upvotes.filter((upvote: User) => upvote.uId !== userId)
                },
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function removeCommentDownvote(comment: CommentExtended, commentId: number, userId: number) {
    try {
        await prisma.comment.update({
            where: {
                commentId: Number(commentId)
            },
            data: {
                downvotes: {
                    set: comment.downvotes.filter((downvote: User) => downvote.uId !== userId)
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function upvoteComment(commentId: number, userId: number) {
    try {
        await prisma.comment.update({
            where: {
            commentId: Number(commentId)
            },
            data: {
                upvotes: {
                    connect: {
                        uId: userId
                    }
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

export async function downvoteComment(commentId: number, userId: number) {
    try {
        await prisma.comment.update({
            where: {
                commentId: Number(commentId)
            },
            data: {
                downvotes: {
                    connect: {
                        uId: userId
                    }
                }
            }
        });
        return { success: true };
    } catch (error) {
        return { error: (error as Error).message };
    }
}

