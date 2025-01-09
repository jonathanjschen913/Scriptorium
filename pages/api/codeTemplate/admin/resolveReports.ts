import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Report } from '@prisma/client';
import { userAuthentication, TokenPayload, ReportRespose } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function resolveReportsHandler(
    req: NextApiRequest, 
    res: NextApiResponse<ReportRespose | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { codeTemplateId, reportId } = req.body;
    if (!codeTemplateId || !reportId) {
        return res.status(400).json({ error: 'Missing codeTemplateId or reportId' });
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
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                templateId: Number(codeTemplateId)
            }
        });

        if (!codeTemplate) {
            return res.status(404).json({ error: 'Code template not found' });
        }

        const report = await prisma.report.findUnique({
            where: {
                reportId: Number(reportId)
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'No reports found' });
        }

        if (codeTemplate.templateId !== report.codeTemplateId) {
            return res.status(400).json({ error: 'Report does not belong to this code template' });
        }

        const resolvedReport = await prisma.report.update({
            where: {
                reportId: Number(reportId)
            },
            data: {
                isResolved: true
            }
        });

        return res.status(200).json({ message: 'Report resolved', report: resolvedReport });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
}