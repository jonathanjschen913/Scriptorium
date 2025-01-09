import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, CodeTemplate } from '@prisma/client';
import { userAuthentication, TokenPayload, CodeTemplateResponse } from '@/utils';
import { ErrorResponse } from "@/types";

const prisma = new PrismaClient();

export default async function forkCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse< CodeTemplateResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { codeTemplateId } = req.query;
    if (!codeTemplateId) {
        return res.status(400).json({ error: 'Missing code template id' });
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
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                templateId: Number(codeTemplateId)
            }
        });

        if (!codeTemplate || codeTemplate.isDeleted || codeTemplate.isHidden) {
            return res.status(404).json({ error: 'Code template not found' });
        }

        const newCodeTemplate = await prisma.codeTemplate.create({
            data: {
                userId: (user as TokenPayload).uId,
                title: codeTemplate.title,
                explanation: codeTemplate.explanation,
                language: codeTemplate.language,
                forkedFromId: codeTemplate.templateId
            }
        });

        if (!newCodeTemplate) {
            return res.status(500).json({ error: 'Failed to fork code template' });
        }

        return res.status(201).json({ message: 'Code template forked successfully', codeTemplate: newCodeTemplate, accessToken: user.accessToken });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fork code template', details: (error as Error).message });
    }
}
