import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, CodeTemplate } from '@prisma/client';
import { userAuthentication, TokenPayload, CodeTemplateResponse } from '@/utils';
import { ErrorResponse } from "@/types";

const prisma = new PrismaClient();

export default async function deleteCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse< CodeTemplateResponse | ErrorResponse >
) {
    if (req.method !== 'DELETE') {
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

        if (!codeTemplate) {
            return res.status(404).json({ error: 'Code template not found' });
        } else if (codeTemplate.userId !== (user as TokenPayload).uId) {
            return res.status(403).json({ error: 'You are not authorized to delete this code template' });
        }

        const deletedCodeTemplate = await prisma.codeTemplate.update({
            where: {
                templateId: Number(codeTemplateId)
            },
            data: {
                isDeleted: true
            }
        });
        
        return res.status(200).json({ message: 'Code template deleted successfully', codeTemplate: deletedCodeTemplate, accessToken: user.accessToken });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete code template', details: (error as Error).message });
    }
}