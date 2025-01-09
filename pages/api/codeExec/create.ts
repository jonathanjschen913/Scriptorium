import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function createCodeHandler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
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

        // Check if codeTemplate already has a code object
        if (codeTemplate.codeId) {
            return res.status(400).json({ error: 'This code template already has a code object' });
        }

        // Generate a unique file path based on the newCode ID
        const fileName = `code_${Date.now()}.${getFileExtension(language)}`;
        const filePath = path.join(process.cwd(), 'generated/code', fileName);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        // Save code to file
        fs.writeFileSync(filePath, body, 'utf8');

        // Create the code entry in the database
        const code = await prisma.code.create({
            data: {
                body,
                language,
                stdin,
                path: filePath,
                codeTemplateId: Number(codeTemplateId), // Cast codeTemplateId to number
            },
        });

        // Update the CodeTemplate's codeId field
        await prisma.codeTemplate.update({
            where: { templateId: Number(codeTemplateId) },
            data: { codeId: code.codeId },
        });

        // Respond with the created code object
        res.status(201).json(code);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
        await prisma.$disconnect();
    }
}

function getFileExtension(language: string): string {
    switch (language) {
        case 'c':
            return 'c';
        case 'c++':
            return 'cpp';
        case 'java':
            return 'java';
        case 'python':
            return 'py';
        case 'javaScript':
            return 'js';
        case 'ruby':
            return 'rb';
        case 'go':
            return 'go';
        case 'rust':
            return 'rs';
        case 'php':
            return 'php';
        case 'perl':
            return 'pl';
        case 'swift':
            return 'swift';
        case 'typescript':
            return 'ts';
        case 'scala':
            return 'scala';
        case 'r':
            return 'r';
        default:
            throw new Error('Unsupported language');
    }
}
