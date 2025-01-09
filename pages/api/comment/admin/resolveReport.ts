import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Report } from '@prisma/client';
import { userAuthentication, TokenPayload, ReportRespose } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function resolveReportHandler(
    req: NextApiRequest, 
    res: NextApiResponse<ReportRespose | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { commentId, reportId, wantResolved } = req.body;
    if (!commentId || !reportId) {
        return res.status(400).json({ error: 'Missing commentId or reportId' });
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
    
    try {
        const comment = await prisma.comment.findUnique({
            where: {
                commentId: Number(commentId),
            },
        });

        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const report = await prisma.report.findUnique({
            where: {
                reportId: Number(reportId),
            },
        });
    
        if (!report) {
            return res.status(404).json({ error: 'Report not found' });
        }

        if (comment.commentId !== report.commentId) {
            return res.status(400).json({ error: 'Report does not belong to this comment' });
        }
    
        const resolvedReport = await prisma.report.update({
            where: {
                reportId: reportId,
            },
            data: {
                isResolved: wantResolved,
            },
        });
    
        return res.status(200).json({ message: `Report ${wantResolved ? 'resolved' : 'unresolved'} successful`, report: resolvedReport});
    } catch (error) {
        return res.status(500).json({ error: 'Unable to resolve report', details: (error as Error).message });
    }
}