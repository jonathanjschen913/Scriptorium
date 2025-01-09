import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, CodeTemplate } from '@prisma/client';
import { userAuthentication, TokenPayload, CodeTemplateResponse } from '@/utils';
import { ErrorResponse } from '@/types';

const prisma = new PrismaClient();

export default async function hideCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse<CodeTemplateResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { codeTemplateId, wantHidden } = req.body;
    if (!codeTemplateId) {
        return res.status(400).json({ error: 'Missing code template ID' });
    }

    /* User authorization and authentication */
    const user = await userAuthentication(req.headers.authorization, req.headers['refresh-token']);
    if ("error" in user) {
        return res.status(401).json({ error: 'User not authenticated', details: user.error });
    }

    if ((user as TokenPayload).role !== 'ADMIN') {
        return res.status(403).json({ error: 'Only admins can hide comments' });
    }
    /* End of user authorization and authentication */

    try {
        const hiddenCodeTemplate = await prisma.codeTemplate.update({
            where: {
                templateId: Number(codeTemplateId)
            },
            data: {
                isHidden: wantHidden
            }
        });

        return res.status(200).json({ message: `Code template ${wantHidden ? 'hidden' : 'unhidden'} successful`, codeTemplate: hiddenCodeTemplate });
    } catch (error) {
        return res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
    }
}