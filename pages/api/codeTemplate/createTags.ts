import { NextApiRequest, NextApiResponse } from "next";
import { ErrorResponse } from "@/types";
import { PrismaClient, CodeTemplateTag } from '@prisma/client';

const prisma = new PrismaClient();

export default async function createCodeTemplateTagsHandler(
    req: NextApiRequest, 
    res: NextApiResponse<CodeTemplateTag | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tag } = req.body;
    if (!tag) {
        return res.status(400).json({ error: 'Missing tag' });
    }

    try {
        const codeTemplateTag = await prisma.codeTemplateTag.create({
            data: {
                tag: tag
            }
        });

        return res.status(201).json(codeTemplateTag);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create tags', details: (error as Error).message });
    }
}