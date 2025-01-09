import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function deleteCodeExecHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    const { codeTemplateId } = req.body;
    if (!codeTemplateId) {
        return res.status(400).json({ error: 'codeTemplateId is required' });
    }
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
        // Disconnect the code object from the codeTemplate
        const updatedCodeTemplate = await prisma.codeTemplate.update({
            where: { templateId: Number(codeTemplateId) },
            data: { codeId: null },
        });
        // Respond with the updated codeTemplate object
        res.status(200).json(updatedCodeTemplate);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
        await prisma.$disconnect();
    }
}
