import { NextApiRequest, NextApiResponse } from 'next';
import { userAuthentication, TokenPayload, ReportRespose, prisma } from '@/utils';
import { ErrorResponse } from '@/types';

export default async function resolveReportsHandler(
    req: NextApiRequest, 
    res: NextApiResponse<ReportRespose | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { blogPostId, reportId, wantResolved } = req.body;
    if (!blogPostId || !reportId) {
        return res.status(400).json({ error: 'Missing blog post id' });
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
        const blogPost = await prisma.blogPost.findUnique({
            where: {
                postId: Number(blogPostId)
            }
        });

        if (!blogPost) {
            return res.status(404).json({ error: 'Blog post not found' });
        }

        const report = await prisma.report.findUnique({
            where: {
                reportId: Number(reportId)
            }
        });

        if (!report) {
            return res.status(404).json({ error: 'No reports found' });
        }

        if (blogPost.postId !== report.blogPostId) {
            return res.status(400).json({ error: 'Report does not belong to this blog post' });
        }

        const resolvedReport = await prisma.report.update({
            where: {
                reportId: Number(reportId)
            },
            data: {
                isResolved: wantResolved
            }
        });

        return res.status(200).json({ message: `Report ${wantResolved ? 'resolved': 'unresolved'} successful`, report: resolvedReport });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to resolve reports', details: (error as Error).message });
    }
}