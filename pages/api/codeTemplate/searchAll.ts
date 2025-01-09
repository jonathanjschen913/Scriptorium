import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, CodeTemplate } from '@prisma/client';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

interface CodeTemplateSearchResponse {
    codeTemplates: CodeTemplate[],
    currentPage: number,
    totalPages: number,
    totalTemplates: number
}

export default async function searchAllCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse<CodeTemplateSearchResponse | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    } 

    const { searchTitle, searchExplanation, searchLanguage, searchTags, page, pageSize } = req.query;
    const pageInt = Number(page) || 1;
    const pageSizeInt = Number(pageSize) || 10;

    // Initialize the where object
    const where: {
        title?: { contains: string, mode: "insensitive" },
        explanation?: { contains: string, mode: "insensitive" },
        language?: { equals: string },
        tags?: { some: { tag: { in: string[] } } }
        isDeleted: boolean,
        isHidden: boolean,
    } = {
        isDeleted: false, // Only fetch when isDeleted is false
        isHidden: false, // Only fetch when isHidden is false
    };

    // Add search criteria conditionally
    if (searchTitle) {
        where.title = {
            contains: Array.isArray(searchTitle) ? searchTitle.join(' ') : searchTitle,
            mode: "insensitive"
        };
    }

    if (searchExplanation) {
        where.explanation = {
            contains: Array.isArray(searchExplanation) ? searchExplanation.join(' ') : searchExplanation,
            mode: "insensitive"
        };
    }

    if (searchLanguage) {
        where.language = {
            equals: Array.isArray(searchLanguage) ? searchLanguage.join(' ') : searchLanguage
        };
    }

    if (searchTags && Array.isArray(searchTags)) {
        where.tags = {
            some: {
                tag: {
                    in: searchTags 
                },
            },
        };
    }

    try {
        const codeTemplates = await prisma.codeTemplate.findMany({
            where,
            include: {
                tags: true,
                forks: true,
                author: {
                    select: {
                        username: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
            skip: (pageInt - 1) * pageSizeInt, // Skip records based on the page number
            take: pageSizeInt, // Limit the number of records to pageSize
        });

        const totalCodeTemplates = await prisma.codeTemplate.count({ 
            where 
        });

        return res.status(200).json({
            codeTemplates,
            currentPage: pageInt,
            totalPages: Math.ceil(totalCodeTemplates/ pageSizeInt),
            totalTemplates: totalCodeTemplates,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to search code templates', details: (error as Error).message });
    }
}