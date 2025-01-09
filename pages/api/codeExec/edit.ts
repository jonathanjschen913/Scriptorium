import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function editCodeExecHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { body, language, stdin, codeTemplateId } = req.body;
    try {
        // Check if codeTemplateId exists
        const codeTemplate = await prisma.codeTemplate.findUnique({
            where: { templateId: Number(codeTemplateId) },
        });

        if (!codeTemplate) {
            return res.status(400).json({ error: 'Invalid codeTemplateId' });
        }

        // Check if codeTemplate has a code object
        if (!codeTemplate.codeId) {
            return res.status(400).json({ error: 'This code template does not have a code object' });
        }

        // Update the code entry in the database
        const code = await prisma.code.update({
            where: { codeId: codeTemplate.codeId },
            data: {
                body,
                language,
                stdin,
            },
        });

        // Respond with the updated code object
        res.status(200).json(code);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } finally {
        await prisma.$disconnect();
    }
}