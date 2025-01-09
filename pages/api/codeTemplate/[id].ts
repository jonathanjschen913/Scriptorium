import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, CodeTemplate } from '@prisma/client';
import { ErrorResponse } from "@/types";

const prisma = new PrismaClient();

export default async function showCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse<CodeTemplate | ErrorResponse>
) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    } 
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Missing code template id' });
    }

    try {
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: {
                templateId: Number(id)
            },
            include: {
                author : {
                    select: {
                        username: true,
                        avatar: true
                    }
                },
                tags: true,
                forks: true,
                code: true
            }
        });

        if (!codeTemplate || codeTemplate.isDeleted || codeTemplate.isHidden) { 
            return res.status(404).json({ error: 'Code template not found' });
        }

        return res.status(200).json(codeTemplate);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to show code template', details: (error as Error).message });
    }
}