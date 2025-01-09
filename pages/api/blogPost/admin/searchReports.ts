import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, ReportSearchResponse, prisma } from '@/utils';
import { ErrorResponse } from '@/types';


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

    const { searchBlogPostId, searchUserId, searchUnresolved, page, pageSize } = req.body;
    const pageInt = Number(page) || 1;
    const pageSizeInt = Number(pageSize) || 10;

    let where: {
        blogPostId?: number | { not: null },
        userId?: number,
        resolved?: boolean
    } = {
        blogPostId: {
            not: null,
        },
    };

    if (searchBlogPostId) {
        where.blogPostId = Number(searchBlogPostId);
    }

    if (searchUserId) {
        where.userId = Number(searchUserId);
    }

    if (searchUnresolved) {
        where.resolved = false;
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
            totalPages: Math.ceil(totalReports / pageSizeInt),
            totalReports
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to search reports', details: (error as Error).message });
    }
}