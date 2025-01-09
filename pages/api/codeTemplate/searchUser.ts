import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, CodeTemplate } from '@prisma/client';
import { userAuthentication, TokenPayload } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

interface CodeTemplateSearchResponse {
    codeTemplates: CodeTemplate[],
    currentPage: number,
    totalPages: number,
    totalTemplates: number
}

export default async function searchUserCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse<CodeTemplateSearchResponse | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    /* User authorization and authentication */
    const user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    }
    /* End of user authorization and authentication */
    
    const { userId, searchTitle, searchExplanation, searchLanguage, searchTags, page, pageSize } = req.body;
    const pageInt = Number(page) || 1;
    const pageSizeInt = Number(pageSize) || 10;

    if (userId !== (user as TokenPayload).uId) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    // Initialize the where object
    const where: {
        userId: number,
        title?: { contains: string },
        explanation?: { contains: string },
        language?: { equals: string },
        tags?: { some: { tag: { in: string[] } } }
        isDeleted: boolean,
        isHidden: boolean,
    } = {
        userId: userId, // Fetch only code templates created by the user
        isDeleted: false, // Only fetch when isDeleted is false
        isHidden: false, // Only fetch when isHidden is false
    };

    // Add search criteria conditionally
    if (searchTitle) {
        where.title = {
            contains: searchTitle
        };
    }

    if (searchExplanation) {
        where.explanation = {
            contains: searchExplanation
        };
    }

    if (searchLanguage) {
        where.language = {
            equals: searchLanguage
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
            skip: (pageInt - 1) * pageSizeInt, // Skip records based on the page number
            take: pageSizeInt, // Limit the number of records to pageSize
        });

        const totalCodeTemplates = await prisma.codeTemplate.count({ 
            where 
        });

        return res.status(200).json({
            codeTemplates,
            currentPage: pageInt,
            totalPages: Math.ceil(totalCodeTemplates / pageSizeInt),
            totalTemplates: totalCodeTemplates,
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to search code templates', details: (error as Error).message });
    }
}