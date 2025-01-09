import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Report } from '@prisma/client';
import { userAuthentication, TokenPayload, ReportSearchResponse } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function searchReportsHandler(
    req: NextApiRequest, 
    res: NextApiResponse<ReportSearchResponse | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    /* User authorization and authentication */
    const user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    }

    if ((user as TokenPayload).role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can resolve reports' });
    }
    /* End of user authorization and authentication */

    const { searchCodeTemplateId, searchUserId, isResolved, page = 1, pageSize = 10 } = req.body;
    const pageInt = Number(page) || 1;
    const pageSizeInt = Number(pageSize) || 10;

    // Initialize the where object
    let where: {
        codeTemplateId?: number | { not: null },
        userId?: number,
        isResolved?: boolean
    } = {
        codeTemplateId: {
            not: null
        }
    };

    // Add search criteria conditionally
    if (searchCodeTemplateId) {
        where.codeTemplateId = Number(searchCodeTemplateId);
    }

    if (searchUserId) {
        where.userId = Number(searchUserId);
    }

    if (isResolved !== null && isResolved !== undefined) {
        where.isResolved = isResolved;
    }

    try {
        const reports = await prisma.report.findMany({
            where,
            take: pageSizeInt,
            skip: (pageInt - 1) * pageSizeInt
        });

        const totalReports = await prisma.report.count({ 
            where 
        });

        return res.status(200).json({
            reports,
            currentPage: pageInt,
            totalPages: Math.ceil(totalReports/ pageSizeInt),
            totalReports: totalReports
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to search reports', details: (error as Error).message });
    }
}