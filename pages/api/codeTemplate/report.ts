import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Report } from '@prisma/client';
import { userAuthentication, TokenPayload, ReportRespose } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function reportCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse<ReportRespose | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { codeTemplateId, body, contentType } = req.body;
    if (!codeTemplateId) {
        return res.status(400).json({ error: 'Missing code template id' });
    } else if (!body) {
        return res.status(400).json({ error: 'Cannot send empty report' });
    } else if (!contentType) {
        return res.status(400).json({ error: 'Missing content type' });
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
        const report = await prisma.report.create({
            data: {
                body,
                contentType,
                codeTemplateId: Number(codeTemplateId),
                userId: (user as TokenPayload).uId
            }
        });

        return res.status(201).json({ message: 'Report sent successfully', report, accessToken: user.accessToken });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
}