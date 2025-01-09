import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, ReportRespose } from '@/utils';
import { PrismaClient, Report } from '@prisma/client';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function reportCommentHandler(
    req: NextApiRequest, 
    res: NextApiResponse< ReportRespose | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    const { commentId, body, contentType } = req.body;
    if (!commentId) {
        return res.status(400).json({ error: 'Missing comment id' });
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
                commentId: Number(commentId),
                userId: (user as TokenPayload).uId
            }
        });
    
        return res.status(200).json({ message: 'Report sent successfully', report, accessToken: user.accessToken });
    } catch (error) {
        return res.status(500).json({ error: 'Unable to send report', details: (error as Error).message });
    }
}