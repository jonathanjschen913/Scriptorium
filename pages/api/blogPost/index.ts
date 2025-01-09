import { NextApiRequest, NextApiResponse } from "next";
import { BlogPost } from "@prisma/client";
import { ErrorResponse } from "@/types";
import { prisma } from "@/utils";

interface BlogPostSearchResponse {
    blogPosts: BlogPost[];
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<BlogPostSearchResponse | ErrorResponse>
) {
    if (req.method === 'GET') {
        const {
            searchTitle,
            searchDescription,
            searchTags,
            wantCodeTemplates,
            searchCodeTemplateTitle,
            sortBy,
            page,
            pageSize,
        } = req.query;
        const pageInt = Number(page) || 1;
        const pageSizeInt = Number(pageSize) || 10;
    
        // Initialize the where object
    const where: {
        title?: { contains: string, mode: "insensitive" };
        description?: { contains: string, mode: "insensitive" };
        tags?: {
            some: {
                tag: { in: string[] };
            };
        };
        codeTemplates?: {
            some: {
                isHidden: boolean;
                isDeleted: boolean;
                title?: { contains: string, mode: "insensitive" }
            }
        };
        isDeleted: boolean;
        isHidden: boolean;
    } = {
        isHidden: false, // Only fetch when isHidden is false
        isDeleted: false, // Only fetch when isDeleted is false
    };


    // Add search criteria conditionally
    if (searchTitle) {
        where.title = {
            contains: Array.isArray(searchTitle) ? searchTitle[0] : searchTitle,
            mode: "insensitive",
        };
    }

    if (searchDescription) {
        where.description = {
            contains: Array.isArray(searchDescription) ? searchDescription[0] : searchDescription,
            mode: "insensitive"
        };
    }

    if (searchTags) {
        where.tags = {
            some: {
                tag: {
                    in: Array.isArray(searchTags) ? searchTags : [searchTags],
                },
            },
        };
    }
    
    
    if (wantCodeTemplates) {
        where.codeTemplates = {
            some: {
                isHidden: false,
                isDeleted: false,
                ...(searchCodeTemplateTitle && {
                    title: {
                        contains: Array.isArray(searchCodeTemplateTitle) ? searchCodeTemplateTitle[0] : searchCodeTemplateTitle,
                        mode: "insensitive"
                    },
                }),
            },
        };
    }

        try {
            let blogPosts: BlogPost[] = [];
            if (sortBy) {
                if (sortBy === "asc" || sortBy === "desc") {
                    blogPosts = await prisma.blogPost.findMany({
                        where,
                        orderBy: {
                            netvote: sortBy,
                        },
                        skip: (pageInt - 1) * pageSizeInt, // Skip records based on the page number
                        take: pageSizeInt, // Limit the number of records to pageSize
                        include: {
                            author: {
                                select: {
                                    username: true,
                                    avatar: true,
                                },
                            },
                            upvotes: true,
                            downvotes: true,
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
                                },
                            },
                            tags: true,
                        },
                    });
                }
            } else {
                blogPosts = await prisma.blogPost.findMany({
                    where,
                    orderBy: {
                        createdAt: 'desc',
                    },
                    skip: (pageInt - 1) * pageSizeInt, // Skip records based on the page number
                    take: pageSizeInt, // Limit the number of records to pageSize
                    include: {
                        author: {
                            select: {
                                username: true,
                                avatar: true,
                            },
                        },
                        upvotes: true,
                        downvotes: true,
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
                            },
                        },
                        tags: true,
                    },
                });
            }

            // Optionally get total count for frontend to show total pages
            const totalPosts = await prisma.blogPost.count({
                where,
            });

            return res.status(200).json({
                blogPosts,
                currentPage: pageInt,
                pageSize: pageSizeInt,
                totalPages: Math.ceil(totalPosts / pageSizeInt),
                totalItems: totalPosts,
            });
        } catch (error) {
            return res.status(500).json({ error: 'Failed to search blog post', details: (error as Error).message });
        }
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
