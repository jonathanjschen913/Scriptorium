import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient, CodeTemplate, BlogPost } from '@prisma/client';
import { userAuthentication, TokenPayload, CodeTemplateResponse } from '@/utils';
import { ErrorResponse } from "@/types";

const prisma = new PrismaClient();

export default async function createCodeTemplateHandler(
    req: NextApiRequest, 
    res: NextApiResponse< CodeTemplateResponse | ErrorResponse>
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { title, explanation, language, tags } = req.body;
    if (!title || !explanation || !language) {
        return res.status(400).json({ error: 'Missing required fields' });
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
        const newCodeTemplate = await prisma.codeTemplate.create({
            data: {
                title,
                explanation,
                language,
                userId: (user as TokenPayload).uId,
                tags: {
                    connect: tags.map((tag: string) => ({ tag: tag }))
                }
            },
        });

        return res.status(201).json({ message: "Code template created successfully", codeTemplate: newCodeTemplate, accessToken: user.accessToken });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create code template', details: (error as Error).message });
    }
}